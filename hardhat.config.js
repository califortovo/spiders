require("@nomicfoundation/hardhat-toolbox");
require("hardhat-gas-reporter");
require("hardhat-deploy");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      // { version: "0.8.20" },
      { version: "0.8.19" },
      { version: "0.7.0" },
    ],
  },
  networks: {
    hardhat: {
      forking: {
        url: process.env.BSC_RPC,
      },
    },
    aurora: {
      url: "https://aurora-mainnet.infura.io/v3/51f6962b13fe45a58c9488b33348a900",
      accounts: [process.env.ARB_PRIVATE_KEY],
    },
    sepolia: {
      url: "https://rpc.sepolia.org",
      accounts: [process.env.DEV_ACCOUT_PRIVATE_KEY],
    },
    fantom: {
      url: "https://rpc.ftm.tools",
      accounts: [process.env.ARB_PRIVATE_KEY],
    },
    bsc: {
      url: process.env.BSC_RPC,
      accounts: [process.env.ARB_PRIVATE_KEY],
    },
  },
  namedAccounts: {
    // deployer: {
    //   default: 1,
    // },
    owner: {
      default: 0,
    },
  },
  gasReporter: {
    enabled: true,
    // outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "BNB",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
