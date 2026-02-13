"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Capacitor } from "@capacitor/core"
import { SMSManager } from "@/lib/sms/sms-manager"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Smartphone, X } from "lucide-react"

/**
 * Banner that prompts mobile users to grant SMS permissions
 * Only shows on mobile devices if permissions not granted
 */
export function SMSPermissionBanner() {
  const router = useRouter()
  const [showBanner, setShowBanner] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    // Only show on native mobile platforms
    if (!Capacitor.isNativePlatform()) {
      return
    }

    // Check if user dismissed the banner this session
    const dismissed = sessionStorage.getItem("sms-banner-dismissed")
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    try {
      const status = await SMSManager.checkPermission()
      if (!status.granted) {
        setShowBanner(true)
      }
    } catch (err) {
      console.error("Failed to check SMS permission:", err)
    }
  }

  const handleGrantPermissions = () => {
    router.push("/auth/permissions")
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setShowBanner(false)
    sessionStorage.setItem("sms-banner-dismissed", "true")
  }

  if (!showBanner || isDismissed) {
    return null
  }

  return (
    <Alert className="mb-6 border-orange-500/50 bg-orange-500/10">
      <Smartphone className="h-5 w-5 text-orange-600" />
      <AlertTitle className="flex items-center justify-between">
        <span>Connect Google Messages</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 -mr-2"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="text-sm mb-3">
          Enable automatic transaction tracking by connecting to your SMS messages. 
          We'll only read transaction alerts from banks and payment apps.
        </p>
        <Button onClick={handleGrantPermissions} size="sm" className="w-full sm:w-auto">
          Connect Now
        </Button>
      </AlertDescription>
    </Alert>
  )
}
