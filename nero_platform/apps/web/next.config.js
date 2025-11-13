/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@neiro/database', '@neiro/types', '@neiro/utils'],
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;

