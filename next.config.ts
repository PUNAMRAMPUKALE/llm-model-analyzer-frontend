/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  // Keep both empty for localhost dev:
  assetPrefix: isProd ? process.env.NEXT_PUBLIC_ASSET_PREFIX ?? '' : '',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  reactStrictMode: true,
  // (optional) helps some setups when mixing origins/CDN
  crossOrigin: 'anonymous'
};

module.exports = nextConfig;
