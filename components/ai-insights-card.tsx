"use client"

import { useEffect, useState } from "react"
import { Sparkles, CheckCircle, AlertCircle, TrendingUp, PieChart, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface SpendingInsight {
  type: "success" | "warning" | "info"
  icon: string
  title: string
  description: string
  category?: string
  amount?: number
}

interface AIInsightsCardProps {
  userId: string
}

export function AIInsightsCard({ userId }: AIInsightsCardProps) {
  const [insights, setInsights] = useState<SpendingInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInsights() {
      try {
        setLoading(true)
        const response = await fetch(`/api/analytics/insights?userId=${userId}&period=month`)
        if (response.ok) {
          const data = await response.json()
          setInsights(data.insights || [])
        }
      } catch (error) {
        console.error("Failed to fetch insights:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [userId])

  const getIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      CheckCircle,
      AlertCircle,
      TrendingUp,
      TrendingDown,
      PieChart,
      Sparkles,
    }
    const Icon = icons[iconName] || Sparkles
    return <Icon className="h-4 w-4" />
  }

  const getVariantClass = (type: string) => {
    if (type === "success") return "text-green-500"
    if (type === "warning") return "text-yellow-500"
    return "text-blue-500"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (insights.length === 0) {
    return (
      <Card className="border-green-500/20 bg-gradient-to-br from-green-950/30 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-500" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Upload more receipts to see AI-powered insights about your spending patterns.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-500/20 bg-gradient-to-br from-green-950/30 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-green-500" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border/50"
          >
            <div className={`mt-0.5 ${getVariantClass(insight.type)}`}>
              {getIcon(insight.icon)}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium">{insight.title}</p>
              <p className="text-xs text-muted-foreground">{insight.description}</p>
              {insight.category && (
                <Badge variant="secondary" className="text-xs">
                  {insight.category}
                </Badge>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
