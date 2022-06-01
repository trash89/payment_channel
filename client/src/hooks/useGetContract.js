import { useNetwork } from "wagmi";
import { constants, utils } from "ethers";

import networkMapping from "../chain-info/map.json";

import contract1 from "../chain-info/SimplePaymentChannel.json";

const useGetContract = (contractName) => {
  const { activeChain } = useNetwork();
  let contractAddress;

  if (!networkMapping[String(activeChain?.id)]) {
    contractAddress = constants.AddressZero;
  } else {
    contractAddress = activeChain?.id
      ? networkMapping[String(activeChain.id)][contractName][0]
      : constants.AddressZero;
  }

  const { abi: abiContract1 } = contract1;

  const formattedAddress = utils.getAddress(contractAddress);

  if (contractName === "SimplePaymentChannel") {
    return {
      address: activeChain ? formattedAddress : constants.AddressZero,
      ABI: abiContract1,
    };
  }

  return { address: formattedAddress, ABI: abiContract1 };
};

export default useGetContract;
