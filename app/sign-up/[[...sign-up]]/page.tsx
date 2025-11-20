"use client"

import { SignUp } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "@/components/theme-provider"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function SignUpPage() {
  const { theme } = useTheme()
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    if (theme === "dark") {
      setIsDark(true)
    } else if (theme === "system") {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches)
    } else {
      setIsDark(false)
    }
  }, [theme])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-muted/30 gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-16 h-16">
          <Image 
            src="/logo.png" 
            alt="LedgerMind Logo" 
            width={64} 
            height={64}
            className="object-contain"
          />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Create an Account</h1>
        <p className="text-sm text-muted-foreground">Enter your information to get started with LedgerMind</p>
      </div>
      
      <SignUp 
        appearance={{
          baseTheme: isDark ? dark : undefined,
          elements: {
            rootBox: "w-full max-w-md",
            card: "shadow-none border-0 bg-transparent",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2",
            footerActionLink: "text-primary hover:underline",
            formFieldInput: "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            formFieldLabel: "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            identityPreviewText: "text-foreground",
            identityPreviewEditButton: "text-primary hover:underline",
          }
        }}
      />
    </div>
  )
}
