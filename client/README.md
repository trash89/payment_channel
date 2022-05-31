# Client Application for the Simple&Blind Auction contracts

## Frontend on the Rinkeby Testnet

The application is live on Netlify with the Ballot contract deployed on Rinkeby

https://auctionfullstack.netlify.app/

![Simple Auction webapp ](../simpleAuction_frontend.png)

![Blind Auction webapp ](../blindAuction_frontend.png)

## Quickstart

### `npm install`

To install the required packages.

### `configure .env`

Configure .env file in the client folder
An example of .env file :

```bash .env
GENERATE_SOURCEMAP=false
ALCHEMY_ID="your-api-key"
```

### `start the application`

```bash
npm start
```

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

You can switch the networks between hardhat and rinkeby.
