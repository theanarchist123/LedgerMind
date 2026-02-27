/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image optimization — allow Unsplash remote images
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
    ],
  },

  // Trailing slash for compatibility
  trailingSlash: true,

  // For Capacitor mobile app:
  // 1. Deploy this app to Vercel (API routes work there)
  // 2. Mobile app connects to hosted backend via NEXT_PUBLIC_APP_URL
  //
  // If you need static export for mobile, run: npm run build:mobile
  // which uses next.config.mobile.js
}

module.exports = nextConfig
