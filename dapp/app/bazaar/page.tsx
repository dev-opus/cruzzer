'use client';
import './style.css';
import { Card } from '@/app/components';
import {
  Address,
  formatEther,
  formatUnits,
  parseEther,
  parseUnits,
} from 'viem';
import cruzzer from '@/contracts/cruzzer.json';
import React, { useEffect, useState } from 'react';
import {
  useReadContract,
  useWriteContract,
  useAccount,
  useWaitForTransactionReceipt,
} from 'wagmi';

export default function Bazaar() {
  // states

  const [nfts, setNfts]: any[] = useState([]);
  const [filterText, setFilterText] = useState('showing all NFTs');

  const { address } = useAccount();
  const { data: hash, isPending, writeContractAsync } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const {
    data,
    error,
    isPending: pending,
  } = useReadContract({
    abi: cruzzer.abi,
    address: process.env.NEXT_PUBLIC_CRUZZER_ADDRESS as Address,
    functionName: 'getNFTs',
  });

  useEffect(() => {
    async function composeNfts(rawNfts: any[]) {
      const nfts = [];

      for (let i = 0; i < rawNfts.length; i++) {
        const raw = await fetch('https://' + rawNfts[i].tokenURI);
        const res = await raw.json();

        const data = {
          name: res.name as string,
          desc: res.description as string,
          image: 'https://' + res.image,
          price: formatEther(rawNfts[i].price),
          forSale: rawNfts[i].forSale as boolean,
          tokenId: parseUnits(rawNfts[i].tokenId, 10),
          creator: rawNfts[i].owner as Address,
        };

        nfts.push(data);
      }

      return nfts;
    }

    if (data) {
      composeNfts(data as []).then((data) => setNfts(data));
    }
  }, [data]);

  /**
   *
   * @description filter state handler
   *
   */

  function handleFilters(e: React.ChangeEvent<HTMLSelectElement>) {
    const filter = e.target.value;

    async function composeNfts(rawNfts: any[]) {
      const nfts = [];

      for (let i = 0; i < rawNfts.length; i++) {
        const raw = await fetch('https://' + rawNfts[i].tokenURI);
        const res = await raw.json();

        const data = {
          name: res.name as string,
          desc: res.description as string,
          image: 'https://' + res.image,
          price: formatEther(rawNfts[i].price),
          forSale: rawNfts[i].forSale as boolean,
          tokenId: formatUnits(rawNfts[i].tokenId, 1),
          creator: rawNfts[i].owner as Address,
        };

        nfts.push(data);
      }

      return nfts;
    }

    if (filter === 'all') {
      composeNfts(data as []).then((data) => setNfts(data));
    }

    if (filter === 'mine') {
      composeNfts(data as []).then((data) => {
        const nftsToShow = data.filter(
          (nft: any) => nft.creator === (address as Address)
        );

        setNfts(() => nftsToShow);
        setFilterText(() => 'showing only your NFTs');
      });
    }

    if (filter === 'sale') {
      const nftsToShow = nfts.filter((nft: any) => nft.forSale === true);
      setNfts(() => nftsToShow);
      setFilterText(() => 'showing only NFTs listed for sale');
    }
  }

  /**
   *
   * @description - Card button Handler
   *
   */

  async function cardButtonHandler(
    tokenId: string,
    action: 'buy' | 'list' | 'deList',
    price?: string | number
  ) {
    console.log({ tokenId, price });

    try {
      if (action === 'buy') {
        await writeContractAsync({
          abi: cruzzer.abi,
          address: process.env.NEXT_PUBLIC_CRUZZER_ADDRESS as Address,
          functionName: 'buyNFT',
          args: [Number(tokenId)],
          value: parseEther(price as string),
        });
      }

      if (action === 'list') {
        if (!price) {
          alert('Price must be set');
          return;
        }

        if (Number(price) <= 0) {
          alert('Price must be > 0');
          return;
        }

        await writeContractAsync({
          abi: cruzzer.abi,
          address: process.env.NEXT_PUBLIC_CRUZZER_ADDRESS as Address,
          functionName: 'makeNFTSellable',
          args: [Number(tokenId), parseEther(price as string)],
        });
      }

      if (action === 'deList') {
        await writeContractAsync({
          abi: cruzzer.abi,
          address: process.env.NEXT_PUBLIC_CRUZZER_ADDRESS as Address,
          functionName: 'makeNFTNonSellable',
          args: [Number(tokenId)],
        });
      }
    } catch (error: any) {
      alert(error.message);
      console.error(error);
    }
  }

  if (isConfirmed) {
    alert('transaction successful!');
    window.location.reload();
  }

  if (pending) {
    return (
      <>
        <h2>Loading the Bazaar...</h2>
      </>
    );
  }

  if (error) {
    return (
      <>
        <h2>An error occurred...</h2>
        <code>{error.details}</code>
      </>
    );
  }

  return (
    <>
      <div className="bazaar">
        <div className="synopsis">
          <h2>Bazaar</h2>

          <p>
            This is Cruzzer{"'s"} own NFT Marketplace dubbed {'"bazaar"'}. Here,
            you can browse through a list of NFTs and perform the following
            actions listed below:
          </p>

          <ul>
            <li>
              Buy listed NFTs that have been minted and put up for sale by their
              owners
            </li>

            <li>List your own NFTs for sale</li>
            <li>
              De-list your listed NFTs that you previously put up for sale (if
              not already bought!)
            </li>
          </ul>
        </div>

        <div className="bazaar-filter">
          <label htmlFor="filter">Choose which NFTs to see: </label>
          <select name="filter" id="filter" onChange={handleFilters}>
            <option value="all">All</option>
            <option value="mine">Mine</option>
            <option value="sale">For sale</option>
          </select>

          <span>{filterText}</span>
        </div>

        <div className="bazaar-cards">
          {nfts.map((nft: any) => {
            return (
              <Card
                key={nft.tokenId}
                price={nft.price}
                forSale={nft.forSale}
                name={nft.name}
                image={nft.image}
                creator={nft.creator}
                desc={nft.desc}
                tokenId={nft.tokenId}
                pending={isPending}
                handler={cardButtonHandler}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
