import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
      {
        protocol: "https",
        hostname: "vdaqddgufzqurslmhbxn.supabase.co",
      },
    ],
  },
};

export default nextConfig;
