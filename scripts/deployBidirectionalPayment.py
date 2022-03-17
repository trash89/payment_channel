from brownie import accounts, chain, config, web3, BiDirectionalPaymentChannel
from eth_account.messages import encode_defunct


def main():
    alice = accounts[0]
    bob = accounts[1]
    alice_key = config["wallets"]["alice_key"]
    bob_key = config["wallets"]["bob_key"]
    users = [alice.address, bob.address]
    balance_alice = web3.toWei(1, "ether")
    balance_bob = web3.toWei(2, "ether")
    balances = [balance_alice, balance_bob]
    _nonce = 1
    duration = 1*24*60*60
    expiresAt = chain[web3.eth.blockNumber].timestamp+duration
    challengePeriod = 1*24*60*60
    # Alice deploys and funds BiDirectionalPaymentChannel smart contract with Ether. This “opens” the payment channel.
    value_bdpc = web3.toWei(3, "ether")
    print(
        f"Alice deploys BiDirectionalPaymentChannel contract with Bob address as receiver and funds it with {value_bdpc} wei...")

    bdpc_contract = BiDirectionalPaymentChannel.deploy(
        users, balances, expiresAt, challengePeriod,  {"from": alice, "value": value_bdpc})
    print(f"    BiDirectionalPaymentChannel deployed at {bdpc_contract}")
    print_values()
    print("Alice funds the contract...with 1 ether")
    alice.transfer(bdpc_contract.address, amount="1 ether")

    print("Bob funds the contract...with 2 ether")
    bob.transfer(bdpc_contract.address, amount="2 ether")
    print_values()

    alice_signed_message = sign_a_message(
        bdpc_contract.address, balance_bob, _nonce,  alice_key)
    bob_signed_message = sign_a_message(
        bdpc_contract.address, balance_alice, _nonce, bob_key)

    _signatures = [bob_signed_message.signature,
                   alice_signed_message.signature]
    _users = [bob.address, alice.address]
    ret = bdpc_contract.verify(
        _signatures, bdpc_contract.address, _users, balances, _nonce, {"from": bob})
    print(f"Verify signatures : {ret}")
    print_values()
    tx = bdpc_contract.withdraw({"from": bob})
    tx = bdpc_contract.withdraw({"from": alice})
    print_values()


def sign_a_message(bpca_address, msg_value, _nonce, priv_key):
    sk = web3.solidityKeccak(
        ["address", "uint256", "uint256"], [bpca_address, msg_value, _nonce])
    message = encode_defunct(hexstr=sk.hex())
    signed_message = web3.eth.account.sign_message(
        message, private_key=priv_key)
    return signed_message


def print_values():
    bal_a0 = web3.fromWei(accounts[0].balance(), "ether")
    print(f"    (Alice) is {accounts[0].address}, balance is {bal_a0}")
    bal_a1 = web3.fromWei(accounts[1].balance(), "ether")
    print(f"    (Bob) is {accounts[1].address}, balance is {bal_a1}")
    bal_bdpc = web3.fromWei(
        BiDirectionalPaymentChannel[-1].balance(), "ether")
    print(
        f"    Contract BiDirectionalPaymentChannel is {BiDirectionalPaymentChannel[-1].address}, balance is {bal_bdpc}")
