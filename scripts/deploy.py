from brownie import accounts, web3, chain, config, MultiSigWallet, BiDirectionalPaymentChannel, PredictBPCAddress
from eth_account.messages import encode_defunct


def main():
    # Opening a channel
    # 1. Alice and Bob fund a multi-sig wallet
    # 2. Precompute payment channel address
    # 3. Alice and Bob exchanges signatures of initial balances
    # 4. Alice and Bob creates a transaction that can deploy a payment channel from
    #    the multi-sig wallet

    # 1. Alice deploys multi-sig wallet and Alice and Bob fund multi-sig wallet
    alice = accounts[0]
    bob = accounts[1]
    alice_key = config["wallets"]["alice_key"]
    bob_key = config["wallets"]["bob_key"]
    balance_alice = web3.toWei(1, "ether")
    balance_bob = web3.toWei(2, "ether")
    balances = [balance_alice, balance_bob]
    _nonce = 1
    duration = 7*24*60*60
    expiresAt = chain[web3.eth.blockNumber].timestamp+duration
    #expiresAt = chain[1].timestamp+duration

    msw = deploy_multisig_wallet(alice)
    fund_multisig_wallet(alice, msw, "4 ether")
    fund_multisig_wallet(bob, msw, "5 ether")

    # 2. Precompute payment channel address
    # Alice deploys PredictBPCAddress in order to be able to predict
    # the new BidirectionalPaymentChannel address
    p_bpca = deploy_pbpca(alice)
    # fund PredictBPCAddress contract in order to be able to call deploy with {value}
    PredictBPCAddress_balance = web3.toWei(5, "ether")
    alice.transfer(p_bpca, PredictBPCAddress_balance)
    # and Precompute payment channel address
    predicted_bdpca_address = predict_bpca(
        p_bpca, alice, bob, balances, expiresAt, PredictBPCAddress_balance)

    # deployed_bdpc_address = deploy_from_predict_bpca(
    #    p_bpca, alice, bob, balances, expiresAt, PredictBPCAddress_balance)
    #assert predicted_bdpca_address == deployed_bdpc_address
    # this is a call to deploy direct, without create2 from predict
    #bdpc_contract = deploy_bidirectionalPaymentChannel(alice, bob)

    # 3. Alice and Bob exchanges signatures of initial balances
    alice_signed_message = sign_a_message(
        predicted_bdpca_address, balance_bob, _nonce, alice_key)
    bob_signed_message = sign_a_message(
        predicted_bdpca_address, balance_alice, _nonce, bob_key)

    # 4. Alice and Bob creates a transaction that can deploy a payment channel from
    #    the multi-sig wallet
    PredictBPCAddress_balance = web3.toWei(5, "ether")
    alice.transfer(predicted_bdpca_address, PredictBPCAddress_balance)

    PredictBPCAddress_balance = web3.toWei(5, "ether")
    alice.transfer(p_bpca, PredictBPCAddress_balance)

    tr_value = web3.toWei(4, "ether")
    txid = prep_encode_submit_tr(
        p_bpca, msw, alice, bob, balances, expiresAt, tr_value)
    txid_confirmed = confirm_transaction(txid, msw)
    txid_executed = execute_transaction(txid_confirmed, msw, alice)

    # Update channel balances
    # 1. Repeat steps 1 - 3 from opening a channel
    # 2. From multi-sig wallet create a transaction that will
    # - delete the transaction that would have deployed the old payment channel
    # - and then create a transaction that can deploy a payment channel with the
    # new balances

    # 1. fund again a MultiSigChannel
    balance_alice = web3.toWei(3, "ether")
    balance_bob = web3.toWei(4, "ether")
    balances = [balance_alice, balance_bob]
    fund_multisig_wallet(alice, msw, "3 ether")
    fund_multisig_wallet(bob, msw, "4 ether")

    print("Funding PredictBPCAddress with 15 ether")
    PredictBPCAddress_balance = web3.toWei(15, "ether")
    alice.transfer(p_bpca, PredictBPCAddress_balance)
    predicted_bdpca_address = predict_bpca(
        p_bpca, alice, bob, balances, expiresAt, PredictBPCAddress_balance)
    # deployed_bdpc_address = deploy_from_predict_bpca(
    #    p_bpca, alice, bob, balances, expiresAt, PredictBPCAddress_balance)
    #assert predicted_bdpca_address == deployed_bdpc_address
    # 3. Alice and Bob exchanges signatures of the updated balances
    alice_signed_message = sign_a_message(
        predicted_bdpca_address, balance_bob, _nonce, alice_key)
    bob_signed_message = sign_a_message(
        predicted_bdpca_address, balance_alice, _nonce, bob_key)
    # - delete the transaction that would have deployed the old payment channel

    # A transaction, once submitted from MultiSigWallet, it cannot be deleted
    # To avoid it to be executed, we can revoke the confirmations
    #txid_revoked = revoke_transaction(txid_confirmed, msw)

    # 4. Alice and Bob creates a transaction that can deploy a payment channel from
    #    the multi-sig wallet

    txid2 = prep_encode_submit_tr(
        p_bpca, msw, alice, bob, balances, expiresAt, PredictBPCAddress_balance)
    txid2_confirmed = confirm_transaction(txid2, msw)
    txid2_executed = execute_transaction(txid2_confirmed, msw, alice)

    # Closing a channel when Alice and Bob agree on the final balance
    # 1. From multi-sig wallet create a transaction that will
    # - send payments to Alice and Bob
    # - and then delete the transaction that would have created the payment channel
    _signatures = [alice_signed_message.signature,
                   bob_signed_message.signature]
    _users = [bob.address, alice.address]
    balances = [balance_bob, balance_alice]
    # as we have executed the transaction, we must have an BiDirectionalPaymentChannel
    # at the address we have predicted (predicted_bdpca_address), so let's have a contract
    # from this adddres, so we can call his methods, verify() and withdraw()
    bdpc_contract = BiDirectionalPaymentChannel.at(
        predicted_bdpca_address, owner=alice)
    #_nonce = alice.nonce+1000

    tx = bdpc_contract.challengeExit(
        balances, _nonce, _signatures, {"from": bob})
    tx.wait(1)
    # calling verify to verify these signatures and balances
    verify_status = bdpc_contract.verify(
        _signatures, predicted_bdpca_address, _users, balances, _nonce, {"from": bob})
    print(f"Verify signatures : {verify_status}")
    # alice and bob calling withdraw(), to withdraw their balances
    tx = bdpc_contract.withdraw({"from": bob})
    tx = bdpc_contract.withdraw({"from": alice})

    #txid2_revoked = revoke_transaction(txid2_confirmed, msw)


