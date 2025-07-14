/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: "/admin",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:3000/api/:path*", // Ubah ke IP lokal kamu
      },
    ];
  },
};

module.exports = nextConfig;
