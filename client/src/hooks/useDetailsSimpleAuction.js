import { useContractRead } from "wagmi";
import { BigNumber, utils, constants } from "ethers";
import { addressNotZero } from "../utils/utils";

const useDetailsSimpleAuction = (activeChain, contractAddress, contractABI) => {
  const isEnabled = Boolean(activeChain && addressNotZero(contractAddress));
  const {
    data: beneficiary,
    isLoading: isLoadingBeneficiary,
    isError: isErrorBeneficiary,
    isSuccess: isSuccessBeneficiary,
  } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "beneficiary",
    {
      watch: isEnabled,
      enabled: isEnabled,
    }
  );

  const {
    data: auctionEndTime,
    isLoading: isLoadingAuctionEndTime,
    isError: isErrorAuctionEndTime,
    isSuccess: isSuccessAuctionEndTime,
  } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "auctionEndTime",
    {
      watch: isEnabled,
      enabled: isEnabled,
    }
  );

  const {
    data: highestBider,
    isLoading: isLoadingHighestBider,
    isError: isErrorHighestBider,
    isSuccess: isSuccessHighestBider,
  } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "highestBidder",
    {
      watch: isEnabled,
      enabled: isEnabled,
    }
  );

  const {
    data: highestBid,
    isLoading: isLoadingHighestBid,
    isError: isErrorHighestBid,
    isSuccess: isSuccessHighestBid,
  } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "highestBid",
    {
      watch: isEnabled,
      enabled: isEnabled,
    }
  );

  const {
    data: ended,
    isLoading: isLoadingEnded,
    isError: isErrorEnded,
    isSuccess: isSuccessEnded,
  } = useContractRead(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "ended",
    {
      watch: isEnabled,
      enabled: isEnabled,
    }
  );

  return {
    beneficiary:
      isLoadingBeneficiary || isErrorBeneficiary || !isSuccessBeneficiary
        ? constants.AddressZero
        : utils.getAddress(beneficiary),
    auctionEndTime:
      isLoadingAuctionEndTime ||
      isErrorAuctionEndTime ||
      !isSuccessAuctionEndTime
        ? BigNumber.from("0")
        : auctionEndTime * 1000, ///in miliseconds
    highestBider:
      isLoadingHighestBider || isErrorHighestBider || !isSuccessHighestBider
        ? constants.AddressZero
        : utils.getAddress(highestBider),
    highestBid:
      isLoadingHighestBid || isErrorHighestBid || !isSuccessHighestBid
        ? BigNumber.from("0")
        : highestBid,
    ended: isLoadingEnded || isErrorEnded || !isSuccessEnded ? true : ended,
  };
};

export default useDetailsSimpleAuction;
