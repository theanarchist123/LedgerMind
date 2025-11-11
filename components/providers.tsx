"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"

/**
 * Client-side providers wrapper for root layout
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ledgermind-theme">
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}
