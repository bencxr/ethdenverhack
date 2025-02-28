require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    // For local development
    hardhat: {},
    // For Sepolia testnet
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    // For mainnet (when ready)
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    // For Flow mainnet
    flow: {
      url: process.env.FLOW_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
    },
    flowEvmMainnet: {
      url: process.env.FLOW_EVM_MAINNET_RPC_URL || "https://mainnet.flow.com/rpc",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 646,
    }
  },
  etherscan: {
    apiKey: {
      flowEvmMainnet: "no-api-key-needed"
    },
    customChains: [
      {
        network: "flowEvmMainnet",
        chainId: 646,
        urls: {
          apiURL: "https://mainnet.flow.com/api",
          browserURL: "https://flowscan.org"
        }
      }
    ]
  },
};
