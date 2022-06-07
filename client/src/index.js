import React from "react";
import ReactDOM from "react-dom";
import "normalize.css";
import "@rainbow-me/rainbowkit/styles.css";
import "./index.css";
import App from "./App";
import { themeOptions } from "./MUITheme";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import {
  getDefaultWallets,
  RainbowKitProvider,
  // eslint-disable-next-line
  connectorsForWallets,
  // eslint-disable-next-line
  wallet,
} from "@rainbow-me/rainbowkit";
import { createClient, chain, configureChains, WagmiConfig } from "wagmi";

import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";

if (!process.env.REACT_APP_ALCHEMY_ID)
  throw new Error(
    "Missing environment variables. Make sure to set your .env file."
  );

const { chains, provider } = configureChains(
  [chain.hardhat, chain.rinkeby],
  [
    alchemyProvider({ alchemyId: process.env.REACT_APP_ALCHEMY_ID }),
    publicProvider(),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Payment Channels, with Wagmi,Rainbowkit and Material-UI",
  chains,
});

// const connectors = connectorsForWallets([
//   {
//     groupName: "Recommended",
//     wallets: [wallet.injected({ chains })],
//   },
// ]);

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const theme = createTheme(themeOptions);

ReactDOM.render(
  // <React.StrictMode>
  <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider chains={chains}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </RainbowKitProvider>
  </WagmiConfig>,
  // </React.StrictMode>,
  document.getElementById("root")
);
