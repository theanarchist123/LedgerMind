"use client"

import { useEffect, useState } from "react"
import { AlertOctagon, ShoppingBag, TrendingUp, Clock, DollarSign, Lightbulb, ThumbsDown, ThumbsUp, History, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * Regret Predictor Page
 * AI predicts which purchases you might regret based on patterns
 */
export default function RegretPredictorPage() {
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<any>(null)
  const [period, setPeriod] = useState<"week" | "month" | "year">("month")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRegretAnalysis()
  }, [period])

  const fetchRegretAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch(`/api/analytics/regret-predictor?period=${period}`)
      if (!res.ok) {
        throw new Error('Failed to fetch regret analysis')
      }
      
      const data = await res.json()
      setAnalysis(data)
    } catch (error) {
      console.error("Failed to fetch regret analysis:", error)
      setError("Unable to load regret analysis. Upload some receipts first!")
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }

  const getRegretColor = (score: number) => {
    if (score >= 70) return "text-red-500"
    if (score >= 40) return "text-orange-500"
    return "text-green-500"
  }

  const getRegretBadge = (score: number) => {
    if (score >= 70) return { label: "High Risk", variant: "destructive" as const }
    if (score >= 40) return { label: "Medium Risk", variant: "secondary" as const }
    return { label: "Low Risk", variant: "outline" as const }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regret Predictor</h1>
          <p className="text-muted-foreground">AI-powered purchase regret analysis</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <AlertOctagon className="h-8 w-8 text-orange-500" />
            Regret Predictor
          </h1>
          <p className="text-muted-foreground">
            AI warns you before purchases you might regret
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={fetchRegretAnalysis} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-orange-500">
          <CardContent className="pt-6">
            <p className="text-orange-500">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Hero Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Regret Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getRegretColor(analysis?.overallRegretRisk || 0)}`}>
              {analysis?.overallRegretRisk || 0}%
            </div>
            <Progress value={analysis?.overallRegretRisk || 0} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="border-2 border-red-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Potential Regrets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {analysis?.totalPotentialRegrets || 0}
            </div>
            <p className="text-sm text-muted-foreground">purchases flagged</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saved From Regret</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              {analysis?.savedFromRegret || 0}
            </div>
            <p className="text-sm text-muted-foreground">purchases avoided</p>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Regret Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₹{analysis?.averageRegretAmount?.toFixed(2) || 0}
            </div>
            <p className="text-sm text-muted-foreground">per purchase</p>
          </CardContent>
        </Card>
      </div>

      {/* High Risk Purchases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-orange-500" />
            High Risk Purchases
          </CardTitle>
          <CardDescription>Recent purchases with high regret probability</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis?.highRiskPurchases?.map((purchase: any) => {
            const badge = getRegretBadge(purchase.regretScore)
            return (
              <div
                key={purchase.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{purchase.item}</p>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{purchase.merchant}</p>
                  <p className="text-sm text-orange-500 mt-1">⚠️ {purchase.reason}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold">₹{purchase.amount.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{purchase.date}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-sm">Regret:</span>
                    <span className={`font-bold ${getRegretColor(purchase.regretScore)}`}>
                      {purchase.regretScore}%
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Patterns & Past Regrets */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Regret Patterns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Your Regret Patterns
            </CardTitle>
            <CardDescription>When you tend to regret purchases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis?.regretPatterns?.map((pattern: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{pattern.pattern}</span>
                  <span className={getRegretColor(pattern.percentage)}>{pattern.percentage}%</span>
                </div>
                <Progress value={pattern.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Past Regrets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-red-500" />
              Past Regrets
            </CardTitle>
            <CardDescription>Confirmed regretted purchases</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis?.pastRegrets?.map((regret: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    <p className="font-medium">{regret.item}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{regret.usageFrequency}</p>
                </div>
                <p className="font-bold text-red-500">₹{regret.amount.toFixed(2)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Avoid Future Regrets
          </CardTitle>
          <CardDescription>AI-powered tips based on your patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis?.tips?.map((tip: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span className="text-lg">{tip.split(" ")[0]}</span>
                <span className="text-sm">{tip.substring(tip.indexOf(" ") + 1)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-3">
            <Button className="flex-1">
              <ThumbsUp className="h-4 w-4 mr-2" />
              Enable Smart Alerts
            </Button>
            <Button variant="outline" className="flex-1">
              View Full History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
