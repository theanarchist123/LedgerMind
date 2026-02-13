/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Production optimizations
  poweredByHeader: false,
  compress: true,
  
  // TypeScript & ESLint (strict in development, flexible in production)
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
  
  // Optimize for Vercel deployment
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['localhost'],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ],
      },
    ];
  },
  
  // Webpack configuration for MongoDB and serverless
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize optional MongoDB dependencies
      config.externals.push({
        'kerberos': 'commonjs kerberos',
        '@mongodb-js/zstd': 'commonjs @mongodb-js/zstd',
        '@aws-sdk/credential-providers': 'commonjs @aws-sdk/credential-providers',
        'gcp-metadata': 'commonjs gcp-metadata',
        'snappy': 'commonjs snappy',
        'socks': 'commonjs socks',
        'aws4': 'commonjs aws4',
        'mongodb-client-encryption': 'commonjs mongodb-client-encryption',
      });
    }
    
    return config;
  },
}

module.exports = nextConfig
