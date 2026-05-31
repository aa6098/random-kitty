import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "randomkitty.blob.core.windows.net", // Replace with your image provider's domain
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
