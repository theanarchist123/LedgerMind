"use client"

import { ThemeProvider } from "@/components/theme-provider"

/**
 * Client-side providers wrapper for root layout
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="ledgermind-theme">
      {children}
    </ThemeProvider>
  )
}
