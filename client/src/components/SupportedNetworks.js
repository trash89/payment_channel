import { useNetwork } from "wagmi";

const SupportedNetworks = () => {
  const { chains, isError, error } = useNetwork();

  return (
    <>
      Please connect the wallet to a supported network
      <ul>
        {chains?.map((x) => {
          return <li key={x.id}>{x.name}</li>;
        })}
      </ul>
      {isError && <div>{error.message}</div>}
    </>
  );
};

export default SupportedNetworks;
