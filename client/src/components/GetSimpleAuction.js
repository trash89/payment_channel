import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { BigNumber, utils } from "ethers";
import {
  addressNotZero,
  formatBalance,
  shortenAddress,
  getNumConfirmations,
} from "../utils/utils";

import { useBalance, useContractWrite, useWaitForTransaction } from "wagmi";
import { useIsMounted, useDetailsSimpleAuction } from "../hooks";
import { GetStatusIcon, ShowError } from "../components";

const GetSimpleAuction = ({
  activeChain,
  contractAddress,
  contractABI,
  account,
}) => {
  const isMounted = useIsMounted();
  const [disabled, setDisabled] = useState(false);
  const isEnabled = Boolean(
    isMounted && activeChain && account && addressNotZero(contractAddress)
  );
  const numConfirmations = getNumConfirmations(activeChain);
  const [openDialog, setOpenDialog] = useState(false);
  const [value, setValue] = useState("0");
  const [newBeneficiary, setNewBeneficiary] = useState("");
  const [endTime, setEndTime] = useState("");
  const {
    data: balance,
    isError: isErrorBalance,
    isSuccess: isSuccessBalance,
    error: errorBalance,
    status: statusBalance,
  } = useBalance({
    addressOrName: contractAddress,
    watch: isEnabled,
    enabled: isEnabled,
  });

  const { beneficiary, auctionEndTime, highestBider, highestBid, ended } =
    useDetailsSimpleAuction(activeChain, contractAddress, contractABI);
  const {
    data: dataBid,
    error: errorBid,
    isError: isErrorBid,
    isLoading: isLoadingBid,
    write: writeBid,
    status: statusBid,
  } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "bid",
    {
      enabled: isEnabled,
    }
  );
  const { status: statusBidWait } = useWaitForTransaction({
    hash: dataBid?.hash,
    wait: dataBid?.wait,
    confirmations: numConfirmations,
    enabled: isEnabled,
  });

  const {
    data: dataWithdraw,
    error: errorWithdraw,
    isError: isErrorWithdraw,
    isLoading: isLoadingWithdraw,
    write: writeWithdraw,
    status: statusWithdraw,
  } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "withdraw",
    {
      enabled: isEnabled,
    }
  );
  const { status: statusWithdrawWait } = useWaitForTransaction({
    hash: dataWithdraw?.hash,
    wait: dataWithdraw?.wait,
    confirmations: numConfirmations,
    enabled: isEnabled,
  });

  const {
    data: dataAuctionEnd,
    error: errorAuctionEnd,
    isError: isErrorAuctionEnd,
    isLoading: isLoadingAuctionEnd,
    write: writeAuctionEnd,
    status: statusAuctionEnd,
  } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "auctionEnd",
    {
      enabled: isEnabled,
    }
  );
  const { status: statusAuctionEndWait } = useWaitForTransaction({
    hash: dataAuctionEnd?.hash,
    wait: dataAuctionEnd?.wait,
    confirmations: numConfirmations,
    enabled: isEnabled,
  });

  const {
    data: dataNewAuction,
    error: errorNewAuction,
    isError: isErrorNewAuction,
    isLoading: isLoadingNewAuction,
    write: writeNewAuction,
    status: statusNewAuction,
  } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "newAuction",
    {
      enabled: isEnabled,
    }
  );
  const { status: statusNewAuctionWait } = useWaitForTransaction({
    hash: dataNewAuction?.hash,
    wait: dataNewAuction?.wait,
    confirmations: numConfirmations,
    enabled: isEnabled,
  });

  const handleBid = () => {
    let defaultValue = 0;
    if (value && parseFloat(value) > 0) {
      defaultValue = utils.parseEther(value);
      setDisabled(true);
      writeBid({ overrides: { value: BigNumber.from(defaultValue) } });
      setValue("0");
    }
  };

  const handleWithdraw = () => {
    setDisabled(true);
    writeWithdraw();
  };

  const handleAuctionEnd = () => {
    setDisabled(true);
    writeAuctionEnd();
  };

  useEffect(() => {
    if (
      statusBalance !== "loading" &&
      statusBid !== "loading" &&
      statusWithdraw !== "loading" &&
      statusAuctionEnd !== "loading" &&
      statusNewAuction !== "loading" &&
      statusBidWait !== "loading" &&
      statusWithdrawWait !== "loading" &&
      statusAuctionEndWait !== "loading" &&
      statusNewAuctionWait !== "loading"
    ) {
      if (disabled) setDisabled(false);
    }
    // eslint-disable-next-line
  }, [
    statusBalance,
    statusBid,
    statusWithdraw,
    statusAuctionEnd,
    statusNewAuction,
    statusBidWait,
    statusWithdrawWait,
    statusAuctionEndWait,
    statusNewAuctionWait,
  ]);

  const handleCloseDialog = (event, reason) => {
    if (
      (reason && (reason === "backdropClick" || reason === "escapeKeyDown")) ||
      event.target.value === "cancel"
    ) {
      setOpenDialog(false);
      setNewBeneficiary("");
      setEndTime("");
    } else {
      if (newBeneficiary && utils.isAddress(newBeneficiary)) {
        const currentDate = new Date();
        const localDate = new Date(endTime);
        if (localDate > currentDate) {
          const newEndTime = BigNumber.from(localDate.getTime() / 1000);
          setDisabled(true);
          writeNewAuction({ args: [newEndTime, newBeneficiary] });
          setOpenDialog(false);
        }
      }
    }
  };

  const currentDate = new Date();
  const auctionEndTimeFormatted = new Date(auctionEndTime).toLocaleString();

  if (!isMounted) return <></>;
  return (
    <Stack
      direction="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      spacing={1}
      padding={1}
    >
      <Typography variant="h6" gutterBottom component="div">
        Simple Auction
      </Typography>

      <Typography>
        Contract Address: {shortenAddress(contractAddress)}{" "}
        {(currentDate > auctionEndTime || ended.toString() === "true") && (
          <>
            <Button
              variant="contained"
              size="small"
              disabled={disabled}
              onClick={() => setOpenDialog(true)}
            >
              New Auction
            </Button>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
              <DialogTitle>Create a new Simple Auction</DialogTitle>
              <DialogContent>
                <TextField
                  autoFocus
                  size="small"
                  margin="dense"
                  id="newBeneficiary"
                  helperText="Beneficiary address"
                  type="text"
                  value={newBeneficiary}
                  onChange={(e) => setNewBeneficiary(e.target.value)}
                  fullWidth
                  required
                  variant="outlined"
                />
                <TextField
                  size="small"
                  margin="dense"
                  id="endTime"
                  helperText="End Time"
                  type="datetime-local"
                  value={endTime}
                  required
                  onChange={(e) => setEndTime(e.target.value)}
                  variant="outlined"
                />
              </DialogContent>
              <DialogActions>
                <Button size="small" onClick={handleCloseDialog} value="cancel">
                  Cancel
                </Button>
                <Button
                  size="small"
                  disabled={disabled || isLoadingNewAuction}
                  onClick={handleCloseDialog}
                  endIcon={<GetStatusIcon status={statusNewAuction} />}
                >
                  Create
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Typography>
      {isSuccessBalance && (
        <Typography>Balance: {formatBalance(balance?.value)} ETH </Typography>
      )}
      <Typography>Beneficiary: {shortenAddress(beneficiary)}</Typography>
      <Typography>Highest Bider: {shortenAddress(highestBider)}</Typography>
      <Typography>Highest Bid: {formatBalance(highestBid)} ETH</Typography>
      <Typography color={auctionEndTime < currentDate ? "red" : "primary.text"}>
        Auction{" "}
        {auctionEndTime < currentDate ? (
          <>ended at {auctionEndTimeFormatted}</>
        ) : (
          <>End Time: {auctionEndTimeFormatted}</>
        )}
      </Typography>
      <TextField
        autoFocus
        variant="outlined"
        type="number"
        size="small"
        margin="normal"
        label="Value (ETH)"
        value={value}
        required
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
      />
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        padding={0}
        spacing={1}
      >
        <Button
          variant="contained"
          size="small"
          disabled={disabled || isLoadingBid}
          onClick={handleBid}
          endIcon={<GetStatusIcon status={statusBid} />}
        >
          Bid?
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={disabled || isLoadingWithdraw}
          onClick={handleWithdraw}
          endIcon={<GetStatusIcon status={statusWithdraw} />}
        >
          Withdraw?
        </Button>
        <Button
          variant="contained"
          size="small"
          disabled={disabled || isLoadingAuctionEnd}
          onClick={handleAuctionEnd}
          endIcon={<GetStatusIcon status={statusAuctionEnd} />}
        >
          End Auction?
        </Button>
      </Stack>
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        padding={0}
        spacing={0}
      >
        {isErrorBalance && (
          <ShowError flag={isErrorBalance} error={errorBalance} />
        )}
        {isErrorBid && <ShowError flag={isErrorBid} error={errorBid} />}
        {isErrorWithdraw && (
          <ShowError flag={isErrorWithdraw} error={errorWithdraw} />
        )}
        {isErrorAuctionEnd && (
          <ShowError flag={isErrorAuctionEnd} error={errorAuctionEnd} />
        )}
        {isErrorNewAuction && (
          <ShowError flag={isErrorNewAuction} error={errorNewAuction} />
        )}
      </Stack>
    </Stack>
  );
};

export default GetSimpleAuction;
