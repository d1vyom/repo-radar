/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // GitHub user / organization avatars served from avatars.githubusercontent.com
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        // User-uploaded profile photos (camo proxy)
        protocol: 'https',
        hostname: 'avatars3.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
