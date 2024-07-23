/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'teal-working-salmon-984.mypinata.cloud',
        port: '',
      },
    ],
  },
};

export default nextConfig;
