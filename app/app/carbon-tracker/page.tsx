"use client"

import { useEffect, useState } from "react"
import { Leaf, TreePine, AlertTriangle, PieChart, TrendingDown, Lightbulb, Recycle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * Carbon Footprint Tracker Page
 * Environmental impact analysis of purchases
 */
export default function CarbonFootprintPage() {
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<any>(null)
  const [period, setPeriod] = useState<"week" | "month" | "year">("month")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCarbonAnalysis()
  }, [period])

  const fetchCarbonAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch(`/api/analytics/carbon-footprint?period=${period}`)
      if (!res.ok) {
        throw new Error('Failed to fetch carbon analysis')
      }
      
      const data = await res.json()
      setAnalysis(data)
    } catch (error) {
      console.error("Failed to fetch carbon analysis:", error)
      setError("Unable to load carbon analysis. Upload some receipts first!")
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Carbon Footprint Tracker</h1>
          <p className="text-muted-foreground">Environmental impact of your spending</p>
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

  const getEcoScoreColor = (score: number) => {
    if (score >= 75) return "text-green-500"
    if (score >= 50) return "text-yellow-500"
    return "text-orange-500"
  }

  const getEcoScoreLabel = (score: number) => {
    if (score >= 75) return "Excellent"
    if (score >= 50) return "Good"
    return "Needs Improvement"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-500" />
            Carbon Footprint Tracker
          </h1>
          <p className="text-muted-foreground">
            Measure the environmental impact of your purchases
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
          <Button variant="outline" size="icon" onClick={fetchCarbonAnalysis} disabled={loading}>
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
      <div className="grid gap-6 md:grid-cols-3">
        {/* Total CO2 */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Total CO2 Emissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{analysis?.totalCO2kg || 0} kg</div>
            <p className="text-sm text-muted-foreground mt-2">This month</p>
          </CardContent>
        </Card>

        {/* Trees Equivalent */}
        <Card className="border-2 border-green-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TreePine className="h-5 w-5 text-green-500" />
              Trees to Offset
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">
              {analysis?.treesEquivalent || 0}
            </div>
            <p className="text-sm text-muted-foreground mt-2">Trees needed</p>
          </CardContent>
        </Card>

        {/* Eco Score */}
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-lg">Eco Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className={`text-4xl font-bold ${getEcoScoreColor(analysis?.ecoScore || 0)}`}>
                  {analysis?.ecoScore || 0}
                </span>
                <Badge variant="outline">{getEcoScoreLabel(analysis?.ecoScore || 0)}</Badge>
              </div>
              <Progress value={analysis?.ecoScore || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-blue-500" />
            CO2 by Category
          </CardTitle>
          <CardDescription>Where your emissions come from</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis?.categoryBreakdown?.map((cat: any, idx: number) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{cat.category}</span>
                <span className="text-muted-foreground">
                  {cat.co2kg.toFixed(1)} kg ({cat.percentage}%)
                </span>
              </div>
              <Progress value={cat.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Polluters & Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Polluters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Top Polluters
            </CardTitle>
            <CardDescription>Merchants with highest CO2</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis?.topPolluters?.map((polluter: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex-1">
                  <p className="font-medium">{polluter.merchant}</p>
                  <p className="text-sm text-muted-foreground">{polluter.category}</p>
                </div>
                <Badge variant="destructive">{polluter.co2kg.toFixed(1)} kg</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Eco Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis?.insights?.map((insight: any, idx: number) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border-l-4 ${
                  insight.type === "warning"
                    ? "bg-orange-50 dark:bg-orange-950/20 border-orange-500"
                    : "bg-blue-50 dark:bg-blue-950/20 border-blue-500"
                }`}
              >
                <h4 className="font-semibold text-sm">{insight.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Recycle className="h-5 w-5 text-green-500" />
            Sustainability Recommendations
          </CardTitle>
          <CardDescription>Actions to reduce your carbon footprint</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis?.recommendations?.map((rec: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span className="text-lg">{rec.split(" ")[0]}</span>
                <span className="text-sm">{rec.substring(rec.indexOf(" ") + 1)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex gap-3">
            <Button className="flex-1">
              <TreePine className="h-4 w-4 mr-2" />
              Offset Carbon
            </Button>
            <Button variant="outline" className="flex-1">
              View Eco Alternatives
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
