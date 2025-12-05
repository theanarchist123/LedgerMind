"use client"

import { useEffect, useState } from "react"
import { Dna, Sparkles, Target, TrendingUp, Users, Share2, Download, Zap, Heart, ShoppingBag, Coffee, Plane, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * Spending DNA Page
 * Financial personality profiler - your unique spending fingerprint
 */
export default function SpendingDNAPage() {
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<any>(null)
  const [period, setPeriod] = useState<"week" | "month" | "year">("month")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDNAAnalysis()
  }, [period])

  const fetchDNAAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const res = await fetch(`/api/analytics/spending-dna?period=${period}`)
      if (!res.ok) {
        throw new Error('Failed to fetch DNA analysis')
      }
      
      const data = await res.json()
      setAnalysis(data)
    } catch (error) {
      console.error("Failed to fetch DNA analysis:", error)
      setError("Unable to load spending DNA. Upload some receipts first!")
      setAnalysis(null)
    } finally {
      setLoading(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      Target, TrendingUp, Plane, Zap, Sparkles, Heart, Coffee, ShoppingBag, Users
    }
    return icons[iconName] || Sparkles
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Spending DNA</h1>
          <p className="text-muted-foreground">Your unique financial fingerprint</p>
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
            <Dna className="h-8 w-8 text-purple-500" />
            Spending DNA
          </h1>
          <p className="text-muted-foreground">
            Your unique financial personality profile
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
          <Button variant="outline" size="icon" onClick={fetchDNAAnalysis} disabled={loading}>
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

      {/* Personality Hero Card */}
      <Card className={`border-2 overflow-hidden bg-gradient-to-r ${analysis?.personalityType?.color || 'from-gray-500 to-gray-600'}`}>
        <CardContent className="p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-6xl mb-4">{analysis?.personalityType?.emoji}</p>
              <h2 className="text-3xl font-bold mb-2">{analysis?.personalityType?.name}</h2>
              <p className="text-xl opacity-90">{analysis?.personalityType?.tagline}</p>
            </div>
            <div className="hidden md:block">
              <Dna className="h-32 w-32 opacity-20" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DNA Strands */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dna className="h-5 w-5 text-purple-500" />
            Your DNA Strands
          </CardTitle>
          <CardDescription>The 6 traits that define your spending personality</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {analysis?.dnaStrands?.map((strand: any, idx: number) => {
            const IconComponent = getIconComponent(strand.icon)
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 ${strand.color}`} />
                    <span className="font-medium">{strand.trait}</span>
                  </div>
                  <Badge variant="outline" className="text-lg">
                    {strand.score}%
                  </Badge>
                </div>
                <Progress value={strand.score} className="h-3" />
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Top Categories & Habits */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Spending Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-500" />
              Where Your Money Goes
            </CardTitle>
            <CardDescription>Your top spending categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysis?.topCategories?.map((cat: any, idx: number) => {
              const IconComponent = getIconComponent(cat.icon)
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{cat.category}</span>
                  </div>
                  <Badge>{cat.percentage}%</Badge>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Financial Habits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Financial Habits
            </CardTitle>
            <CardDescription>Your spending behaviors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysis?.financialHabits?.map((habit: any, idx: number) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  habit.positive
                    ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                    : "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                }`}
              >
                <span className="font-medium">{habit.habit}</span>
                <Badge variant={habit.positive ? "default" : "secondary"}>
                  {habit.positive ? "✓ Good" : "⚠ Watch"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Compatible Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-pink-500" />
            Financial Compatibility
          </CardTitle>
          <CardDescription>How well you match with other spending types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {analysis?.compatibleTypes?.map((type: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-lg border text-center"
              >
                <p className="font-semibold mb-2">{type.type}</p>
                <div className="flex items-center justify-center gap-2">
                  <Progress value={type.compatibility} className="h-2 w-20" />
                  <span className="text-sm font-medium">{type.compatibility}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Unique Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-500" />
            Unique Insights About You
          </CardTitle>
          <CardDescription>What makes your spending unique</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {analysis?.uniqueInsights?.map((insight: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <span className="text-xl">💡</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Share Card */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-green-500" />
            Share Your Spending DNA
          </CardTitle>
          <CardDescription>Create a shareable card of your financial personality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-white max-w-sm mx-auto">
            <p className="text-sm opacity-75 mb-2">My Spending DNA</p>
            <h3 className="text-2xl font-bold mb-1">🌟 {analysis?.shareCard?.type}</h3>
            <p className="opacity-90 mb-4">{analysis?.shareCard?.tagline}</p>
            <div className="flex gap-2">
              {analysis?.shareCard?.topTraits?.map((trait: string, idx: number) => (
                <Badge key={idx} variant="secondary" className="bg-white/20 text-white">
                  {trait}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-center">
            <Button>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
