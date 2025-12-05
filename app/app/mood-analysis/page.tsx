"use client"

import { useEffect, useState } from "react"
import { Brain, Moon, Clock, Calendar, AlertTriangle, TrendingUp, Lightbulb, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * Receipt Mood Analysis Page
 * AI-powered emotional spending pattern detection
 */
export default function MoodAnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<any>(null)
  const [period, setPeriod] = useState<"week" | "month" | "year">("month")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMoodAnalysis()
  }, [period])

  const fetchMoodAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch(`/api/analytics/mood-analysis?period=${period}`)
      
      if (!res.ok) {
        throw new Error("Failed to fetch mood analysis")
      }
      
      const data = await res.json()
      setAnalysis(data)
    } catch (error) {
      console.error("Failed to fetch mood analysis:", error)
      setError("Unable to load mood analysis. Make sure you have uploaded some receipts.")
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Moon, Clock, Calendar, AlertTriangle, TrendingUp, Brain, Lightbulb
    }
    return icons[iconName] || Brain
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spending Mood Analysis</h1>
          <p className="text-muted-foreground">AI-powered emotional spending patterns</p>
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
            <Brain className="h-8 w-8 text-purple-500" />
            Spending Mood Analysis
          </h1>
          <p className="text-muted-foreground">
            AI detects your emotional spending patterns
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
          <Button variant="outline" size="icon" onClick={fetchMoodAnalysis} disabled={loading}>
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

      {/* Overall Mood Card */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className={analysis?.overallMood?.color || "text-gray-500"} />
            Your Spending Personality
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-2xl font-bold capitalize">
                {analysis?.overallMood?.type || "Analyzing..."}
              </span>
              <Badge variant="outline" className="text-lg">
                {analysis?.overallMood?.score || 0}/100
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {analysis?.overallMood?.description || "Loading analysis..."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scores Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Stress Spending */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Stress Spending
            </CardTitle>
            <CardDescription>Late night & frequent small purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-2xl font-bold">{analysis?.stressSpendingScore || 0}%</span>
                <Badge variant={analysis?.stressSpendingScore > 50 ? "destructive" : "secondary"}>
                  {analysis?.stressSpendingScore > 50 ? "High" : "Normal"}
                </Badge>
              </div>
              <Progress value={analysis?.stressSpendingScore || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Impulse Spending */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Impulse Spending
            </CardTitle>
            <CardDescription>Quick purchases & large buys</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-2xl font-bold">{analysis?.impulseSpendingScore || 0}%</span>
                <Badge variant={analysis?.impulseSpendingScore > 50 ? "destructive" : "secondary"}>
                  {analysis?.impulseSpendingScore > 50 ? "High" : "Moderate"}
                </Badge>
              </div>
              <Progress value={analysis?.impulseSpendingScore || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Late Night Spending */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5 text-indigo-500" />
              Late Night Activity
            </CardTitle>
            <CardDescription>10 PM - 2 AM purchases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold">{analysis?.lateNightSpending?.count || 0}</span>
                <span className="text-sm text-muted-foreground">
                  ${(analysis?.lateNightSpending?.total || 0).toFixed(2)}
                </span>
              </div>
              <Progress value={analysis?.lateNightSpending?.percentage || 0} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {(analysis?.lateNightSpending?.percentage || 0).toFixed(0)}% of all spending
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weekend Spending */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-500" />
              Weekend Spending
            </CardTitle>
            <CardDescription>Saturday & Sunday activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <span className="text-2xl font-bold">{analysis?.weekendSpending?.count || 0}</span>
                <span className="text-sm text-muted-foreground">
                  ${(analysis?.weekendSpending?.total || 0).toFixed(2)}
                </span>
              </div>
              <Progress value={analysis?.weekendSpending?.percentage || 0} className="h-2" />
              <p className="text-sm text-muted-foreground">
                {(analysis?.weekendSpending?.percentage || 0).toFixed(0)}% of all spending
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis?.insights?.map((insight: any, idx: number) => {
            const IconComponent = getIconComponent(insight.icon)
            return (
              <div
                key={idx}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === "warning"
                    ? "bg-orange-50 dark:bg-orange-950/20 border-orange-500"
                    : insight.type === "success"
                    ? "bg-green-50 dark:bg-green-950/20 border-green-500"
                    : "bg-blue-50 dark:bg-blue-950/20 border-blue-500"
                }`}
              >
                <div className="flex items-start gap-3">
                  <IconComponent className="h-5 w-5 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                    {insight.recommendation && (
                      <p className="text-sm font-medium mt-2 text-primary">
                        💡 {insight.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
