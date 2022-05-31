// SPDX-License-Identifier: MIT
pragma solidity 0.8.14;

import "./console.sol";
import "./BidirectionalPayment.sol";

contract PredictBPCAddress {
    constructor() {
        console.log("PredictBPCAddress.constructor() called");
    }

    receive() external payable {
        console.log(
            "PredictBPCAddress.receive(), receiving %d from %s",
            msg.value,
            msg.sender
        );
    }

    // for a strange reason, VSCode insists to have the fallback function in its simple format
    // and did not accept the format with input and output, as bellow
    // the file should be saved in other code editor after commenting out the debug calls
    //fallback(bytes calldata input) external payable returns (bytes memory output) {
    fallback() external payable {
        console.log("PredictBPCAddress.fallback() called");
        //console.log("PredictBPCAddress.fallback(), input is ");
        //console.logBytes(input);
        //uint256 l = input.length;
        //if (l > 0) {
        //    (
        //        bytes32 c,
        //        uint256 d,
        //        address[2] memory u,
        //        uint256[2] memory b,
        //        uint256 e,
        //        uint256 ch
        //    ) = abi.decode(
        //            input[4:],
        //            (bytes32, uint256, address[2], uint256[2], uint256, uint256)
        //        );
        //    console.logBytes32(c);
        //    console.log("d=%d", d);
        //    console.log("e=%d", e);
        //    console.log("ch=%d", ch);
        //    console.log("PredictBPCAddress.fallback(), output is ");
        //    console.logBytes(output);
        //}
    }

    function getDeployEncodedCallData(
        bytes32 _salt,
        uint256 _value,
        address payable[2] memory _users,
        uint256[2] memory _balances,
        uint256 _expiresAt,
        uint256 _challengePeriod
    ) public view returns (bytes memory) {
        console.log("PredictBPCAddress.getEncodedCallData() called");
        return
            abi.encodeWithSignature(
                "deploy(bytes32,uint256,address[2],uint256[2],uint256,uint256)",
                _salt,
                _value,
                _users,
                _balances,
                _expiresAt,
                _challengePeriod
            );
    }

    function deploy(
        bytes32 _salt,
        uint256 _value,
        address payable[2] memory _users,
        uint256[2] memory _balances,
        uint256 _expiresAt,
        uint256 _challengePeriod
    ) public payable returns (address) {
        console.log("PredictBPCAddress.deploy() called");
        console.log("contract balance is %d", address(this).balance);
        // This syntax is a newer way to invoke create2 without assembly, you just need to pass salt
        // https://docs.soliditylang.org/en/latest/control-structures.html#salted-contract-creations-create2
        console.log("Salt is");
        console.logBytes32(_salt);
        console.log("Value is %d", _value);
        return
            address(
                new BiDirectionalPaymentChannel{salt: _salt, value: _value}(
                    _users,
                    _balances,
                    _expiresAt,
                    _challengePeriod
                )
            );
    }

    function predict(
        bytes32 _salt,
        uint256 _value,
        address payable[2] memory _users,
        uint256[2] memory _balances,
        uint256 _expiresAt,
        uint256 _challengePeriod
    ) public returns (address) {
        console.log("PredictBPCAddress.predict() called");
        // This complicated expression just tells you how the address
        // can be pre-computed. It is just there for illustration.
        // You actually only need ``new D{salt: salt}(arg)``.
        address predictedAddress = address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(this),
                            _salt,
                            keccak256(
                                abi.encodePacked(
                                    type(BiDirectionalPaymentChannel)
                                        .creationCode,
                                    _users,
                                    _balances,
                                    _expiresAt,
                                    _challengePeriod
                                )
                            )
                        )
                    )
                )
            )
        );

        //D d = new D{salt: salt}(arg);
        //require(address(d) == predictedAddress);
        console.log("PredictBPCAddress.predict() passed");
        return predictedAddress;
    }
}
