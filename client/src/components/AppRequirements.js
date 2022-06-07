import Stack from "@mui/material/Stack";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

const AppRequirements = () => {
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
          Requirements
        </Typography>

        <Typography component="div" gutterBottom={false} paragraph={true}>
          <div>
            In order to interract with the deployed application, you need to
            have a browser extension that lets you interact with the blockchain,
            like{" "}
            <Link
              href="https://metamask.io/"
              color="primary"
              underline="always"
            >
              Metamask
            </Link>
          </div>

          <div>
            Also, you need to get some free ETH from the{" "}
            <Link
              href="https://faucets.chain.link/"
              color="primary"
              underline="always"
            >
              Rinkeby Faucet
            </Link>{" "}
            in your Metamask account
          </div>
        </Typography>

        <Paper elevation={1}>
          <Typography component="div" gutterBottom={false} paragraph={true}>
            For further code testing and deployment, you will need additional
            tools:
          </Typography>
          <Typography component="div">
            <Link
              href="https://git-scm.com/book/en/v2/Getting-Started-Installing-Git"
              color="primary"
              underline="always"
            >
              git
            </Link>
          </Typography>
          <Typography component="div" gutterBottom={false} paragraph={true}>
            You'll know you've installed git right if you can run: `git
            --version` and you get an output like `git version x.x.x`
          </Typography>
          <Typography component="div">
            <Link
              href="https://nodejs.org/en/"
              color="primary"
              underline="always"
            >
              Nodejs
            </Link>
          </Typography>
          <Typography component="div" gutterBottom={false} paragraph={true}>
            You'll know you've installed nodejs right if you can run: `node
            --version` and you get an ouput like: `vx.x.x`
          </Typography>
          <Typography component="div">
            <Link
              href="https://docs.npmjs.com/downloading-and-installing-node-js-and-npm"
              color="primary"
              underline="always"
            >
              Npm
            </Link>
          </Typography>
          <Typography component="div" gutterBottom={false} paragraph={true}>
            You'll know you've installed npm right if you can run: `npm
            --version` and you get an output like: `x.x.x`
          </Typography>
          <Typography component="div">
            <Link
              href="https://eth-brownie.readthedocs.io/en/stable/install.html"
              color="primary"
              underline="always"
            >
              Brownie
            </Link>
          </Typography>
          <Typography component="div" gutterBottom={false} paragraph={true}>
            <div>Here is a simple way to install brownie.</div>
            <code>pip install eth-brownie</code>
            <div>Or, if that doesn't work, via pipx:</div>
            <code>pip install --user pipx pipx ensurepath</code>
            <div>restart your terminal, then</div>
            <code>pipx install eth-brownie</code>
          </Typography>
          <Typography component="div" gutterBottom={false} paragraph={true}>
            You'll know you've installed brownie right if you can run: `brownie
            --version` and you get an output like: `Brownie v1.18.2 - Python
            development framework for Ethereum`
          </Typography>
        </Paper>
      </Stack>
    </Paper>
  );
};

export default AppRequirements;
