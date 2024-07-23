/* eslint-disable @next/next/no-img-element */
'use client';
import './style.css';

import Image from 'next/image';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import { Button } from './Button';

export function Card(props: {
  name: string;
  desc: string;
  image: string;
  price?: string | number;
  forSale: boolean;
  creator: Address;
  tokenId: string;
  pending: boolean;
  handler: (
    tokenId: string,
    action: 'buy' | 'list' | 'deList',
    price?: string | number
  ) => void;
}) {
  const { address } = useAccount();
  const {
    name,
    desc,
    image,
    price,
    forSale,
    creator,
    tokenId,
    handler,
    pending,
  } = props;

  return (
    <>
      <div className="card">
        <div className="card-image">
          <img src={image} alt={name} className="img" />
        </div>

        <div className="card-body">
          <div className="card-row">
            <span className="title">Name</span>
            <span className="text">{name}</span>
          </div>

          <div className="card-row">
            <span className="title">Description</span>
            <span className="text">{desc}</span>
          </div>

          <div className="card-row">
            <span className="title">Creator</span>
            <span className="text">
              {creator.substring(0, 4) + '...' + creator.substring(38, 42)}
            </span>
          </div>

          <div className="card-action">
            <Button
              price={price}
              creator={creator}
              currentAddress={address}
              forSale={forSale}
              tokenId={tokenId}
              handler={handler}
              pending={pending}
            />
          </div>
        </div>
      </div>
    </>
  );
}
