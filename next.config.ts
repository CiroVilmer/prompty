import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Moved out of experimental in Next.js 16 — requires babel-plugin-react-compiler
  reactCompiler: true,
  // Required to use the 'use cache' directive (moved out of experimental in Next.js 16)
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "media.licdn.com",
      },
    ],
  },
  // Turbopack is the default bundler in Next.js 16 — no flags required
};

export default nextConfig;
