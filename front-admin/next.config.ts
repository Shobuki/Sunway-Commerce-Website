/** @type {import('next').NextConfig} */
const nextConfig = {
 // basePath: "/admin",
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        //destination: "http://localhost:3000/api/:path*", 
        destination: "http://sunflexstoreindonesia.com:3000/api/:path*", 
      },
    ];
  },
};

module.exports = nextConfig;
