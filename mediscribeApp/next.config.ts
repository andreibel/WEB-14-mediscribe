import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained `.next/standalone` server (server.js + traced
  // node_modules only) for a minimal production Docker image.
  output: "standalone",
};

export default nextConfig;
