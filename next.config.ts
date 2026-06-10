import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure headers for API routes to prevent caching and ensure fresh responses
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Content-Type",
            value: "application/json",
          },
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
    ];
  },
  
  // Disable font optimization if NEXT_DISABLE_FONT_DOWNLOAD is set
  ...(process.env.NEXT_DISABLE_FONT_DOWNLOAD === "1" && {
    optimizeFonts: false,
  }),
};

export default nextConfig;
