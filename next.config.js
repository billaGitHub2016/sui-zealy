/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: "loose",
  },
  images: {
    // remotePatterns: [
    //   {
    //     protocol: 'https',
    //     hostname: 'rlscyjecgizuupwobasc.supabase.co',
    //     port: '',
    //     pathname: '/storage/v1/object/public/task_images/**',
    //     search: '',
    //   },
    // ],
    domains: ["rlscyjecgizuupwobasc.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "rlscyjecgizuupwobasc.supabase.co",
      },
    ],
  },
};

module.exports = nextConfig;
