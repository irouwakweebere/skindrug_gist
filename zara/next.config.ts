import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Arena previews use per-sandbox e2b.app hosts; allow dev assets from those preview origins.
  allowedDevOrigins: ["*.e2b.app"],
  experimental: {
    agentUpgrade: "security",
  },
};

export default nextConfig;
