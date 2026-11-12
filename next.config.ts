import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Placeholder headshots for the (fictional) leadership team.
      { protocol: "https", hostname: "randomuser.me" },
      // Verified free-license photo used for hero/section atmosphere.
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default nextConfig;
