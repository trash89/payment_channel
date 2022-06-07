import Stack from "@mui/material/Stack";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

import Typography from "@mui/material/Typography";
import { AppDescription, AppRequirements } from ".";
import { useNetwork } from "wagmi";

const SupportedNetworks = () => {
  const { chains, isError, error } = useNetwork();
  return (
    <Stack
      direction="column"
      justifyContent="flex-start"
      alignItems="flex-start"
      spacing={1}
      padding={1}
    >
      <Typography variant="h6" gutterBottom={true} component="div">
        Please connect the wallet to a supported network
      </Typography>
      {chains && (
        <List>
          {chains.map((x) => {
            return (
              <ListItem disablePadding key={x.id}>
                <ListItemText>{x.name}</ListItemText>
              </ListItem>
            );
          })}
        </List>
      )}

      {isError && <div>{error.message}</div>}
      <AppDescription />
      <AppRequirements />
    </Stack>
  );
};

export default SupportedNetworks;
