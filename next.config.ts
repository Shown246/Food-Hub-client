import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    useTypeScriptCli: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.cloudflarestorage.com" },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
};

export default nextConfig;
