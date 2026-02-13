/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image optimization
  images: {
    unoptimized: true,
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
