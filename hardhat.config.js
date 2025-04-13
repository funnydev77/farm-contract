require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  allowUnlimitedContractSize: true,
  solidity: {
    compilers: [
      {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },
  networks: {
    sonic_test: {
      url: "https://rpc.blaze.soniclabs.com",
      accounts: [`0x${process.env.TEST_PK}`]
    },
  },
  etherscan: {
    apiKey: {
      sonic_test: process.env.ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "sonic_test",
        chainId: 57054,
        urls: {
          apiURL: "https://api-testnet.sonicscan.org/api",
          browserURL: "https://testnet.sonicscan.org/",
        },
      },
    ],
  },
};