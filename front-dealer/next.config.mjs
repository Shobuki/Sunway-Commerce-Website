const nextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: true,
      },
    ];
  },
  images: {
    domains: [], // List any external domains you use here
    loader: 'default', // This uses Next.js' built-in image optimization loader
    path: '/', // Base path for images. Adjust if your images are served from a different path
  },
};

export default nextConfig;
