/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true, // For Render deployment
  },
  // Enable static exports if needed
  output: 'standalone',
  // Webpack alias configuration
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '.'),
    }
    return config
  },
}

module.exports = nextConfig