def sign_a_message(bpca_address, msg_value, _nonce,  priv_key):
    sk = web3.solidityKeccak(
        ["address", "uint256", "uint256"], [bpca_address, msg_value, _nonce])
    message = encode_defunct(hexstr=sk.hex())
    signed_message = web3.eth.account.sign_message(
        message, private_key=priv_key)
    return signed_message


def predict_bpca(p_bpc_a, alice, bob, balances, expiresAt, contractBalance):
    salt = 789
    users = [alice.address, bob.address]
    challengePeriod = 1*24*60*60
    print("Call predict() to precompute the address of the new BidirectionalPaymentChannel contract...")
    tx = p_bpc_a.predict(
        salt, contractBalance, users, balances, expiresAt, challengePeriod, {"from": alice})
    tx.wait(1)
    print(
        f"The new BidirectionalPaymentChannel contract will be deployed at {tx.return_value}")
    return tx.return_value


def deploy_from_predict_bpca(p_bpc_a, alice, bob, balances, expiresAt, PredictBPCAddress_balance):
    salt = 789
    users = [alice.address, bob.address]
    challengePeriod = 1*24*60*60
    print("Call BidirectionalPaymentChannel.deploy() to deploy the new BidirectionalPaymentChannel contract...")
    tx = p_bpc_a.deploy(
        salt, PredictBPCAddress_balance, users, balances, expiresAt, challengePeriod, {"from": alice})
    tx.wait(1)
    print(
        f"The new BidirectionalPaymentChannel is deployed at {tx.return_value}")
    return tx.return_value


