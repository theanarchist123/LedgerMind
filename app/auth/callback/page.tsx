"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"

/**
 * OAuth callback handler
 * This page is shown after OAuth provider redirects back
 * It checks for session and redirects to dashboard
 */
export default function CallbackPage() {
  const router = useRouter()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    // Wait for session to load
    if (isPending) return

    if (session) {
      // Session exists, redirect to dashboard
      router.push("/app/dashboard")
    } else {
      // No session after OAuth callback, redirect back to login with error
      router.push("/auth/login?error=oauth_failed")
    }
  }, [session, isPending, router])

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}
