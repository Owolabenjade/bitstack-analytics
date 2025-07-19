/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@stacks/stacks-blockchain-api-types'],
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;
