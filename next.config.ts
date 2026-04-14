import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    reactCompiler: true,
  },
  // Turbopack is the default bundler in Next.js 16 — no flags required
};

export default nextConfig;
