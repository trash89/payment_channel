from brownie import web3, config, network, SimplePaymentChannel
from scripts.helpful_scripts import get_account, update_front_end, LOCAL_BLOCKCHAIN_ENVIRONMENTS
import time


def main():
    value = web3.toWei(2, "gwei")
    duration = 7*24*60*60
    alice = get_account()
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        bob = get_account(index=1)
    else:
        bob = get_account(id="m2")

    simplePaymentChannel = deploy_simplePaymentChannel(
        alice, bob, duration, value)


def deploy_simplePaymentChannel(who_deploys, recipient, duration, value):
    alice = get_account()
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        bob = get_account(index=1)
    else:
        bob = get_account(id="m2")
    print("Alice deploy SimplePaymentChannel contract...")
    simplePaymentChannel = SimplePaymentChannel.deploy(
        recipient, duration, {"from": who_deploys, "value": value})
    update_frontend_flag = config["networks"][network.show_active(
    )]["update_frontend"]
    if (update_frontend_flag == True):
        update_front_end()
    print(f"Deployed SimplePaymentChannel contract at {simplePaymentChannel}")
    return simplePaymentChannel
