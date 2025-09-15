import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: process.env.NODE_ENV === "production" ? ".next" : ".next-dev",

  basePath: "/bomberos",

  eslint: {
    ignoreDuringBuilds: true
  },
  experimental: {
    browserDebugInfoInTerminal: {
      showSourceLocation: true,
      depthLimit: 2
    },
    clientSegmentCache: true,
    reactCompiler: true,
    ppr: true,
    cssChunking: true,
    useCache: true,
    cacheComponents: true,
    cacheLife: {
      // 10 minutes, 1 hour, 1 day
      homepage: {
        stale: 600,
        revalidate: 3600,
        expire: 86400
      },
      // 1 minute, 3 minutes, 1 hour
      openIncident: {
        stale: 60,
        revalidate: 180,
        expire: 3600
      },
      // 1 day, 1 week, 1 month
      closedIncident: {
        stale: 86400,
        revalidate: 604800,
        expire: 2592000
      },
      // 10 minutes, 1 hour, 1 day
      station: {
        stale: 600,
        revalidate: 3600,
        expire: 86400
      }
    }
  },

  typedRoutes: true,

  images: {
    qualities: [65, 75, 80, 90, 95, 100]
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
