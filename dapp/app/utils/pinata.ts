export async function pinFile(file: File) {
  try {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));
    formData.append('pinataMetadata', JSON.stringify({ name: file.name }));

    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'post',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT as string}`,
      },
      body: formData,
    });

    const { IpfsHash } = await res.json();
    return process.env.NEXT_PUBLIC_GATEWAY + '/ipfs/' + IpfsHash;
  } catch (error) {
    console.log(error);
  }
}

export async function pinJSON(data: {
  name: string;
  image: string;
  description: string;
}) {
  try {
    const body = JSON.stringify({
      pinataContent: { ...data },
      pinataMetadata: { name: 'metadata.json' },
    });

    const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'post',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_JWT as string}`,
        'Content-Type': 'application/json',
      },
      body,
    });

    const { IpfsHash } = await res.json();
    return process.env.NEXT_PUBLIC_GATEWAY + '/ipfs/' + IpfsHash;
  } catch (error) {
    console.error(error);
  }
}
