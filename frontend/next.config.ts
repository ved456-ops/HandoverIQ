import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The backend URL is consumed server-side by route handlers.
  // The public var is exposed to the browser for direct fetch calls.
  env: {
    BACKEND_URL: process.env.BACKEND_URL ?? "http://localhost:8000",
  },
};

export default nextConfig;
