import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    BACKEND_URL:
      process.env.BACKEND_URL ??
      "https://handoveriq-backend-production.up.railway.app",
  },
};

export default nextConfig;
