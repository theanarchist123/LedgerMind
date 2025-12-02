"use client"

import { useEffect, useState } from "react"
import { Brain, Moon, Clock, Calendar, AlertTriangle, TrendingUp, Lightbulb } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Receipt Mood Analysis Page
 * AI-powered emotional spending pattern detection
 */
export default function MoodAnalysisPage() {
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<any>(null)

  useEffect(() => {
    fetchMoodAnalysis()
  }, [])

  const fetchMoodAnalysis = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      // const res = await fetch('/api/analytics/mood-analysis')
      // const data = await res.json()
      
      // Mock data for now
      setTimeout(() => {
        setAnalysis({
          overallMood: {
            type: "routine",
            score: 75,
            description: "Disciplined, routine spending",
            color: "text-green-500",
          },
          stressSpendingScore: 35,
          impulseSpendingScore: 28,
          lateNightSpending: {
            count: 8,
            total: 245.50,
            percentage: 15,
          },
          weekendSpending: {
            count: 24,
            total: 890.25,
            percentage: 45,
          },
          insights: [
            {
              title: "Late Night Shopping Alert",
              description: "15% of purchases after 10 PM",
              icon: "Moon",
              type: "warning",
              recommendation: "Try a 24-hour waiting period",
            },
            {
              title: "Peak Spending: 6 PM",
              description: "You spend most around 6 PM ($42.50 avg)",
              icon: "Clock",
              type: "info",
            },
            {
              title: "Weekend Spender",
              description: "45% of spending happens on weekends",
              icon: "Calendar",
              type: "info",
            },
          ],
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Failed to fetch mood analysis:", error)
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Brain className="h-8 w-8 text-purple-500" />
          Spending Mood Analysis
        </h1>
        <p className="text-muted-foreground">
          AI detects your emotional spending patterns
        </p>
      </div>

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
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")

  const handleUpgrade = (plan: string) => {
    setSelectedPlan(plan)
    setShowUpgradeDialog(true)
  }

  const confirmUpgrade = () => {
    // Mock upgrade confirmation
    console.log("Upgrading to:", selectedPlan)
    setShowUpgradeDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing & Plans</h1>
        <p className="text-muted-foreground">
          Manage your subscription and usage
        </p>
      </div>

      {/* Current Plan & Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Current Usage</CardTitle>
          <CardDescription>
            Your plan limits and current usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Receipts Processed</span>
              <span className="text-sm text-muted-foreground">24 / 50</span>
            </div>
            <Progress value={48} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-muted-foreground">1.2 GB / 5 GB</span>
            </div>
            <Progress value={24} />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">AI Processing Time</span>
              <span className="text-sm text-muted-foreground">45 min / 100 min</span>
            </div>
            <Progress value={45} />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card className="relative">
          <CardHeader>
            <Badge className="w-fit mb-2" variant="outline">
              Current Plan
            </Badge>
            <CardTitle className="text-2xl">Free</CardTitle>
            <CardDescription>Perfect for getting started</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">50 receipts per month</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">5 GB storage</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Basic AI processing</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Email support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="relative border-primary shadow-lg">
          <CardHeader>
            <Badge className="w-fit mb-2">Popular</Badge>
            <CardTitle className="text-2xl">Pro</CardTitle>
            <CardDescription>For professionals and teams</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">500 receipts per month</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">50 GB storage</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Advanced AI processing</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Priority support</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Custom categories</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Export to CSV/PDF</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => handleUpgrade("Pro")}
            >
              Upgrade to Pro
            </Button>
          </CardFooter>
        </Card>

        {/* Business Plan */}
        <Card className="relative">
          <CardHeader>
            <Badge className="w-fit mb-2" variant="secondary">
              Enterprise
            </Badge>
            <CardTitle className="text-2xl">Business</CardTitle>
            <CardDescription>For large organizations</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Unlimited receipts</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">500 GB storage</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Premium AI processing</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">24/7 phone support</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Team collaboration</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">API access</span>
              </li>
              <li className="flex gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span className="text-sm">Custom integrations</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => handleUpgrade("Business")}
            >
              Upgrade to Business
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Upgrade</DialogTitle>
            <DialogDescription>
              Are you sure you want to upgrade to the {selectedPlan} plan?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              You will be charged immediately and your plan will be updated.
              You can cancel at any time.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={confirmUpgrade}>Confirm Upgrade</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
