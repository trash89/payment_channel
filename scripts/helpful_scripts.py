from brownie import accounts, network, config
import shutil
import os
import yaml
import json
from web3 import Web3

LOCAL_BLOCKCHAIN_ENVIRONMENTS = [
    "development",
    "ganache",
    "hardhat",
    "local-ganache",
    "mainnet-fork",
    "hh-local",
    "hh1-local"
]


def get_account(index=None, id=None):
    if index:
        return accounts[index]
    if network.show_active() in LOCAL_BLOCKCHAIN_ENVIRONMENTS:
        return accounts[0]
    if id:
        return accounts.load(id)
    if network.show_active() in config["networks"]:
        return accounts.add(config["wallets"]["from_key"])
    return None


def update_front_end():
    print("Updating front end...")
    clientFolders = ["./client"]
    for client in clientFolders:
        print(f"Updating client : {client}...")
        copy_folders_to_front_end(
            "./build/brownie/contracts", client+"/src/chain-info")
        # copy_folders_to_front_end("./contracts", client+"/src/contracts")
        copy_files_to_front_end(
            "./build/brownie/deployments/map.json",
            client+"/src/chain-info/map.json",
        )
        with open("brownie-config.yaml", "r") as brownie_config:
            config_dict = yaml.load(brownie_config, Loader=yaml.FullLoader)
            with open(client+"/src/brownie-config-json.json", "w") as brownie_config_json:
                json.dump(config_dict, brownie_config_json)
    print("Front end updated!")

    # The ERC20
    # copy_files_to_front_end(
    #     "./build/brownie/contracts/dependencies/OpenZeppelin/openzeppelin-contracts@4.3.2/ERC20.json",
    #     "./client/src/chain-info/ERC20.json",
    # )


def copy_folders_to_front_end(src, dest):
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copytree(src, dest)


def copy_files_to_front_end(src, dest):
    if os.path.exists(dest):
        shutil.rmtree(dest)
    shutil.copyfile(src, dest)
