import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Required for production Docker deployment
};

export default nextConfig;
