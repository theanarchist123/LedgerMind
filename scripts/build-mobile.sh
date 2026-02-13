#!/bin/bash

# Build script for Capacitor mobile app
# This temporarily modifies next.config.js for static export

echo "🏗️  Building LedgerMind for mobile (Capacitor)..."

# Backup original config
cp next.config.js next.config.js.backup

# Create mobile-specific config
cat > next.config.mobile.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // CAPACITOR: Static export required for mobile
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Trailing slash for compatibility
  trailingSlash: true,
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://yourapi.vercel.app',
  },
}

module.exports = nextConfig
EOF

# Build with mobile config
echo "📦 Building Next.js static export..."
mv next.config.js next.config.js.vercel
mv next.config.mobile.js next.config.js

npm run build

# Restore Vercel config
mv next.config.js next.config.mobile.js
mv next.config.js.vercel next.config.js

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync

# Restore backup
rm next.config.js.backup 2>/dev/null || true

echo "✅ Mobile build complete!"
echo ""
echo "Next steps:"
echo "  npm run android    # Open Android Studio"
echo "  npm run ios        # Open Xcode"
