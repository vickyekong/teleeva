import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No "output: export" — API routes (diagnosis, cases, doctor) require a server. Deploy with Vercel/Node.
  productionBrowserSourceMaps: false,
  typescript: { ignoreBuildErrors: true },
  experimental: {
    turbopackFileSystemCacheForBuild: true,
  },
};

export default nextConfig;
