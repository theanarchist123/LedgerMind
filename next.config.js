/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignore TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Optimize for serverless deployment
  output: 'standalone',
  // Ignore optional MongoDB dependencies
  webpack: (config, { isServer }) => {
    if (isServer) {
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
