# CRUZZER NFTs

## Overview

**CRUZZER NFTs** is a PoC NFT marketplace smart contract and decentralised application that allow users to perform the following:

- Mint Custom NFTs
- Put up Minted NFTs for sale
- Buy NFTs from other users of the application

## Functionalities, Structures and Setup

### Structures

1. NFTDetails

   A struct for holding associated details of a particular NFT

```solidity
    struct NFTDetails {
        address payable owner;
        bool forSale;
        uint price;
        uint tokenId;
        string name;
        string desc;
        string tokenURI;
    }

```

2. minted

   An array of NFTDetails objects

```solidity
  NFTDetails[] minted
```

### Functionalities

1. **mintToken**

   - **functionality**: Mints a new NFT and transfers it to the address of the user

   - **params**: name, desc and \_tokenURI
   - **returns**: NFTDetails

2. **makeNFTSellable**

   - **functionality**: makes an NFT sellable buy transfering ownership to the contract's address
   - **params**: tokenId and price
   - **returns**: NFTDetails

3. **makeNFTNonSellable**

   - **functionality**: makes an NFT non-sellable buy transfering ownership from the contract's address back to the user who created it.
   - **params**: tokenId
   - **returns**: NFTDetails

4. **buyNFT**

   - **functionality**: buys an NFT from the marketplace buy transferring its ownership to the caller and transferring CELO (the attached price) to the address of the NFT creator.
   - **params**: tokenId

5. **getNFTs**
   - **functionality**: get all the minted NFTs
   - **returns**: NFTDetails[] (an array of NFTDetails objects)

### Setup

1. Installation: run `pnpm i` in the `nft` directory to install required dependencies
2. Compilation: run `pnpm exec hardhat compile`
3. Testing: run `pnpm exec hardhat test`
4. Deployment: run `pnpm exec hardhat run ignition/module/Cruzzer.ts` for local deployment and `pnpm exec hardhat run --network alfajores ignition/module/Cruzzer.ts` for deployment on Celo's Alfajores' testnet.

## User Interface

The user interface has been developed with a JavaScript framework, Next.js v14 and helper libraries mainly

- **RainbowKit** and **TransactQuery** for wallet connections
- **Wagmi** for contract interaction (send read and write transactions)
- **Viem** for utilities and interfaces (parsing and formatting ether, etc)

### Pages

- **Home**: Provides a welcome screen and overview of the DApp
- **Minter**: Provides a form for minting NFTs
- **Bazaar**: Provides a marketplace for viewing, buying and setting minted NFTs as "for sale" or "not for sale"

### Setup

1. Installation: run `pnpm i` in the `dapp` directory to install required dependencies
2. Local deployment: run `pnpm dev` to use the DApp in the development.
3. Production deployment: run `pnpm build` and follow the instructions for your preferred hosting platform to host the DApp and use it in live mode.
