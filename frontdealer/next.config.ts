import type { NextConfig } from "next";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*", 
         //destination: "http://sunflexstoreindonesia.com:3000/api/:path*", // Ubah ke IP lokal kamu
      },
    ];
  },
};

export default nextConfig;
