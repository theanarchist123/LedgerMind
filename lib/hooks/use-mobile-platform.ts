
import { Capacitor } from "@capacitor/core"
import { useEffect, useState } from "react"

/**
 * Hook to check if the app is running on a mobile platform.
 * Robustly checks both Capacitor.isNativePlatform() and User Agent.
 * This ensures it works in "Live Reload" mode where the app is served from a web server.
 */
export function useMobilePlatform() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkPlatform = () => {
            // 1. Official Capacitor check
            if (Capacitor.isNativePlatform()) {
                return true
            }

            // 2. Fallback: Check User Agent for "Capacitor" or "Android" if we are in a web view
            // When running in Capacitor's Live Reload, the UA usually contains "Capacitor"
            // or we can infer it from the context if needed.
            if (typeof window !== "undefined") {
                const ua = window.navigator.userAgent
                // Capacitor Web View on Android adds "Capacitor" or "wv" (for WebView)
                if (ua.includes("Capacitor") || (ua.includes("Android") && ua.includes("wv"))) {
                    return true;
                }
            }

            return false
        }

        setIsMobile(checkPlatform())
    }, [])

    return isMobile
}

/**
 * Helper function for non-hook usage (e.g. inside classes or simple functions)
 */
export function isMobilePlatform(): boolean {
    if (Capacitor.isNativePlatform()) {
        return true
    }

    if (typeof window !== "undefined") {
        const ua = window.navigator.userAgent
        if (ua.includes("Capacitor") || (ua.includes("Android") && ua.includes("wv"))) {
            return true;
        }
    }
    return false
}
