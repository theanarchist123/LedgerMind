"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { SMSManager } from "@/lib/sms/sms-manager"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Smartphone, ShieldCheck, TrendingUp, CheckCircle2, XCircle } from "lucide-react"

/**
 * Permissions/Onboarding page after login
 * Requests SMS access to sync transaction history
 */
export default function PermissionsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncStatus, setSyncStatus] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    // Check if user already granted permission
    checkExistingPermission()
  }, [])

  const checkExistingPermission = async () => {
    if (!SMSManager.isNative()) {
      // Not on mobile, skip to dashboard
      router.push("/app/dashboard")
      return
    }

    const status = await SMSManager.checkPermission()
    if (status.granted) {
      setPermissionGranted(true)
      setCurrentStep(2)
    }
  }

  const handleRequestPermission = async () => {
    setIsProcessing(true)
    setError("")

    try {
      const granted = await SMSManager.requestPermission()

      if (granted) {
        setPermissionGranted(true)
        setCurrentStep(2)
      } else {
        setError("SMS permission is required to track transactions automatically")
      }
    } catch (err: any) {
      setError(err.message || "Failed to request permission")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSyncTransactions = async () => {
    setIsProcessing(true)
    setSyncStatus("Fetching SMS messages...")
    setSyncProgress(10)

    try {
      // Fetch SMS from last 6 months
      const transactions = await SMSManager.fetchTransactions({
        startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // 6 months
        limit: 1000,
      })

      setSyncProgress(40)
      setSyncStatus(`Found ${transactions.length} transactions. Syncing...`)

      // Send to backend for storage
      const response = await fetch("/api/transactions/sms/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: transactions.map((t) => ({
            body: t.rawMessage,
            date: new Date(t.date).getTime(),
          })),
        }),
      })

      setSyncProgress(80)

      if (!response.ok) {
        throw new Error("Failed to sync transactions")
      }

      const result = await response.json()

      setSyncProgress(100)
      setSyncStatus(
        `Synced! Imported ${result.results.imported} transactions (${result.results.duplicates} duplicates skipped)`
      )

      // Wait a moment to show success message
      setTimeout(() => {
        setCurrentStep(3)
      }, 2000)
    } catch (err: any) {
      console.error("Sync error:", err)
      setError(err.message || "Failed to sync transactions")
      setIsProcessing(false)
    }
  }

  const handleSkipSync = () => {
    router.push("/app/dashboard")
  }

  const handleContinueToDashboard = () => {
    router.push("/app/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-3 sm:p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="space-y-2 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-primary flex-shrink-0" />
            <CardTitle className="text-lg sm:text-xl break-words">Welcome to LedgerMind!</CardTitle>
          </div>
          <CardDescription className="text-sm break-words">
            Let's set up automatic transaction tracking from your SMS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-4 sm:mb-8">
            <div className={`flex flex-col items-center ${currentStep >= 1 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 text-xs sm:text-base ${currentStep >= 1 ? "border-primary bg-primary/10" : "border-muted"}`}>
                {currentStep > 1 ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : "1"}
              </div>
              <span className="text-[10px] sm:text-xs mt-1">Permission</span>
            </div>
            <div className={`flex-1 h-0.5 mx-1 sm:mx-2 ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`} />
            <div className={`flex flex-col items-center ${currentStep >= 2 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 text-xs sm:text-base ${currentStep >= 2 ? "border-primary bg-primary/10" : "border-muted"}`}>
                {currentStep > 2 ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : "2"}
              </div>
              <span className="text-[10px] sm:text-xs mt-1">Sync Data</span>
            </div>
            <div className={`flex-1 h-0.5 mx-1 sm:mx-2 ${currentStep >= 3 ? "bg-primary" : "bg-muted"}`} />
            <div className={`flex flex-col items-center ${currentStep >= 3 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 text-xs sm:text-base ${currentStep >= 3 ? "border-primary bg-primary/10" : "border-muted"}`}>
                {currentStep >= 3 ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : "3"}
              </div>
              <span className="text-[10px] sm:text-xs mt-1">Done</span>
            </div>
          </div>

          {/* Step 1: Request Permission */}
          {currentStep === 1 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <span className="break-words">Why we need SMS access?</span>
                </h3>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 text-primary flex-shrink-0" />
                    <span className="break-words">Automatically track UPI & banking transactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 text-primary flex-shrink-0" />
                    <span className="break-words">No manual entry needed - all transactions sync automatically</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 text-primary flex-shrink-0" />
                    <span className="break-words">We only read transaction messages, nothing else</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 text-primary flex-shrink-0" />
                    <span className="break-words">Your data is encrypted and never shared</span>
                  </li>
                </ul>
              </div>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 sm:p-4 flex items-start gap-2 text-xs sm:text-sm text-destructive">
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{error}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleRequestPermission}
                  disabled={isProcessing}
                  className="flex-1 w-full text-sm sm:text-base"
                  size="lg"
                >
                  {isProcessing ? "Requesting..." : "Grant SMS Access"}
                </Button>
                <Button
                  onClick={handleSkipSync}
                  variant="outline"
                  className="w-full sm:w-auto text-sm sm:text-base"
                  size="lg"
                >
                  Skip for Now
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Sync Historical Data */}
          {currentStep === 2 && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <span className="break-words">Import Your Transaction History</span>
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground break-words">
                  We'll scan your SMS for transactions from the last 6 months and import them automatically.
                  This gives you instant insights into your spending patterns!
                </p>
              </div>

              {isProcessing && (
                <div className="space-y-2">
                  <Progress value={syncProgress} className="h-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground text-center break-words px-2">
                    {syncStatus}
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 sm:p-4 flex items-start gap-2 text-xs sm:text-sm text-destructive">
                  <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="break-words">{error}</span>
                </div>
              )}

              {!isProcessing && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSyncTransactions}
                    className="flex-1 w-full text-sm sm:text-base"
                    size="lg"
                  >
                    Sync Transaction History
                  </Button>
                  <Button
                    onClick={handleSkipSync}
                    variant="outline"
                    className="w-full sm:w-auto text-sm sm:text-base"
                    size="lg"
                  >
                    Skip
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Success */}
          {currentStep === 3 && (
            <div className="space-y-4 text-center px-2">
              <div className="bg-green-500/10 border border-green-500/20 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-base sm:text-lg mb-2">All Set!</h3>
                <p className="text-xs sm:text-sm text-muted-foreground break-words">
                  Your transaction history has been synced. From now on, new transactions
                  will be automatically tracked as you receive SMS notifications.
                </p>
              </div>
              <Button
                onClick={handleContinueToDashboard}
                className="w-full text-sm sm:text-base"
                size="lg"
              >
                Continue to Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
