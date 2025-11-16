/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Transpile workspace packages
  transpilePackages: ['@neiro/types', '@neiro/utils'],
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  },
  
  // Image domains (если будем использовать MinIO)
  images: {
    domains: ['localhost'],
  },
  
  // Server Actions enabled by default in Next.js 14+
}

module.exports = nextConfig
