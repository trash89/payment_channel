import { useContractRead, useBalance } from "wagmi";
import { BigNumber, utils, constants } from "ethers";
import { addressNotZero } from "../utils/utils";

const useDetailsSimplePC = (activeChain, contractAddress, contractABI) => {
  const isEnabled = Boolean(activeChain && addressNotZero(contractAddress));

  const {
    data: balance,
    isLoading: isLoadingBalance,
    isError: isErrorBalance,
    isSuccess: isSuccessBalance,
  } = useBalance({
    addressOrName: contractAddress,
    watch: isEnabled,
    enabled: isEnabled,
  });

  const {
    data: sender,
    isLoading: isLoadingSender,
    isError: isErrorSender,
    isSuccess: isSuccessSender,
  } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "sender",
    {
      watch: isEnabled,
      enabled: isEnabled,
    }
  );

  const {
    data: expiration,
    isLoading: isLoadingExpiration,
    isError: isErrorExpiration,
    isSuccess: isSuccessExpiration,
  } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "expiration",
    {
      watch: isEnabled,
      enabled: isEnabled,
    }
  );

  const {
    data: recipient,
    isLoading: isLoadingRecipient,
    isError: isErrorRecipient,
    isSuccess: isSuccessRecipient,
  } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "recipient",
    {
      watch: isEnabled,
      enabled: isEnabled,
    }
  );

  return {
    sender:
      isLoadingSender || isErrorSender || !isSuccessSender
        ? constants.AddressZero
        : utils.getAddress(sender),
    expiration:
      isLoadingExpiration || isErrorExpiration || !isSuccessExpiration
        ? BigNumber.from("0")
        : expiration * 1000, ///in miliseconds
    recipient:
      isLoadingRecipient || isErrorRecipient || !isSuccessRecipient
        ? constants.AddressZero
        : utils.getAddress(recipient),
    balance:
      isLoadingBalance || isErrorBalance || !isSuccessBalance
        ? BigNumber.from("0")
        : balance,
  };
};

export default useDetailsSimplePC;
