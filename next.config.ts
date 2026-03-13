import type { NextConfig } from "next";

const basePath = process.env.NODE_ENV === "production" ? "/sole" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },

  /* config options here */
};

export default nextConfig;
