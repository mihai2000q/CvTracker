import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  cacheComponents: true,
  cacheLife: {
    listing: { stale: 300, revalidate: 1800, expire: 3600 },
  },
  experimental: {
    serverActions: { bodySizeLimit: '11mb' },
    turbopackFileSystemCacheForDev: true,
  },
};

export default nextConfig;
