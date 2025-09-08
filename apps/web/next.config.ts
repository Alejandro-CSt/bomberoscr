import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: process.env.NODE_ENV === "production" ? ".next" : ".next-dev",

  basePath: process.env.NODE_ENV === "production" ? "/bomberos" : "",

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
  },

  typedRoutes: true,

  images: {
    qualities: [75, 80, 90, 95, 100]
  },

  productionBrowserSourceMaps: true,

  logging: {
    fetches: {
      fullUrl: true
    },
    incomingRequests: true
  }
};

export default nextConfig;
