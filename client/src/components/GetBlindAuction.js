import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
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
import { useIsMounted, useDetailsBlindAuction } from "../hooks";
import { GetStatusIcon, ShowError } from "../components";

const GetBlindAuction = ({
  activeChain,
  contractAddress,
  contractABI,
  account,
}) => {
  const isMounted = useIsMounted();
  const isEnabled = Boolean(
    isMounted && activeChain && account && addressNotZero(contractAddress)
  );
  const numConfirmations = getNumConfirmations(activeChain);
  const [disabled, setDisabled] = useState(false);
  const [value, setValue] = useState("0");
  const [newBeneficiary, setNewBeneficiary] = useState("");
  const [newBiddingEnd, setNewBiddingEnd] = useState("");
  const [newRevealEnd, setNewRevealEnd] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [params, setParams] = useState({
    value: "0",
    fake: false,
    secret: "",
  });

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

  const {
    beneficiary,
    highestBider,
    highestBid,
    biddingEnd,
    revealEnd,
    ended,
  } = useDetailsBlindAuction(activeChain, contractAddress, contractABI);

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
    data: dataReveal,
    error: errorReveal,
    isError: isErrorReveal,
    isLoading: isLoadingReveal,
    write: writeReveal,
    status: statusReveal,
  } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "reveal",
    {
      enabled: isEnabled,
    }
  );
  const { status: statusRevealWait } = useWaitForTransaction({
    hash: dataReveal?.hash,
    wait: dataReveal?.wait,
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
    if (
      value &&
      parseFloat(value) > 0 &&
      params.value &&
      parseFloat(params.value) > 0
    ) {
      setDisabled(true);
      defaultValue = utils.parseEther(value);
      const formattedValue = utils.parseEther(params.value);
      const formattedFake =
        params.fake === true ? BigNumber.from("1") : BigNumber.from("0");
      const formattedSecret = utils.formatBytes32String(params.secret);
      const dataHex = utils.solidityKeccak256(
        ["uint256", "bool", "bytes32"],
        [formattedValue, formattedFake, formattedSecret]
      );
      writeBid({
        args: [dataHex],
        overrides: { value: defaultValue, gasLimit: 6721975 },
      });
      setValue("0");
      setParams({ value: "0", fake: false, secret: "" });
    }
  };

  const handleReveal = () => {
    if (params.value && parseFloat(params.value) > 0) {
      setDisabled(true);
      const formattedValue = utils.parseEther(params.value);
      const formattedFake =
        params.fake === true ? BigNumber.from("1") : BigNumber.from("0");
      const formattedSecret = utils.formatBytes32String(params.secret);
      writeReveal({
        args: [[formattedValue], [formattedFake], [formattedSecret]],
        overrides: { gasLimit: 6721975 },
      });
      setValue("0");
      setParams({ value: "0", fake: false, secret: "" });
    }
  };

  const handleWithdraw = () => {
    setDisabled(true);
    writeWithdraw({
      overrides: { gasLimit: 6721975 },
    });
  };

  const handleAuctionEnd = () => {
    setDisabled(true);
    writeAuctionEnd({
      overrides: { gasLimit: 6721975 },
    });
  };

  const handleCloseDialog = (event, reason) => {
    if (
      (reason && (reason === "backdropClick" || reason === "escapeKeyDown")) ||
      event.target.value === "cancel"
    ) {
      setOpenDialog(false);
      setNewBeneficiary("");
      setNewBiddingEnd("");
      setNewRevealEnd("");
    } else {
      if (newBeneficiary && utils.isAddress(newBeneficiary)) {
        const currentDate = new Date();
        const localDateB = new Date(newBiddingEnd);
        const localDateR = new Date(newRevealEnd);
        if (localDateB < localDateR && currentDate < localDateB) {
          const BNBiddingEnd = BigNumber.from(localDateB.getTime() / 1000);
          const BNRevealEnd = BigNumber.from(localDateR.getTime() / 1000);
          setDisabled(true);
          writeNewAuction({
            args: [BNBiddingEnd, BNRevealEnd, newBeneficiary],
          });
          setOpenDialog(false);
        }
      }
    }
  };

  useEffect(() => {
    if (
      statusBalance !== "loading" &&
      statusBid !== "loading" &&
      statusWithdraw !== "loading" &&
      statusReveal !== "loading" &&
      statusAuctionEnd !== "loading" &&
      statusNewAuction !== "loading" &&
      statusBidWait !== "loading" &&
      statusWithdrawWait !== "loading" &&
      statusRevealWait !== "loading" &&
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
    statusReveal,
    statusAuctionEnd,
    statusNewAuction,
    statusBidWait,
    statusWithdrawWait,
    statusRevealWait,
    statusAuctionEndWait,
    statusNewAuctionWait,
  ]);

  const currentDate = new Date();
  const biddingEndFormatted = new Date(biddingEnd).toLocaleString();
  const revealEndFormatted = new Date(revealEnd).toLocaleString();

  const fakes = [
    { value: false, label: "false" },
    { value: true, label: "true" },
  ];

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
        Blind Auction
      </Typography>
      <Typography>
        Contract Address: {shortenAddress(contractAddress)}{" "}
        {(currentDate > revealEnd || ended.toString() === "true") && (
          <>
            <Button
              variant="contained"
              size="small"
              disabled={disabled || isLoadingBid}
              onClick={() => setOpenDialog(true)}
            >
              New Auction
            </Button>
            <Dialog open={openDialog} onClose={handleCloseDialog}>
              <DialogTitle>Create a new Blind Auction</DialogTitle>
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
                  id="biddingEnd"
                  helperText="Bidding End Time"
                  type="datetime-local"
                  value={newBiddingEnd}
                  required
                  onChange={(e) => setNewBiddingEnd(e.target.value)}
                  variant="outlined"
                />
                <TextField
                  size="small"
                  margin="dense"
                  id="revealEnd"
                  helperText="Reveal End Time"
                  type="datetime-local"
                  value={newRevealEnd}
                  required
                  onChange={(e) => setNewRevealEnd(e.target.value)}
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
      <Typography color={biddingEnd > currentDate ? "primary.text" : "red"}>
        Bidding End : {biddingEndFormatted}
      </Typography>
      <Typography
        color={
          revealEnd > currentDate && currentDate > biddingEnd
            ? "primary.text"
            : "red"
        }
      >
        Reveal End : {revealEndFormatted}
      </Typography>
      <Typography color={ended.toString() === "true" ? "red" : "primary.text"}>
        Ended? : {ended.toString()}
      </Typography>

      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        padding={0}
        spacing={1}
      >
        <TextField
          variant="outlined"
          size="small"
          type="number"
          label="Value (ETH)"
          value={params.value}
          onChange={(e) => setParams({ ...params, value: e.target.value })}
          disabled={disabled}
        />
        <TextField
          variant="outlined"
          size="small"
          select
          label="Fake"
          value={params.fake}
          onChange={(e) => setParams({ ...params, fake: e.target.value })}
          disabled={disabled}
        >
          {fakes.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          variant="outlined"
          size="small"
          type="text"
          label="Secret"
          value={params.secret}
          onChange={(e) => setParams({ ...params, secret: e.target.value })}
          disabled={disabled}
        />
      </Stack>

      <TextField
        variant="outlined"
        type="number"
        size="small"
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
        {biddingEnd > currentDate && (
          <Button
            variant="contained"
            size="small"
            disabled={disabled || isLoadingBid}
            onClick={handleBid}
            endIcon={<GetStatusIcon status={statusBid} />}
          >
            Bid?
          </Button>
        )}
        {revealEnd > currentDate && currentDate > biddingEnd && (
          <Button
            variant="contained"
            size="small"
            disabled={disabled || isLoadingReveal}
            onClick={handleReveal}
            endIcon={<GetStatusIcon status={statusReveal} />}
          >
            Reveal?
          </Button>
        )}
        <Button
          variant="contained"
          size="small"
          disabled={disabled || isLoadingWithdraw}
          onClick={handleWithdraw}
          endIcon={<GetStatusIcon status={statusWithdraw} />}
        >
          Withdraw?
        </Button>
        {revealEnd < currentDate &&
          currentDate < biddingEnd &&
          ended.toString() === "false" && (
            <Button
              variant="contained"
              size="small"
              disabled={disabled || isLoadingAuctionEnd}
              onClick={handleAuctionEnd}
              endIcon={<GetStatusIcon status={statusAuctionEnd} />}
            >
              End Auction?
            </Button>
          )}
      </Stack>
      {isErrorBalance && (
        <ShowError flag={isErrorBalance} error={errorBalance} />
      )}
      {isErrorBid && <ShowError flag={isErrorBid} error={errorBid} />}
      {isErrorWithdraw && (
        <ShowError flag={isErrorWithdraw} error={errorWithdraw} />
      )}
      {isErrorReveal && <ShowError flag={isErrorReveal} error={errorReveal} />}
      {isErrorAuctionEnd && (
        <ShowError flag={isErrorAuctionEnd} error={errorAuctionEnd} />
      )}
      {isErrorNewAuction && (
        <ShowError flag={isErrorNewAuction} error={errorNewAuction} />
      )}
    </Stack>
  );
};

export default GetBlindAuction;
