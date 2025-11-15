"use client"

import { useEffect, useState } from "react"
import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface AIInsight {
  type: "success" | "warning" | "info"
  message: string
  category?: string
  count?: number
}

export function AIInsightsCard({ userId }: { userId: string }) {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInsights()
  }, [userId])

  async function fetchInsights() {
    try {
      // This would call a real API endpoint
      // For now, generate mock insights based on analytics
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))

      const mockInsights: AIInsight[] = [
        {
          type: "success",
          message: "AI is learning your spending patterns! Categories are 92% accurate.",
        },
        {
          type: "info",
          message: "You spent 18% more on Food & Beverage this month compared to last month.",
          category: "Food & Beverage",
        },
        {
          type: "warning",
          message: "3 receipts need review due to low OCR confidence.",
          count: 3,
        },
      ]

      setInsights(mockInsights)
    } catch (error) {
      console.error("Failed to fetch insights:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-green-500" />
            AI Insights
          </CardTitle>
          <CardDescription>Smart analysis of your receipts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
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
        <CardDescription>Smart analysis of your receipts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg bg-card border border-border/50"
          >
            <div className="mt-0.5">
              {insight.type === "success" && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {insight.type === "warning" && (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              {insight.type === "info" && (
                <TrendingUp className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-sm leading-relaxed">{insight.message}</p>
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
