"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "@/lib/auth-client"
import { DollarSign, Receipt, TrendingUp, Layers, ArrowRight } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface Analytics {
  totalSpent: number
  receiptsProcessed: number
  averageConfidence: number
  categoriesCount: number
  statusCounts: Record<string, number>
  categoryBreakdown: Array<{
    category: string
    amount: number
    count: number
    percentage: number
  }>
  monthlySpending: Array<{
    month: string
    amount: number
    count: number
  }>
  topMerchants: Array<{
    merchant: string
    amount: number
    count: number
  }>
}

interface ReceiptItem {
  id: string
  merchant: string
  date: string
  category: string
  status: string
  total: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

/**
 * Dashboard page with real KPIs, charts, and recent receipts
 */
export default function DashboardPage() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [recentReceipts, setRecentReceipts] = useState<ReceiptItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.id) {
      fetchDashboardData()
    }
  }, [session?.user?.id])

  async function fetchDashboardData() {
    try {
      setLoading(true)
      
      // Fetch analytics
      const analyticsRes = await fetch("/api/analytics")
      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        setAnalytics(data)
      }

      // Fetch recent receipts
      const receiptsRes = await fetch(`/api/receipts/list?userId=${session?.user?.id}&limit=5`)
      if (receiptsRes.ok) {
        const data = await receiptsRes.json()
        setRecentReceipts(data.receipts || [])
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !analytics) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
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
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your receipt management activity
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${analytics.totalSpent.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {analytics.receiptsProcessed} receipts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Receipts Processed
            </CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.receiptsProcessed}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.statusCounts.completed || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Confidence
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageConfidence}%
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.averageConfidence >= 85 ? "Excellent" : analytics.averageConfidence >= 70 ? "Good" : "Fair"} accuracy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.categoriesCount}
            </div>
            <p className="text-xs text-muted-foreground">
              Active categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending</CardTitle>
              <CardDescription>
                Your spending trends over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Bar dataKey="amount" fill="#0088FE" name="Amount" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>
                Analyze your spending patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    labelStyle={{ color: '#000' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#00C49F" 
                    strokeWidth={2}
                    name="Spending"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#FF8042" 
                    strokeWidth={2}
                    name="Receipt Count"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Merchants */}
          <Card>
            <CardHeader>
              <CardTitle>Top Merchants</CardTitle>
              <CardDescription>
                Your most frequent vendors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.topMerchants} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="merchant" type="category" width={100} />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                    labelStyle={{ color: '#000' }}
                  />
                  <Bar dataKey="amount" fill="#8884D8" name="Total Spent" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>
                  Spending by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => 
                        `${entry.category}: ${entry.percentage}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="category"
                    >
                      {analytics.categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                      labelStyle={{ color: '#000' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Breakdown List */}
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>
                  Detailed spending per category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.categoryBreakdown.map((cat, index) => (
                    <div key={cat.category} className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{cat.category}</span>
                          <span className="text-sm text-muted-foreground">
                            ${cat.amount.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{ 
                              width: `${cat.percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {cat.count} receipt{cat.count !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Receipts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Receipts</CardTitle>
              <CardDescription>
                Your latest processed receipts
              </CardDescription>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/app/receipts">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentReceipts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No receipts yet</p>
              <Button asChild variant="link" size="sm" className="mt-2">
                <Link href="/app/upload">Upload your first receipt</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell className="font-medium">
                      <Link 
                        href={`/app/receipts/${receipt.id}`}
                        className="hover:underline"
                      >
                        {receipt.merchant || "Unknown"}
                      </Link>
                    </TableCell>
                    <TableCell>{receipt.date || "N/A"}</TableCell>
                    <TableCell>{receipt.category || "Uncategorized"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          receipt.status === "completed"
                            ? "default"
                            : receipt.status === "needs_review"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {receipt.status?.replace("_", " ") || "pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      ${receipt.total?.toFixed(2) || "0.00"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
