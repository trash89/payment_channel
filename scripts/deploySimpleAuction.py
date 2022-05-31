from brownie import config, network, SimpleAuction
from scripts.helpful_scripts import get_account, update_front_end, LOCAL_BLOCKCHAIN_ENVIRONMENTS
import time


def main():
    bidding_time = 60*60  # 1h

    simpleAuction = deploy_simpleAuction(bidding_time)
    # call_simpleAuction(simpleAuction)
    # end_simpleAuction(bidding_time, simpleAuction)


def deploy_simpleAuction(bidding_time):
    alice = get_account()
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        bob = get_account(index=1)
    else:
        bob = get_account(id="m2")
    print("Alice deploy SimpleAuction contract...")
    simpleAuction = SimpleAuction.deploy(
        bidding_time, alice.address, {"from": alice})
    update_frontend_flag = config["networks"][network.show_active(
    )]["update_frontend"]
    if (update_frontend_flag == True):
        update_front_end()
    print(f"Deployed SimpleAuction contract at {simpleAuction}")
    return simpleAuction


def call_simpleAuction(simpleAuction):
    alice = get_account()
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        bob = get_account(index=1)
    else:
        bob = get_account(id="m2")

    print("Alice bid for 1 gwei...")
    tx = simpleAuction.bid({"from": alice, "amount": "1 gwei"})
    tx.wait(1)
    print("Alice bided for 1 gwei")

    print("Bob bid for 2 gwei...")
    tx = simpleAuction.bid({"from": bob, "amount": "2 gwei"})
    tx.wait(1)
    print("Bob bided for 2 gwei")

    print("Alice withdraw her bid...")
    tx = simpleAuction.withdraw({"from": alice})
    tx.wait(1)
    print(f"Alice withdrawed() her bid? {tx.return_value}")


def end_simpleAuction(bidding_time, simpleAuction):
    alice = get_account()
    print(f"Waiting {bidding_time} seconds in order to finish the auction...")
    time.sleep(bidding_time)
    print("Alice calls auctionEnd()...")
    tx = simpleAuction.auctionEnd({"from": alice})
    tx.wait(1)
    print("Alice called auctionEnd()")
