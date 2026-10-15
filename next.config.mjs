/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.startech.com.bd',
      },
      {
        protocol: 'https',
        hostname: 'startech.com.bd',
      },
      {
        protocol: 'https',
        hostname: 'www.ucc.com.bd',
      },
      {
        protocol: 'https',
        hostname: 'ucc.com.bd',
      },
      {
        protocol: 'https',
        hostname: 'www.ryans.com',
      },
      {
        protocol: 'https',
        hostname: 'ryans.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      }
    ],
  },
};

export default nextConfig;