def prep_encode_submit_tr(_p_bpca, _msw, _alice, _bob, _balances, _expiresAt, _value_transaction):
    # prepare parameters for call
    _salt = 789
    _users = [_alice.address, _bob.address]
    _challengePeriod = 1*24*60*60

    encoded_deploy_data = _p_bpca.getDeployEncodedCallData(
        _salt, _value_transaction, _users, _balances, _expiresAt, _challengePeriod)
    tx = _msw.submitTransaction(
        _p_bpca.address, _value_transaction, encoded_deploy_data, {"from": _alice})
    tx.wait(1)
    return _msw.getTransactionCount()-1


def execute_transaction(txid, msw, from_who):
    print(f"Executing transaction {txid} from ...")
    tx = msw.executeTransaction(txid, {"from": from_who})
    tx.wait(1)
    print("Executed!")
    return msw.getTransactionCount()-1


def confirm_transaction(txid, msw):
    owners, numConfirm = params_msw()
    for i in range(0, numConfirm):
        print(f"Confirming transaction {txid} from {owners[i]}...")
        tx_confirm = msw.confirmTransaction(txid, {"from": owners[i]})
        tx_confirm.wait(1)
        print(f"Confirmed transaction {txid}")
    return msw.getTransactionCount()-1


def revoke_transaction(txid, msw):
    owners, numConfirm = params_msw()
    for i in range(0, numConfirm):
        print(
            f"Revoking confirmations for transaction {txid} from {owners[i]}...")
        tx_revoke = msw.revokeConfirmation(txid, {"from": owners[i]})
        tx_revoke.wait(1)
        print(f"Confirmation revoked for transaction {txid}")
    return msw.getTransactionCount()-1


def params_msw():
    owners = [accounts[0].address, accounts[1].address, accounts[2].address]
    numConfirm = len(owners)-1
    return owners, numConfirm


def fund_multisig_wallet(who_funds, msw, how_much_eter):
    print(f"{who_funds} is funding MultiSigWallet with {how_much_eter}...")
    who_funds.transfer(msw, how_much_eter)
    print(f"MultiSigWallet funded with {how_much_eter}")


def deploy_multisig_wallet(who_deploys):
    owners, numConfirm = params_msw()
    print("Deploying MultiSigWallet contract...")
    msw = MultiSigWallet.deploy(owners, numConfirm, {"from": who_deploys})
    print(f"MultiSigWallet contract deployed at {msw}")
    return msw


def deploy_bidirectionalPaymentChannel(alice, bob):
    users = [alice.address, bob.address]
    balance_alice = web3.toWei(0, "ether")
    balance_bob = web3.toWei(0, "ether")
    balances = [balance_alice, balance_bob]
    duration = 7*24*60*60
    expiresAt = chain[web3.eth.blockNumber].timestamp+duration
    challengePeriod = 1*24*60*60
    value_contract = web3.toWei(0, "ether")
    print(
        f"Alice deploys BiDirectionalPaymentChannel contract with Bob address as receiver and funds it with {value_contract} wei...")
    bdpc_contract = BiDirectionalPaymentChannel.deploy(
        users, balances, expiresAt, challengePeriod,  {"from": alice, "value": value_contract})
    print(f"    BiDirectionalPaymentChannel deployed at {bdpc_contract}")
    return bdpc_contract


def deploy_pbpca(who_deploys):
    print(
        "Deploy PredictBPCAddress to be able to compute the address of the new BiDirectionalPaymentChannel...")
    p_bpc_a = PredictBPCAddress.deploy({"from": who_deploys})
    print(f"Deployed at {p_bpc_a}")
    return p_bpc_a
