import type { NextConfig } from "next";

import path from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "places.googleapis.com",
      },
    ],
  },
  // Lets the dev server (and its HMR websocket) be reached from another
  // device on the LAN, e.g. testing on a phone via the machine's local IP.
  allowedDevOrigins: ["10.10.88.33"],
};

export default nextConfig;
