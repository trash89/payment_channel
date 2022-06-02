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

import { useContractWrite, useWaitForTransaction, useSignMessage } from "wagmi";
import { useIsMounted, useDetailsSimplePC } from "../hooks";
import { GetStatusIcon, ShowError } from ".";

const GetSimplePC = ({
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
  const [openDialogClose, setOpenDialogClose] = useState(false);
  const [amount, setAmount] = useState("0");
  const [signature, setSignature] = useState("");
  const [newValue, setNewValue] = useState("0");
  const [newRecipient, setNewRecipient] = useState("");
  const [newExpiration, setNewExpiration] = useState("");
  const { sender, expiration, recipient, balance } = useDetailsSimplePC(
    activeChain,
    contractAddress,
    contractABI
  );

  const {
    data: signedMessage,
    isError: isErrorSignedMessage,
    isLoading: isLoadingSignedMessage,
    isSuccess: isSuccessSignedMessage,
    error: errorSignedMessage,
    signMessage,
  } = useSignMessage();

  const {
    data: dataNewChannel,
    error: errorNewChannel,
    isError: isErrorNewChannel,
    isLoading: isLoadingNewChannel,
    write: writeNewChannel,
    status: statusNewChannel,
  } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "newChannel",
    {
      enabled: isEnabled,
    }
  );
  const { status: statusNewChannelWait } = useWaitForTransaction({
    hash: dataNewChannel?.hash,
    wait: dataNewChannel?.wait,
    confirmations: numConfirmations,
    enabled: isEnabled,
  });

  const {
    data: dataClose,
    error: errorClose,
    isError: isErrorClose,
    isLoading: isLoadingClose,
    write: writeClose,
    status: statusClose,
  } = useContractWrite(
    {
      addressOrName: contractAddress,
      contractInterface: contractABI,
    },
    "close",
    {
      enabled: isEnabled,
    }
  );
  const { status: statusCloseWait } = useWaitForTransaction({
    hash: dataClose?.hash,
    wait: dataClose?.wait,
    confirmations: numConfirmations,
    enabled: isEnabled,
  });

  useEffect(() => {
    if (
      statusNewChannel !== "loading" &&
      statusNewChannelWait !== "loading" &&
      statusClose !== "loading" &&
      statusCloseWait !== "loading"
    ) {
      if (disabled) setDisabled(false);
      setNewValue("0");
      setNewRecipient("");
      setNewExpiration("");
      setAmount("");
    }
    // eslint-disable-next-line
  }, [statusNewChannel, statusNewChannelWait, statusClose, statusCloseWait]);

  if (signedMessage) console.log("SignedMessage=", signedMessage);

  const handleCloseDialog = (event, reason) => {
    if (
      (reason && (reason === "backdropClick" || reason === "escapeKeyDown")) ||
      event.target.value === "cancel"
    ) {
      setOpenDialog(false);
      setNewRecipient("");
      setNewExpiration("");
    } else {
      if (
        newRecipient &&
        utils.isAddress(newRecipient) &&
        newValue &&
        utils.parseEther(newValue) > 0
      ) {
        const newRecipientFormatted = utils.getAddress(newRecipient);
        const newValueFormatted = utils.parseEther(newValue);
        const currentDate = new Date();
        const localDate = new Date(newExpiration);
        if (localDate > currentDate) {
          const localNewExpiration = BigNumber.from(localDate.getTime() / 1000);
          setDisabled(true);
          const msg = utils.solidityKeccak256(
            ["address", "uint256"],
            [contractAddress, newValueFormatted]
          );
          console.log(
            "address=",
            contractAddress,
            "value=",
            newValueFormatted,
            "msg=",
            msg
          );
          console.log("msgHash=", utils.hashMessage(msg));
          const msgHash = utils.hashMessage(msg);
          signMessage({ message: msgHash });
          writeNewChannel({
            args: [newRecipientFormatted, localNewExpiration],
            overrides: { value: utils.parseEther(newValue) },
          });
          setOpenDialog(false);
        }
      }
    }
  };

  const handleCloseDialogClose = (event, reason) => {
    if (
      (reason && (reason === "backdropClick" || reason === "escapeKeyDown")) ||
      event.target.value === "cancel"
    ) {
      setOpenDialogClose(false);
      setAmount("0");
      setSignature("");
    } else {
      if (amount && utils.parseEther(amount) > 0) {
        const amountFormatted = utils.parseEther(amount);
        setDisabled(true);
        writeClose({
          args: [amountFormatted, signature],
        });
        setOpenDialogClose(false);
      }
    }
  };

  const currentDate = new Date();
  //const auctionEndTimeFormatted = new Date(auctionEndTime).toLocaleString();
  const expirationFormatted = new Date(expiration).toLocaleString();
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
        Simple Payment Channel
      </Typography>
      <Typography>Contract Address: {contractAddress} </Typography>
      <Typography>
        Contract Balance: {formatBalance(balance?.value)} ETH{" "}
      </Typography>
      <Typography>Sender: {sender}</Typography>
      <Typography>Recipient: {recipient}</Typography>
      <Typography color={currentDate < expiration ? "green" : "red"}>
        Expiration: {expirationFormatted}
      </Typography>
      {signedMessage && (
        <Typography>Signed Message: {signedMessage}</Typography>
      )}
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        spacing={1}
        padding={0}
      >
        <Button
          variant="contained"
          size="small"
          disabled={disabled || isLoadingNewChannel || isLoadingSignedMessage}
          onClick={() => setOpenDialog(true)}
        >
          New Channel
        </Button>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Create a new Simple Payment Channel</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              size="small"
              margin="dense"
              id="recipient"
              helperText="Recipient address"
              type="text"
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              size="small"
              margin="dense"
              id="expiration"
              helperText="Expiration"
              type="datetime-local"
              value={newExpiration}
              required
              onChange={(e) => setNewExpiration(e.target.value)}
              variant="outlined"
            />
            <TextField
              size="small"
              margin="dense"
              id="newValue"
              helperText="Value (ETH)"
              type="number"
              value={newValue}
              required
              onChange={(e) => setNewValue(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button size="small" onClick={handleCloseDialog} value="cancel">
              Cancel
            </Button>
            <Button
              size="small"
              disabled={
                disabled || isLoadingNewChannel || isLoadingSignedMessage
              }
              onClick={handleCloseDialog}
              endIcon={<GetStatusIcon status={statusNewChannel} />}
            >
              Create
            </Button>
          </DialogActions>
        </Dialog>
        <Button
          variant="contained"
          size="small"
          disabled={disabled}
          onClick={() => setOpenDialogClose(true)}
        >
          Close Channel
        </Button>
        <Dialog open={openDialogClose} onClose={handleCloseDialogClose}>
          <DialogTitle>Close the Simple Payment Channel</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              size="small"
              margin="dense"
              id="amount"
              helperText="Amount (ETH)"
              type="number"
              value={amount}
              required
              onChange={(e) => setAmount(e.target.value)}
              variant="outlined"
            />
            <TextField
              size="small"
              margin="dense"
              id="signature"
              helperText="Message Signature"
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              fullWidth
              required
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button
              size="small"
              onClick={handleCloseDialogClose}
              value="cancel"
            >
              Cancel
            </Button>
            <Button
              size="small"
              disabled={disabled || isLoadingClose}
              onClick={handleCloseDialogClose}
              endIcon={<GetStatusIcon status={statusClose} />}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
      <Stack
        direction="row"
        justifyContent="flex-start"
        alignItems="flex-start"
        padding={0}
        spacing={0}
      >
        {isErrorNewChannel && (
          <ShowError flag={isErrorNewChannel} error={errorNewChannel} />
        )}
        {isErrorClose && <ShowError flag={isErrorClose} error={errorClose} />}
        {isErrorSignedMessage && (
          <ShowError flag={isErrorSignedMessage} error={errorSignedMessage} />
        )}
      </Stack>
    </Stack>
  );
};

export default GetSimplePC;
