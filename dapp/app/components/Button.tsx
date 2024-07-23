'use client';
import { useState } from 'react';
import { Address } from 'viem';

export function Button(props: {
  price?: string | number;
  forSale: boolean;
  creator: Address;
  pending: boolean;
  currentAddress: Address | undefined;
  handler: (
    tokenId: string,
    action: 'buy' | 'list' | 'deList',
    price?: string | number
  ) => void;
  tokenId: string;
}) {
  const [localPrice, setLocalPrice] = useState(props.price);
  const { price, forSale, creator, currentAddress, handler, tokenId, pending } =
    props;

  if (forSale) {
    if (creator === currentAddress) {
      return (
        <>
          <button
            onClick={async () => {
              await handler(tokenId, 'deList');
            }}
            disabled={pending}
          >
            De-list NFT
          </button>
        </>
      );
    }

    return (
      <>
        <button
          onClick={async () => {
            await handler(tokenId, 'buy', price);
          }}
          disabled={pending}
        >
          Buy NFT for {price} CELO
        </button>
      </>
    );
  }

  if (!forSale) {
    if (creator === currentAddress) {
      return (
        <>
          <div className="btn-form">
            <input
              type="number"
              name="nft-price"
              id="nft-price"
              min={0}
              value={localPrice}
              onChange={(e) => setLocalPrice(e.target.value)}
            />
            <button
              onClick={async () => {
                await handler(tokenId, 'list', localPrice);
              }}
              disabled={pending}
            >
              List NFT for sale
            </button>
          </div>
        </>
      );
    }

    return (
      <>
        <button disabled={true}>NFT not for sale</button>
      </>
    );
  }
}
