import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  output: 'export',
  basePath: '/PLC_Fishbowl',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

