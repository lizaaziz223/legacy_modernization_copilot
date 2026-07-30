const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  // Temporary: lets the browser console show real file/line for production
  // errors instead of "Minified React error #N". Remove once the current
  // React error #31 investigation is resolved.
  productionBrowserSourceMaps: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  headers: async () => {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: 'http://localhost:8080',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:8080/api/:path*',
        },
      ],
    };
  },
};

export default nextConfig;
