/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    // We run ESLint in CI so we don't need to run it during production builds.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // We run TypeScript checks in CI so we don't need to run it during production builds.
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.arctracker.io',
      },
    ],
  },
};

export default config;
