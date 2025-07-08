/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://sunflexstoreindonesia.com:3000/api/:path*", // Ubah ke IP lokal kamu
      },
    ];
  },
};

module.exports = nextConfig;
