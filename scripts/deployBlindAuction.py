from brownie import convert, web3, config, network, accounts, BlindAuction
from scripts.helpful_scripts import get_account, update_front_end, LOCAL_BLOCKCHAIN_ENVIRONMENTS

import time
from eth_account.messages import encode_defunct

# 1h
bidding_time = 60*60
reveal_time = 60*60


def main():
    blindAuction = deploy_blindAuction(bidding_time, reveal_time)
    # call_blindAuction(blindAuction)
    #end_blindAuction(bidding_time, blindAuction)


def deploy_blindAuction(bidding_time, reveal_time):
    alice = get_account()
    print("Alice deploy BlindAuction contract...")
    blindAuction = BlindAuction.deploy(
        bidding_time, reveal_time, alice.address, {"from": alice})
    if (config["networks"][network.show_active(
    )]["update_frontend"] == True):
        update_front_end()
    print(f"Deployed BlindAuction contract at {blindAuction}")
    return blindAuction


def user_bid(_ba, _user, _amount, _values, _fakes, _secrets):
    sk = web3.solidityKeccak(["uint256", "bool", "bytes32"], [
                             convert.to_uint(_values, "uint256"), convert.to_bool(_fakes), web3.toHex(convert.to_bytes(_secrets, "bytes32"))])
    print(f"{_user} bid for {_amount}...")
    print(sk.hex())
    tx = _ba.bid(sk.hex(), {"from": _user, "amount": _amount})
    tx.wait(1)
    print(f"{_user} bidded for {_amount}!")


def user_reveal(_ba, _user, _values, _fakes, _secrets):
    print(f"{_user} reveal his bids...")
#    tx = _ba.reveal(_values, _fakes, _secrets, {
#                    "from": _user, "gas_limit": 6721975, "allow_revert": True})
    tx = _ba.reveal(_values, _fakes, _secrets, {
                    "from": _user, "allow_revert": True})

    tx.wait(1)
    print(f"{_user} revealed his bids!")


def call_blindAuction(blindAuction):
    alice = get_account()
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        bob = get_account(index=1)
    else:
        bob = get_account(id="m2")

    print_values(alice, bob)
    # Alice's bids
    alice_values = [1, 2, 3]
    alice_fakes = [True, False, True]
    alice_secrets = ["secret1".encode(
        "utf-8"), "secret2".encode("utf-8"), "secret3".encode("utf-8")]
    user_bid(blindAuction, alice, "1 gwei",
             alice_values[0], alice_fakes[0], alice_secrets[0])
    return
    user_bid(blindAuction, alice, "2 gwei",
             alice_values[1], alice_fakes[1], alice_secrets[1])
    user_bid(blindAuction, alice, "3 gwei",
             alice_values[2], alice_fakes[2], alice_secrets[2])
    print_values(alice, bob)

    # Bob's bids
    bob_values = [4, 5]
    bob_fakes = [False, True]
    bob_secrets = ["bob4".encode("utf-8"), "bob5".encode("utf-8")]
    user_bid(blindAuction, bob, "3 gwei",
             bob_values[0], bob_fakes[0], bob_secrets[0])
    user_bid(blindAuction, bob, "4 gwei",
             bob_values[1], bob_fakes[1], bob_secrets[1])
    print_values(alice, bob)

    print(
        f"Waiting {bidding_time} seconds in order to enter to reveal time...")
    time.sleep(bidding_time)
    # Alice reveals his bids
    user_reveal(blindAuction, alice, alice_values, alice_fakes, alice_secrets)
    # Bob reveals his bids
    user_reveal(blindAuction, bob, bob_values, bob_fakes, bob_secrets)

    print(
        f"Waiting {reveal_time} seconds in order to end the auction...")
    time.sleep(reveal_time)

    # Alice and Bob call withdraw()
    print("Alice calls withdraw()...")
    tx = blindAuction.withdraw({"from": alice})
    tx.wait(1)
    print_values(alice, bob)
    print("Bob calls withdraw()...")
    tx = blindAuction.withdraw({"from": bob})
    tx.wait(1)
    print_values(alice, bob)


def end_blindAuction(bidding_time, blindAuction):
    alice = get_account()
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        bob = get_account(index=1)
    else:
        bob = get_account(id="m2")

    # Alice calls auctionEnd()
    print("Alice calls auctionEnd()...")
    tx = blindAuction.auctionEnd({"from": alice})
    tx.wait(1)
    print("Auction ended")
    print_values(alice, bob)


def print_values(_alice, _bob):
    a_bal = web3.fromWei(_alice.balance(), "gwei")
    b_bal = web3.fromWei(_bob.balance(), "gwei")
    print(f"Alice's balance is {a_bal} gwei")
    print(f"Bob's balance is {b_bal} gwei")
