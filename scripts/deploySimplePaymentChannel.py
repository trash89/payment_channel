from brownie import accounts, config, SimplePaymentChannel, web3
from eth_account.messages import encode_defunct


def main():
    alice = accounts[0]
    bob = accounts[1]
    # Alice deploys and funds SimplePaymentChannel smart contract with Ether. This “opens” the payment channel.
    value = web3.toWei(2, "ether")
    duration = 7*24*60*60
    print(
        f"Alice deploys SimplePaymentChannel contract and funds it with {value} wei...for a duration of 7 days")

    spc_contract = SimplePaymentChannel.deploy(
        bob.address, duration, {"from": alice, "value": value})
    print(f"    SimplePaymentChannel deployed at {spc_contract}")
    print_values()

    # getting the nonce of the Alice account, to sign the message with it
    nonce = alice.nonce
    priv_key = config["wallets"]["from_key"]
    # Alice signs messages that specify how much of that Ether is owed to the recipient. This step is repeated for each payment.
    # encoding arguments for preparing sign_message
    # so it signs a message saying that Bob can claim 1 ether
    bob_value = web3.toWei(1, "ether")
    # using of solidityKeccak function to encode values like Solidity does
    sk = web3.solidityKeccak(
        ["address", "uint256"], [spc_contract.address, bob_value])
    message = encode_defunct(hexstr=sk.hex())
    # sign the message with the private key of Alice (a[0])
    signed_message = web3.eth.account.sign_message(
        message, private_key=priv_key)
    # Bob “closes” the payment channel, withdrawing his portion of the Ether and sending the remainder back to the sender.
    print("Bob claiming his payment, presenting the message signed by Alice")
    tx = spc_contract.close(bob_value, signed_message.signature, {"from": bob})
    tx.wait(1)
    print_values()

    print("Alice destroy the contract and reclaim the leftover funds.")
    tx = spc_contract.claimTimeout({"from": alice})
    tx.wait(1)
    print_values()


def print_values():
    bal_a0 = web3.fromWei(accounts[0].balance(), "ether")
    print(f"    (Alice) is {accounts[0].address}, balance is {bal_a0}")
    bal_a1 = web3.fromWei(accounts[1].balance(), "ether")
    print(f"    (Bob) is {accounts[1].address}, balance is {bal_a1}")
    bal_spc = web3.fromWei(SimplePaymentChannel[-1].balance(), "ether")
    print(
        f"    Contract SimplePaymentChannel is {SimplePaymentChannel[-1].address}, balance is {bal_spc}")
