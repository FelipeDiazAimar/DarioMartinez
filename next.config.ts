import type {NextConfig} from 'next';

const backendApiUrl = process.env.BACKEND_API_URL?.replace(/\/$/, '');

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ddbkaljmgahhidrrffui.supabase.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    if (!backendApiUrl) {
      return [];
    }

    return [
      {
        source: '/api/mysql/:path*',
        destination: `${backendApiUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
