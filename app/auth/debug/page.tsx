"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AuthDebugPage() {
  const { data: session, isPending, error } = useSession()
  const [cookies, setCookies] = useState<string>("")

  useEffect(() => {
    // Get all cookies
    setCookies(document.cookie)
  }, [])

  const checkApiSession = async () => {
    try {
      const res = await fetch("/api/auth/get-session", {
        credentials: "include",
      })
      const data = await res.json()
      console.log("API Session Response:", data)
      alert(JSON.stringify(data, null, 2))
    } catch (err) {
      console.error("API Session Error:", err)
      alert("Error: " + err)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-muted/30">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Auth Debug Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-bold">Session Status:</h3>
            <p>isPending: {String(isPending)}</p>
            <p>hasSession: {String(!!session)}</p>
            {error && <p className="text-red-500">Error: {JSON.stringify(error)}</p>}
          </div>

          <div>
            <h3 className="font-bold">Session Data:</h3>
            <pre className="bg-muted p-4 rounded text-xs overflow-auto">
              {JSON.stringify(session, null, 2) || "null"}
            </pre>
          </div>

          <div>
            <h3 className="font-bold">Cookies (document.cookie):</h3>
            <pre className="bg-muted p-4 rounded text-xs overflow-auto whitespace-pre-wrap">
              {cookies || "(no cookies found)"}
            </pre>
          </div>

          <div>
            <h3 className="font-bold">Cookie List:</h3>
            <ul className="bg-muted p-4 rounded text-xs">
              {cookies.split(";").map((c, i) => (
                <li key={i} className="py-1">{c.trim() || "(empty)"}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4">
            <Button onClick={checkApiSession}>
              Check API Session
            </Button>
            <Button variant="outline" onClick={() => window.location.href = "/app/dashboard"}>
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
