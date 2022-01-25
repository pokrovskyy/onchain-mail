require("@nomiclabs/hardhat-waffle");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  paths: {
    artifacts: './src/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    // rinkeby: {
    //   url: "https://rinkeby.infura.io/v3/3c5e1aa90bb5438e924c7709d8d1cef2", // Get endpoints from https://www.alchemy.com or https://infura.io/
    //   accounts: [`0x${process.env.ACCOUNT_KEY}`] // Get the private key from MetaMask and save it as an environment variable at ~/.zshrc 
    // },
    // ropsten: {
    //   url: "https://ropsten.infura.io/v3/3c5e1aa90bb5438e924c7709d8d1cef2",
    //   accounts: [`0x${process.env.ACCOUNT_KEY}`]
    // }    
  }
};
