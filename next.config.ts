import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      // Ignore optional dependency pulled in by pino during bundling
      "pino-pretty": false as unknown as string,
    } as typeof config.resolve.alias;
    return config;
  },
};

export default nextConfig;
