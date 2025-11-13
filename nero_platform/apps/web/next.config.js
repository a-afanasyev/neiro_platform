/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Transpile workspace packages
  transpilePackages: ['@neiro/types', '@neiro/utils'],
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4001',
  },
  
  // Image domains (если будем использовать MinIO)
  images: {
    domains: ['localhost'],
  },
  
  // Experimental features
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
