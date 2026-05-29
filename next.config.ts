import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.ALLOWED_DEV_ORIGIN
    ? { allowedDevOrigins: [process.env.ALLOWED_DEV_ORIGIN] }
    : {}),
};

export default nextConfig;
