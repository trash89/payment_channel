from brownie import accounts, config, UniDirectionalPaymentChannel, web3
from eth_account.messages import encode_defunct


def main():
    alice = accounts[0]
    bob = accounts[1]
    # Alice deploys and funds UniDirectionalPaymentChannel smart contract with Ether. This “opens” the payment channel.
    value = web3.toWei(2, "ether")
    print(
        f"Alice deploys UniDirectionalPaymentChannel contract with Bob address as receiver and funds it with {value} wei...")

    udpc_contract = UniDirectionalPaymentChannel.deploy(
        bob.address,  {"from": alice, "value": value})
    print(f"    SimplePaymentChannel deployed at {udpc_contract}")
    print_values()

    priv_key = config["wallets"]["from_key"]
    # Alice signs messages that specify how much of that Ether is owed to the recipient. This step is repeated for each payment.
    # encoding arguments for preparing sign_message
    # so it signs a message saying that Bob can claim 1 ether
    bob_value = web3.toWei(1, "ether")
    # using of solidityKeccak function to encode values like Solidity does
    # we encode the contract address and the value
    sk = web3.solidityKeccak(
        ["address", "uint256"], [udpc_contract.address, bob_value])

    message = encode_defunct(hexstr=sk.hex())
    # sign the message with the private key of Alice (a[0])
    signed_message = web3.eth.account.sign_message(
        message, private_key=priv_key)
    # Bob “closes” the payment channel, withdrawing his portion of the Ether and sending the remainder back to the sender.
    print("Bob claiming his payment, presenting the message signed by Alice")
    tx = udpc_contract.close(
        bob_value, signed_message.signature, {"from": bob})
    tx.wait(1)
    print_values()

    print("Alice destroy the contract and reclaim the leftover funds.")
    tx = udpc_contract.cancel({"from": alice})
    tx.wait(1)
    print_values()


def print_values():
    bal_a0 = web3.fromWei(accounts[0].balance(), "ether")
    print(f"    (Alice) is {accounts[0].address}, balance is {bal_a0}")
    bal_a1 = web3.fromWei(accounts[1].balance(), "ether")
    print(f"    (Bob) is {accounts[1].address}, balance is {bal_a1}")
    bal_udpc = web3.fromWei(
        UniDirectionalPaymentChannel[-1].balance(), "ether")
    print(
        f"    Contract UniDirectionalPaymentChannel is {UniDirectionalPaymentChannel[-1].address}, balance is {bal_udpc}")
