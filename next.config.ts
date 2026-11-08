import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qb.sartawi.dev",
      },
      {
        protocol: "https",
        hostname: "tahoe.sartawi.dev",
      },
    ],
  },
}

export default nextConfig
