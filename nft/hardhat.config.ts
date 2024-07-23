import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'dotenv/config';

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  networks: {
    alfajores: {
      url: 'https://alfajores-forno.celo-testnet.org',
      accounts: {
        mnemonic: process.env.MNEMONIC,
        path: "m/44'/60'/0'/0",
      },
      chainId: 44787,
    },
  },
};

export default config;
