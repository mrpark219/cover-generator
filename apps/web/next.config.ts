import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@cover-generator/cover-renderer", "@cover-generator/shared"]
};

export default nextConfig;

