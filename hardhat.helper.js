require("dotenv").config();

const networks = {
  optimism: {
    rpc: process.env.OPTIMISM_RPC,
    apiUrl: "https://api-optimistic.etherscan.io/api",
    apiKey: process.env.OPTIMISM_API_KEY,
  },
  base: {
    rpc: process.env.BASE_RPC,
    apiUrl: "https://api.basescan.org/api",
    apiKey: process.env.BASE_API_KEY,
  },
  fantom: {
    rpc: process.env.FANTOM_RPC,
    apiUrl: "https://api.ftmscan.com/api",
    apiKey: process.env.FANTOM_API_KEY,
  },
  bsc: {
    rpc: process.env.FANTOM_RPC,
    apiUrl: "https://api.bscscan.com/api",
    apiKey: process.env.BSC_API_KEY,
  },
  // mainnet: {
  //   rpc: "https://eth.llamarpc.com",
  //   apiUrl: "",
  //   apiKey: "",
  // },
};

const developmentChains = ["hardhat", "localhost"];
const productionChains = ["bsc", "fantom"];

module.exports = {
  developmentChains,
  productionChains,
  networks,
};
