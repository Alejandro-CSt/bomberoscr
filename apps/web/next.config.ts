import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: process.env.NODE_ENV === "production" ? ".next" : ".next-dev",
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
