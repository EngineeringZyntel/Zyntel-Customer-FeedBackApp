/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: true, // For Render deployment
  },
  // Enable static exports if needed
  output: 'standalone',
}

module.exports = nextConfig

