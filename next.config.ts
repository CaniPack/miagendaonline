import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@clerk/nextjs"],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
