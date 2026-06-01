import type { NextConfig } from "next";

const isExport = process.env.NEXT_PUBLIC_EXPORT === 'true' || process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  reactStrictMode: false,
  ...(isExport ? { output: 'export' } : {}),
  basePath: '/PLC_fishbowl',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;


