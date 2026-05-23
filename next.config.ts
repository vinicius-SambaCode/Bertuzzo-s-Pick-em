import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: "http",  hostname: "localhost" },
      { protocol: "https", hostname: "flagcdn.com"    }, // bandeiras dos times
      { protocol: "https", hostname: "**" },
    ],
    unoptimized: process.env.NODE_ENV === "development",
  },
  experimental: {
    serverActions: { bodySizeLimit: "3mb" },
  },
}

export default nextConfig
