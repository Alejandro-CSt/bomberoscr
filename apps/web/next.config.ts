import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: process.env.NODE_ENV === "production" ? ".next" : ".next-dev",
  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    browserDebugInfoInTerminal: {
      showSourceLocation: true,
      depthLimit: 2
    },
    devtoolSegmentExplorer: true,
    clientSegmentCache: true,
    reactCompiler: true,
    ppr: true,
    cssChunking: true,
    useCache: true,
    cacheComponents: true
  }
};

export default nextConfig;
