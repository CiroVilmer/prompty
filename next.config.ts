import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Moved out of experimental in Next.js 16 — requires babel-plugin-react-compiler
  reactCompiler: true,
  experimental: {
    // Required to use the 'use cache' directive
    cacheComponents: true,
  },
  // Turbopack is the default bundler in Next.js 16 — no flags required
};

export default nextConfig;
