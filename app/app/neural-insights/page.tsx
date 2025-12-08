"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle, 
  Sparkles, 
  Target,
  Lightbulb,
  RefreshCw,
  DollarSign,
  PiggyBank,
  Activity,
  Zap,
  Shield,
  ArrowRight,
  ChevronUp,
  ChevronDown
} from "lucide-react"

interface NeuralPrediction {
  predictedAmount: number
  predictedCategory: string
  confidence: number
  trend: "increasing" | "decreasing" | "stable"
  nextWeekEstimate: number
  insights: string[]
  riskLevel: "low" | "medium" | "high"
  savingsOpportunity: number
}

interface PredictionResponse {
  success: boolean
  prediction: NeuralPrediction
  model: {
    trained: boolean
    dataPoints: number
    accuracy: string
  }
  error?: string
}

export default function NeuralInsightsPage() {
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchPrediction = async () => {
    try {
      const response = await fetch("/api/neural/predict")
      const data = await response.json()
      setPrediction(data)
    } catch (error) {
      console.error("Failed to fetch prediction:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPrediction()
  }, [])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchPrediction()
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-5 w-5 text-red-500" />
      case "decreasing":
        return <TrendingDown className="h-5 w-5 text-green-500" />
      default:
        return <Minus className="h-5 w-5 text-yellow-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "increasing":
        return "text-red-500 bg-red-500/10 border-red-500/30"
      case "decreasing":
        return "text-green-500 bg-green-500/10 border-green-500/30"
      default:
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30"
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high":
        return "text-red-500 bg-red-500/10 border-red-500/30"
      case "medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30"
      default:
        return "text-green-500 bg-green-500/10 border-green-500/30"
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "high":
        return <AlertTriangle className="h-5 w-5" />
      case "medium":
        return <Activity className="h-5 w-5" />
      default:
        return <Shield className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    )
  }

  if (!prediction?.success) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <Brain className="h-16 w-16 text-muted-foreground" />
            <h2 className="text-2xl font-bold">Neural Network Needs Data</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Upload some receipts first so our AI can learn your spending patterns and provide personalized predictions.
            </p>
            <Button asChild className="mt-4">
              <a href="/app/upload">
                Upload Receipts
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { prediction: pred, model } = prediction

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Neural Insights</h1>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              AI Powered
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Custom neural network predictions based on your spending patterns
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          className="gap-2"
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh Predictions
        </Button>
      </div>

      {/* Model Info Banner */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Zap className="h-5 w-5 text-purple-500" />
              <span className="text-sm">
                Neural network trained on <strong>{model.dataPoints}</strong> data points
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">Model Active</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Predicted Amount */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Next Purchase Prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">
              ${pred.predictedAmount.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {pred.predictedCategory}
            </p>
          </CardContent>
        </Card>

        {/* Confidence Score */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Prediction Confidence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">
              {(pred.confidence * 100).toFixed(0)}%
            </div>
            <Progress value={pred.confidence * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Weekly Estimate */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Next Week Estimate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-500">
              ${pred.nextWeekEstimate.toFixed(2)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              {getTrendIcon(pred.trend)}
              <span className="text-sm text-muted-foreground capitalize">{pred.trend}</span>
            </div>
          </CardContent>
        </Card>

        {/* Savings Opportunity */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full" />
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Savings Opportunity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-500">
              ${pred.savingsOpportunity.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Potential monthly savings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend & Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Spending Analysis
            </CardTitle>
            <CardDescription>
              Neural network analysis of your spending behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Trend Indicator */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Spending Trend</span>
                <Badge className={getTrendColor(pred.trend)}>
                  {getTrendIcon(pred.trend)}
                  <span className="ml-1 capitalize">{pred.trend}</span>
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center gap-2">
                  {pred.trend === "increasing" ? (
                    <ChevronUp className="h-8 w-8 text-red-500" />
                  ) : pred.trend === "decreasing" ? (
                    <ChevronDown className="h-8 w-8 text-green-500" />
                  ) : (
                    <Minus className="h-8 w-8 text-yellow-500" />
                  )}
                  <div>
                    <p className="font-medium">
                      {pred.trend === "increasing" 
                        ? "Your spending is trending upward"
                        : pred.trend === "decreasing"
                        ? "Great job! Spending is decreasing"
                        : "Your spending is stable"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Based on pattern analysis of recent transactions
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Financial Risk Level</span>
                <Badge className={getRiskColor(pred.riskLevel)}>
                  {getRiskIcon(pred.riskLevel)}
                  <span className="ml-1 capitalize">{pred.riskLevel}</span>
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                </div>
                <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 relative">
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-800 shadow-lg transition-all duration-500"
                    style={{
                      left: pred.riskLevel === "low" ? "10%" : pred.riskLevel === "medium" ? "50%" : "90%",
                      transform: "translate(-50%, -50%)"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Predicted Category */}
            <div className="space-y-3">
              <span className="text-sm font-medium">Most Likely Next Category</span>
              <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{pred.predictedCategory}</span>
                  <Badge variant="secondary">
                    {(pred.confidence * 100).toFixed(0)}% confident
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              AI-Generated Insights
            </CardTitle>
            <CardDescription>
              Personalized recommendations from our neural network
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pred.insights.map((insight, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="p-2 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{insight}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Suggestions */}
            <div className="mt-6 p-4 rounded-lg border-2 border-dashed border-green-500/30 bg-green-500/5">
              <h4 className="font-semibold flex items-center gap-2 text-green-600 dark:text-green-400">
                <Target className="h-4 w-4" />
                Recommended Action
              </h4>
              <p className="text-sm text-muted-foreground mt-2">
                {pred.riskLevel === "high" 
                  ? "Consider reviewing your recent expenses and setting a stricter budget for non-essential categories."
                  : pred.riskLevel === "medium"
                  ? "You're doing okay, but there's room for improvement. Try to reduce spending in your top category."
                  : "Excellent financial discipline! Keep up the good work and consider investing your savings."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* How It Works Section */}
      <Card className="bg-gradient-to-br from-muted/50 to-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            How Our Neural Network Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Data Collection",
                description: "We analyze your receipts and extract spending patterns"
              },
              {
                step: "2",
                title: "Feature Engineering",
                description: "7 key features including time, category, and trends are computed"
              },
              {
                step: "3",
                title: "Neural Processing",
                description: "Multi-layer network with 16→8 hidden neurons processes data"
              },
              {
                step: "4",
                title: "Prediction",
                description: "AI generates predictions with confidence scores"
              }
            ].map((item, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold flex items-center justify-center mx-auto">
                  {item.step}
                </div>
                <h4 className="font-semibold">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
