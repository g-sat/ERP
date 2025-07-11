import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Removed static export config to fix dynamic routes issue
  // output: "export",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
}

export default nextConfig
