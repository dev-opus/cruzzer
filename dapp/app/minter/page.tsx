'use client';
import '@/app/minter/style.css';
import cruzzer from '@/contracts/cruzzer.json';

import React from 'react';
import { Address } from 'viem';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';

import { pinFile, pinJSON } from '@/app/utils/pinata';

export default function Page() {
  //states
  const { data: hash, writeContractAsync } = useWriteContract();

  const {
    isPending: pending,
    isSuccess: confirmed,
    isLoading: loading,
  } = useWaitForTransactionReceipt({ hash });

  /**
   *
   * @param formData
   * @returns void
   * @description - form handler
   */

  async function formAction(formData: FormData) {
    try {
      const rawFormData = Object.fromEntries(formData);

      console.log({ rawFormData });

      if (!rawFormData.name || !rawFormData.image || !rawFormData.desc) {
        alert('All fields are required!');
        return;
      }

      const imgaeUrl = await pinFile(rawFormData.image as File);

      const tokenURI = await pinJSON({
        name: rawFormData.name as string,
        image: imgaeUrl as string,
        description: rawFormData.desc as string,
      });

      await writeContractAsync({
        abi: cruzzer.abi,
        address: process.env.NEXT_PUBLIC_CRUZZER_ADDRESS as Address,
        functionName: 'mintToken',
        args: [rawFormData.name, rawFormData.desc, tokenURI],
      });
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    }
  }

  if (confirmed) {
    alert('Successfully minted an NFT!');
    window.location.reload();
  }

  return (
    <>
      <div className="minter">
        <div className="synopsis">
          <h2>Cruzzer Minting Factory</h2>
          <p>
            Here, you can mint your own custom NFTs! Fill out the form to get
            started!
          </p>
        </div>

        <fieldset>
          <legend>Minter</legend>

          <form action={formAction}>
            <div className="form-control">
              <label htmlFor="name">Name:</label>
              <input type="text" name="name" id="name" />
            </div>

            <div className="form-control">
              <label htmlFor="image">Image:</label>
              <input type="file" name="image" id="image" accept="image/*" />
            </div>

            <div className="form-control textarea">
              <label htmlFor="desc">Description:</label>
              <textarea name="desc" id="desc"></textarea>
            </div>

            <div className="form-action">
              <button type="submit" disabled={loading}>
                {loading && pending ? 'Minting...' : 'Mint'}
              </button>
            </div>
          </form>
        </fieldset>
      </div>
    </>
  );
}
