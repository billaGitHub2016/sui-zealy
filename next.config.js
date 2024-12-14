/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose",
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'rlscyjecgizuupwobasc.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/task_images/**',
        search: '',
      },
    ],
  },
};

module.exports = nextConfig;
