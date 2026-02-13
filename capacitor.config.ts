import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.ledgermind.app',
  appName: 'LedgerMind',
  webDir: '.next', // Not used when server.url is set
  server: {
    // Point to your hosted Next.js app (API routes work there)
    url: process.env.CAPACITOR_SERVER_URL || 'https://ledger-mind-30.vercel.app',
    androidScheme: 'https',
    cleartext: true // Allow HTTP for local development
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
}

export default config
