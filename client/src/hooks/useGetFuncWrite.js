import { useContractWrite, useWaitForTransaction } from "wagmi";
import { getNumConfirmations } from "../utils/utils";

const useGetFuncWrite = (
  funcName,
  activeChain,
  contractAddress,
  contractABI,
  isEnabled
) => {
  const numConfirmations = getNumConfirmations(activeChain);
  const { data, error, isError, isLoading, write, status } = useContractWrite(
    { addressOrName: contractAddress, contractInterface: contractABI },
    funcName,
    { enabled: isEnabled }
  );
  const { status: statusWait } = useWaitForTransaction({
    hash: data?.hash,
    wait: data?.wait,
    confirmations: numConfirmations,
    enabled: isEnabled,
  });
  return { data, error, isError, isLoading, write, status, statusWait };
};

export default useGetFuncWrite;
