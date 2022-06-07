// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.14;
import "./console.sol";

contract SimplePaymentChannel {
    address payable public sender; // The account sending payments.
    address payable public recipient; // The account receiving the payments.
    uint256 public expiration; // Timeout in case the recipient never closes.

    constructor(address payable recipientAddress, uint256 duration) payable {
        sender = payable(msg.sender);
        recipient = recipientAddress;
        expiration = block.timestamp + duration;
    }

    /// the sender can extend the expiration at any time
    function extend(uint256 newExpiration) external {
        require(msg.sender == sender);
        require(newExpiration > expiration);
        expiration = newExpiration;
    }

    /// if the timeout is reached without the recipient closing the channel,
    /// then the Ether is released back to the sender.
    function claimTimeout() external {
        // commented the require in order to be able to call the function
        //require(block.timestamp >= expiration);
        selfdestruct(sender);
    }

    function newChannel(address payable _recipientAddress, uint256 _expiration) external payable {
        sender = payable(msg.sender);
        recipient = _recipientAddress;
        expiration = _expiration;
    }

    /// the recipient can close the channel at any time by presenting a
    /// signed amount from the sender. the recipient will be sent that amount,
    /// and the remainder will go back to the sender
    function close(uint256 amount, bytes memory signature) external {
        console.log("signature received from frontend=");
        console.logBytes(signature);
        require(msg.sender == recipient,"not recipient");
        require(isValidSignature(amount, signature),"invalid signature");
        recipient.transfer(amount);
        selfdestruct(sender);
    }

    function isValidSignature(uint256 amount, bytes memory signature)
        internal
        view
        returns (bool)
    {

        bytes32 message = prefixed(keccak256(abi.encodePacked(address(this), amount)));
        console.log("message =");
        console.logBytes32(message);
        // check that the signature is from the payment sender
        return recoverSigner(message, signature) == sender;
    }

    function recoverSigner(bytes32 message, bytes memory sig)
        internal
        view
        returns (address)
    {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);
        console.log("Address is %s", ecrecover(message, v, r, s));
        return ecrecover(message, v, r, s);
    }

    /// All functions below this are just taken from the chapter
    /// 'creating and verifying signatures' chapter.

    function splitSignature(bytes memory sig)
        internal
        pure
        returns (
            uint8 v,
            bytes32 r,
            bytes32 s
        )
    {
        require(sig.length == 65);
        assembly {
            // first 32 bytes, after the length prefix
            r := mload(add(sig, 32))
            // second 32 bytes
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes)
            v := byte(0, mload(add(sig, 96)))
        }
        return (v, r, s);
    }


    /// builds a prefixed hash to mimic the behavior of eth_sign.
    function prefixed(bytes32 hash) internal view returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
            );
    }
}
