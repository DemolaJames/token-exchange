const HDWalletProvider = require('truffle-hdwallet-provider-privkey');

require('babel-register');
require('babel-polyfill');
require('dotenv').config();
const privateKeys = process.env.PRIVATE_KEYS || ""
module.exports = {

  networks: {
   development:{
     host: "127.0.0.1",
     port: 7545,
     network_id: "*"
   },
   kovan: {
     provider: function() {
      return new HDWalletProvider(
        // Private key 
        privateKeys.split(','),
        // Url to Eth Node
        `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`
      )
     },
     gas: 5000000,
     gasPrice: 2500000000,
     network_id: 42
   }
  },

  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis/',

  // Configure your compilers
  compilers: {
    solc: {
      // version: "0.5.1",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: true,
         runs: 200
       },
      //  evmVersion: "byzantium"
      // }
    },
  },
};