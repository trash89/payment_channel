import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";

const AppDescription = () => {
  return (
    <Paper elevation={4}>
      <Stack
        direction="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        spacing={1}
        padding={1}
      >
        <Typography variant="h6" gutterBottom={true} component="div">
          Payment Channels
        </Typography>

        <Typography component="div" gutterBottom={false} paragraph={true}>
          <div>
            This repository contains a Payment Channels Ethereum Fullstack
            webapp
          </div>
          <div>
            and demonstrates basic operations on these smartcontracts using
            different software components and libraries, like
          </div>
          <Stack
            direction="row"
            justifyContent="flex-start"
            alignItems="flex-start"
            spacing={4}
            padding={0}
          >
            <List>
              <ListItem disablePadding>
                <Link
                  href="https://reactjs.org/"
                  color="primary"
                  underline="always"
                >
                  <ListItemText primary="React" />
                </Link>
              </ListItem>
              <ListItem disablePadding>
                <Link
                  href="https://wagmi.sh/"
                  color="primary"
                  underline="always"
                >
                  <ListItemText primary="Wagmi" />
                </Link>
              </ListItem>
              <ListItem disablePadding>
                <Link
                  href="https://www.rainbowkit.com/"
                  color="primary"
                  underline="always"
                >
                  <ListItemText primary="RainbowKit" />
                </Link>
              </ListItem>
            </List>
            <List>
              <ListItem disablePadding>
                <Link
                  href="https://mui.com/"
                  color="primary"
                  underline="always"
                >
                  <ListItemText primary="Material UI" />
                </Link>
              </ListItem>
              <ListItem disablePadding>
                <Link
                  href="https://eth-brownie.readthedocs.io/en/stable/"
                  color="primary"
                  underline="always"
                >
                  <ListItemText primary="Brownie" />
                </Link>
              </ListItem>
              <ListItem disablePadding>
                <Link
                  href="https://hardhat.org/"
                  color="primary"
                  underline="always"
                >
                  <ListItemText primary="Hardhat" />
                </Link>
              </ListItem>
            </List>
          </Stack>
        </Typography>
      </Stack>
    </Paper>
  );
};

export default AppDescription;
