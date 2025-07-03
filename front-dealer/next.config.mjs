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
    domains: ['localhost'], // Tambahkan localhost sebagai domain gambar
    loader: 'default',
    path: '/',
    unoptimized: true,
  },
};

export default nextConfig;
