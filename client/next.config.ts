import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: false,
  },
  reactStrictMode: true,
};

export default nextConfig;