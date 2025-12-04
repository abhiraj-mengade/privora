import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config) => {
    // Alias `ethers` to a v6-compatible shim that also exposes `utils`
    // for libraries (like thirdweb) that expect ethers v5-style exports.
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      ethers: require("path").resolve(__dirname, "src/lib/ethers-shim.ts"),
    };
    return config;
  },
};

export default nextConfig;
