/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['placehold.co'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:3001/api',
  },
}

module.exports = nextConfig 