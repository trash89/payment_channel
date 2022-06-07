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
import { addressNotZero, formatBalance, shortenAddress } from "../utils/utils";

import { useSignMessage, useSigner } from "wagmi";
import { useIsMounted, useDetailsSimplePC, useGetFuncWrite } from "../hooks";
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
  const [openDialog, setOpenDialog] = useState(false);
  const [openDialogClose, setOpenDialogClose] = useState(false);
  const [input, setInput] = useState({
    amount: "0",
    signature: "",
    newValue: "0",
    newRecipient: "",
    newExpiration: "",
  });
  const [isErrorInput, setIsErrorInput] = useState({
    amount: false,
    signature: false,
    newValue: false,
    newRecipient: false,
    newExpiration: false,
  });

  const { sender, expiration, recipient, balance } = useDetailsSimplePC(
    activeChain,
    contractAddress,
    contractABI
  );
  const { data: signer, isError, isLoading } = useSigner();
  const {
    data: signedMessage,
    isError: isErrorSignedMessage,
    isLoading: isLoadingSignedMessage,
    isSuccess: isSuccessSignedMessage,
    error: errorSignedMessage,
    signMessage,
  } = useSignMessage();

  // newChannel function
  const {
    error: errorNewChannel,
    isError: isErrorNewChannel,
    write: writeNewChannel,
    status: statusNewChannel,
    statusWait: statusNewChannelWait,
  } = useGetFuncWrite(
    "newChannel",
    activeChain,
    contractAddress,
    contractABI,
    isEnabled
  );

  // close function
  const {
    error: errorClose,
    isError: isErrorClose,
    write: writeClose,
    status: statusClose,
    statusWait: statusCloseWait,
  } = useGetFuncWrite(
    "close",
    activeChain,
    contractAddress,
    contractABI,
    isEnabled
  );

  useEffect(() => {
    if (
      statusNewChannel !== "loading" &&
      statusNewChannelWait !== "loading" &&
      statusClose !== "loading" &&
      statusCloseWait !== "loading"
    ) {
      if (disabled) setDisabled(false);
      setInput({
        amount: "0",
        signature: "",
        newValue: "0",
        newRecipient: "",
        newExpiration: "",
      });
    }
    // eslint-disable-next-line
  }, [statusNewChannel, statusNewChannelWait, statusClose, statusCloseWait]);

  if (signedMessage) console.log("SignedMessage=", signedMessage);

  const handleCloseDialog = async (event, reason) => {
    if (
      (reason && (reason === "backdropClick" || reason === "escapeKeyDown")) ||
      event.target.value === "cancel"
    ) {
      setOpenDialog(false);
      setInput({ ...input, newRecipient: "", newExpiration: "" });
    } else {
      if (
        input.newRecipient &&
        input.newRecipient !== "" &&
        utils.isAddress(input.newRecipient)
      ) {
        if (input.newValue && utils.parseEther(input.newValue) > 0) {
          if (input.newExpiration && input.newExpiration !== "") {
            try {
              const localDate = new Date(input.newExpiration);
              const newRecipientFormatted = utils.getAddress(
                input.newRecipient
              );
              const newValueFormatted = utils.parseEther(input.newValue);
              const currentDate = new Date();
              if (localDate > currentDate) {
                const localNewExpiration = BigNumber.from(
                  localDate.getTime() / 1000
                );

                const msg = utils.solidityKeccak256(
                  ["address", "uint256"],
                  [contractAddress, newValueFormatted]
                );
                console.log("msg=", msg);

                const msgHash = utils.keccak256(
                  utils.solidityPack(
                    ["string", "bytes32"],
                    ["\x19Ethereum Signed Message:\n32", msg]
                  )
                );
                console.log("msgHash=", msgHash);
                //const msgHash = utils.hashMessage(msg);
                setDisabled(true);
                //signMessage({ message: msgHash });
                const msgSigned = await signer.signMessage(msgHash);
                console.log("msgSigned=", msgSigned);
                console.log(
                  "verifyMessage=",
                  utils.verifyMessage(msgHash, msgSigned)
                );

                writeNewChannel({
                  args: [newRecipientFormatted, localNewExpiration],
                  overrides: { value: utils.parseEther(input.newValue) },
                });
                setOpenDialog(false);
              }
            } catch (error) {
              console.log(error);
              setIsErrorInput({ ...isErrorInput, newExpiration: true });
            }
          } else {
            setIsErrorInput({ ...isErrorInput, newExpiration: true });
          }
        } else {
          setIsErrorInput({ ...isErrorInput, newValue: true });
        }
      } else {
        setIsErrorInput({ ...isErrorInput, newRecipient: true });
      }
    }
  };

  const handleCloseDialogClose = (event, reason) => {
    if (
      (reason && (reason === "backdropClick" || reason === "escapeKeyDown")) ||
      event.target.value === "cancel"
    ) {
      setOpenDialogClose(false);
      setInput({ ...input, amount: "0", signature: "" });
    } else {
      if (
        input.amount &&
        input.amount !== "0" &&
        utils.parseEther(input.amount) > 0
      ) {
        if (input.signature && input.signature !== "") {
          const amountFormatted = utils.parseEther(input.amount);
          setDisabled(true);
          writeClose({
            args: [amountFormatted, input.signature],
          });
          setOpenDialogClose(false);
        } else {
          setIsErrorInput({ ...isErrorInput, signature: true });
        }
      } else {
        setIsErrorInput({ ...isErrorInput, amount: true });
      }
    }
  };

  const handleNewRecipient = (e) => {
    setInput({ ...input, newRecipient: e.target.value });
    if (isErrorInput.newRecipient)
      setIsErrorInput({ ...isErrorInput, newRecipient: false });
  };
  const handleNewExpiration = (e) => {
    setInput({ ...input, newExpiration: e.target.value });
    if (isErrorInput.newExpiration)
      setIsErrorInput({ ...isErrorInput, newExpiration: false });
  };
  const handleNewValue = (e) => {
    setInput({ ...input, newValue: e.target.value });
    if (isErrorInput.newValue)
      setIsErrorInput({ ...isErrorInput, newValue: false });
  };
  const handleAmount = (e) => {
    setInput({ ...input, amount: e.target.value });
    if (isErrorInput.amount)
      setIsErrorInput({ ...isErrorInput, amount: false });
  };
  const handleSignature = (e) => {
    setInput({ ...input, signature: e.target.value });
    if (isErrorInput.signature)
      setIsErrorInput({ ...isErrorInput, signature: false });
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
          disabled={disabled}
          onClick={() => setOpenDialog(true)}
        >
          New Channel
        </Button>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Create a new Simple Payment Channel</DialogTitle>
          <DialogContent>
            <TextField
              error={isErrorInput.newRecipient}
              autoFocus
              size="small"
              margin="dense"
              id="recipient"
              helperText="Recipient address"
              type="text"
              value={input.newRecipient}
              onChange={handleNewRecipient}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              error={isErrorInput.newExpiration}
              size="small"
              margin="dense"
              id="expiration"
              helperText="Expiration"
              type="datetime-local"
              value={input.newExpiration}
              required
              onChange={handleNewExpiration}
              variant="outlined"
            />
            <TextField
              error={isErrorInput.newValue}
              size="small"
              margin="dense"
              id="newValue"
              helperText="Value (ETH)"
              type="number"
              value={input.newValue}
              required
              onChange={handleNewValue}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button size="small" onClick={handleCloseDialog} value="cancel">
              Cancel
            </Button>
            <Button
              size="small"
              disabled={disabled}
              onClick={handleCloseDialog}
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
              error={isErrorInput.amount}
              autoFocus
              size="small"
              margin="dense"
              id="amount"
              helperText="Amount (ETH)"
              type="number"
              value={input.amount}
              required
              onChange={handleAmount}
              variant="outlined"
            />
            <TextField
              error={isErrorInput.signature}
              size="small"
              margin="dense"
              id="signature"
              helperText="Message Signature"
              type="text"
              value={input.signature}
              onChange={handleSignature}
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
              disabled={disabled}
              onClick={handleCloseDialogClose}
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
