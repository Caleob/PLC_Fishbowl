import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: 'export',
  basePath: '/PLC_fishbowl',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

