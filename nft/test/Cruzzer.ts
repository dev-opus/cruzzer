import hre from 'hardhat';
import { expect } from 'chai';
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers';

describe('Cruzzer', function () {
  const deployFixture = async () => {
    const cruzzer = await hre.ethers.deployContract('Cruzzer');
    await cruzzer.waitForDeployment();

    const [owner, acc1, acc2] = await hre.ethers.getSigners();

    return { cruzzer, owner, acc1, acc2 };
  };

  it('should mint correctly', async () => {
    const { cruzzer, owner } = await loadFixture(deployFixture);

    await cruzzer
      .connect(owner)
      .mintToken('SkateMouse', 'a mouse skating', 'https://example.com');

    expect(await cruzzer.balanceOf(owner.address)).to.eq(1);
  });

  it('should correctly set an NFT to sellable', async () => {
    const { cruzzer, owner } = await loadFixture(deployFixture);

    await cruzzer
      .connect(owner)
      .mintToken('SkateMouse', 'a mouse skating', 'https://example.com');

    await cruzzer
      .connect(owner)
      .makeNFTSellable(0, hre.ethers.parseUnits('0.2'));

    const nfts = await cruzzer.getNFTs();
    const contractAddr = await cruzzer.getAddress();

    expect(nfts[0].forSale).to.eq(true);
    expect(nfts[0].price).to.eq(hre.ethers.parseUnits('0.2'));

    expect(await cruzzer.balanceOf(owner.address)).to.eq(0);
    expect(await cruzzer.balanceOf(contractAddr)).to.eq(1);
  });

  it('should correctly set an NFT to not-sellable', async () => {
    const { cruzzer, owner } = await loadFixture(deployFixture);

    await cruzzer
      .connect(owner)
      .mintToken('SkateMouse', 'a mouse skating', 'https://example.com');

    await cruzzer
      .connect(owner)
      .makeNFTSellable(0, hre.ethers.parseUnits('0.2'));

    let nfts = await cruzzer.getNFTs();
    const contractAddr = await cruzzer.getAddress();

    expect(nfts[0].forSale).to.eq(true);
    expect(nfts[0].price).to.eq(hre.ethers.parseUnits('0.2'));
    expect(await cruzzer.balanceOf(owner.address)).to.eq(0);

    await cruzzer.connect(owner).makeNFTNonSellable(nfts[0].tokenId);

    nfts = await cruzzer.getNFTs();

    expect(nfts[0].price).to.eq(hre.ethers.parseUnits('0'));
    expect(await cruzzer.balanceOf(owner.address)).to.eq(1);
    expect(await cruzzer.balanceOf(contractAddr)).to.eq(0);
  });

  it('should correctly buy an NFT', async () => {
    const { cruzzer, owner, acc1 } = await loadFixture(deployFixture);
    const contractAddr = await cruzzer.getAddress();

    await cruzzer
      .connect(owner)
      .mintToken('SkateMouse', 'a mouse skating', 'https://example.com');

    await cruzzer
      .connect(owner)
      .makeNFTSellable(0, hre.ethers.parseUnits('0.2'));

    await cruzzer
      .connect(acc1)
      .buyNFT(0, { value: hre.ethers.parseUnits('0.2') });

    expect(await cruzzer.balanceOf(acc1.address)).to.eq(1);
    expect(await cruzzer.balanceOf(contractAddr)).to.eq(0);
    expect(await cruzzer.balanceOf(owner.address)).to.eq(0);
  });

  it('should correctly get all NFTs', async () => {
    const { cruzzer, owner } = await loadFixture(deployFixture);

    const nftData = [
      {
        name: 'skate mouse1',
        desc: 'a mouse skating1',
        uri: 'https://example.com1',
      },
      {
        name: 'skate mouse2',
        desc: 'a mouse skating2',
        uri: 'https://example.com2',
      },
      {
        name: 'skate mouse3',
        desc: 'a mouse skating3',
        uri: 'https://example.com3',
      },
    ];

    for (const d of nftData) {
      await cruzzer.connect(owner).mintToken(d.name, d.desc, d.uri);
    }

    const nfts = await cruzzer.getNFTs();

    expect(nfts.length).to.eq(nftData.length);
  });
});
