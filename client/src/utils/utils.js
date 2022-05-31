import { BigNumber, constants, utils } from "ethers";
import brownieConfigJson from "../brownie-config-json.json";

function shortenString(str) {
  return str.substring(0, 6) + "..." + str.substring(str.length - 4);
}

export function shortenAddress(address) {
  try {
    return shortenString(utils.getAddress(address));
  } catch {
    throw new TypeError("Invalid input, address can't be parsed");
  }
}

const formatter0 = new Intl.NumberFormat("en-us", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 18,
});

const formatter = new Intl.NumberFormat("en-us", {
  minimumFractionDigits: 4,
  maximumFractionDigits: 18,
});

export const formatBalance = (balance, decimals) => {
  if (decimals >= 0) {
    if (decimals === 0) {
      return formatter0.format(
        parseFloat(utils.formatEther(balance ?? BigNumber.from("0")))
      );
    } else {
      return formatter.format(
        parseFloat(utils.formatEther(balance ?? BigNumber.from("0")))
      );
    }
  } else {
    return formatter.format(
      parseFloat(utils.formatEther(balance ?? BigNumber.from("0")))
    );
  }
};
export const addressNotZero = (address) => {
  if (!utils.isAddress(address)) return false;
  return utils.getAddress(address) !== constants.AddressZero;
};

export const getNumConfirmations = (activeChain) => {
  if (activeChain) {
    return brownieConfigJson["networks"][activeChain["network"]][
      "numConfirmations"
    ];
  } else return 1;
};
