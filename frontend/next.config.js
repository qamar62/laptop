/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable output standalone for Docker deployment
  output: 'standalone',
  
  images: {
    domains: [
      'images.unsplash.com',
      'localhost',
      '127.0.0.1',
      'placehold.co',
      'placekitten.com',
      'picsum.photos',
      'loremflickr.com',
      'via.placeholder.com',
      'dummyimage.com',
      'source.unsplash.com',
      'laptop.qamdm.xyz',
      'backend.laptop.qamdm.xyz'
    ],
    // Use remote patterns for more secure image configuration
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'laptop.qamdm.xyz',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'backend.laptop.qamdm.xyz',
        pathname: '/media/**',
      },
    ],
  },
  
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
};

module.exports = nextConfig;
