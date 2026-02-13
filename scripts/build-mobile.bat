@echo off
REM Build script for Capacitor mobile app (Windows)
REM This temporarily modifies next.config.js for static export

echo 🏗️  Building LedgerMind for mobile (Capacitor)...
echo.

REM Backup original config
copy next.config.js next.config.js.backup >nul

REM Create mobile-specific config
(
echo /** @type {import('next'^).NextConfig} */
echo const nextConfig = {
echo   reactStrictMode: true,
echo   
echo   // CAPACITOR: Static export required for mobile
echo   output: 'export',
echo   
echo   // Disable image optimization for static export
echo   images: {
echo     unoptimized: true,
echo   },
echo   
echo   // Trailing slash for compatibility
echo   trailingSlash: true,
echo   
echo   // Environment variables
echo   env: {
echo     NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ^|^| 'https://yourapi.vercel.app',
echo   },
echo }
echo.
echo module.exports = nextConfig
) > next.config.mobile.js

REM Build with mobile config
echo 📦 Building Next.js static export...
ren next.config.js next.config.js.vercel
ren next.config.mobile.js next.config.js

call npm run build

REM Restore Vercel config
ren next.config.js next.config.mobile.js
ren next.config.js.vercel next.config.js

REM Sync with Capacitor
echo.
echo 🔄 Syncing with Capacitor...
call npx cap sync

REM Cleanup
del next.config.js.backup 2>nul

echo.
echo ✅ Mobile build complete!
echo.
echo Next steps:
echo   npm run android    # Open Android Studio
echo   npm run ios        # Open Xcode
echo.
pause
