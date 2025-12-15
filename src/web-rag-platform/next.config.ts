import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable x-powered-by header for security
  poweredByHeader: false,

  // Configure headers for better caching and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // Optimize images
  images: {
    unoptimized: true, // Since we're using a simple setup
  },
};

export default nextConfig;
