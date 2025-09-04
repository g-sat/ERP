import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Removed static export config to fix dynamic routes issue
  // output: "export",

  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },

  // Ensure static files are served correctly
  trailingSlash: false,

  // Webpack configuration for React-PDF
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Configure React-PDF for client-side usage
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        fs: false,
        path: false,
        stream: false,
        util: false,
      }
    }
    return config
  },

  // Configure static file serving
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/documents/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },

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
    // Enable unoptimized images for better compatibility
    unoptimized: true,
  },
}

export default nextConfig
