"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "@/lib/auth-client"
import { DollarSign, Receipt, TrendingUp, Layers, ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion"
import { AIInsightsCard } from "@/components/ai-insights-card"
import { ReceiptChat } from "@/components/receipt-chat"
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
  Legend,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"

// Animated number with spring effect
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const mv = useMotionValue(0)
  const spring = useSpring(mv, { stiffness: 140, damping: 18 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    mv.set(value)
  }, [value, mv])

  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)))
    return () => unsub()
  }, [spring])

  return (
    <span>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  )
}

// Stats card component
function StatsCard({
  icon: Icon,
  label,
  value,
  prefix,
  suffix,
  description,
  trendIcon: TrendIcon,
  colorClass,
  borderClass,
  bgClass,
  iconBgClass,
}: {
  icon: any
  label: string
  value: number
  prefix?: string
  suffix?: string
  description: string
  trendIcon?: any
  colorClass: string
  borderClass: string
  bgClass: string
  iconBgClass: string
}) {
  return (
    <Card className={`${borderClass} ${bgClass} hover:shadow-lg hover:shadow-green-500/10 transition-all`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={`text-sm font-medium ${colorClass}`}>{label}</CardTitle>
        <div className={`h-10 w-10 rounded-full ${iconBgClass} flex items-center justify-center`}>
          <Icon className={`h-5 w-5 ${colorClass.replace('text-', 'text-').replace('-400', '-500')}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${colorClass}`}>
          <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
        </div>
        <div className="flex items-center gap-1 mt-1">
          {TrendIcon && <TrendIcon className="h-3 w-3 text-green-500" />}
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Animation variants
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 260, damping: 24 },
  },
}

// Tab transition variants
const tabVariants = {
  enter: { opacity: 0, x: 20, scale: 0.98 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -20, scale: 0.98 },
}

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

// Chart configurations with theme-aware colors
const monthlyChartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(142, 76%, 36%)", // Green 600
  },
} satisfies ChartConfig

const trendChartConfig = {
  amount: {
    label: "Spending",
    color: "hsl(142, 71%, 45%)", // Green 500
  },
  count: {
    label: "Receipt Count",
    color: "hsl(160, 84%, 39%)", // Emerald 500
  },
} satisfies ChartConfig

const merchantChartConfig = {
  amount: {
    label: "Total Spent",
    color: "hsl(142, 76%, 36%)", // Green 600
  },
} satisfies ChartConfig

/**
 * Dashboard page with real KPIs, charts, and recent receipts
 */
export default function DashboardPage() {
  const { data: session } = useSession()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [recentReceipts, setRecentReceipts] = useState<ReceiptItem[]>([])
  const [loading, setLoading] = useState(true)

  // Generate category chart config dynamically with green shades
  const generateCategoryChartConfig = () => {
    if (!analytics) return {}
    
    const greenShades = [
      "hsl(142, 77%, 73%)", // Green 300 - Light
      "hsl(142, 69%, 58%)", // Green 400
      "hsl(142, 71%, 45%)", // Green 500
      "hsl(142, 76%, 36%)", // Green 600
      "hsl(142, 72%, 29%)", // Green 700
      "hsl(142, 70%, 24%)", // Green 800 - Dark
      "hsl(160, 84%, 39%)", // Emerald 500
      "hsl(158, 64%, 52%)", // Teal 400
      "hsl(152, 69%, 31%)", // Emerald 700
      "hsl(151, 55%, 42%)", // Emerald 600
    ]
    
    const config: ChartConfig = {}
    analytics.categoryBreakdown.forEach((cat, index) => {
      config[cat.category] = {
        label: cat.category,
        color: greenShades[index % greenShades.length],
      }
    })
    return config
  }

  const categoryChartConfig = generateCategoryChartConfig()

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
    <div className="space-y-6 scroll-smooth">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your receipt management activity
        </p>
      </div>

      {/* KPI Cards - Animated with Spring Count-Up */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
          <StatsCard
            icon={DollarSign}
            label="Total Spent"
            value={analytics.totalSpent}
            prefix="$"
            description={`${analytics.receiptsProcessed} receipts`}
            trendIcon={ArrowUpRight}
            colorClass="text-green-400"
            borderClass="border-green-500/20"
            bgClass="bg-gradient-to-br from-green-950/50 to-background"
            iconBgClass="bg-green-500/10"
          />
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
          <StatsCard
            icon={Receipt}
            label="Receipts Processed"
            value={analytics.receiptsProcessed}
            description={`${analytics.statusCounts.completed || 0} completed`}
            trendIcon={ArrowUpRight}
            colorClass="text-emerald-400"
            borderClass="border-emerald-500/20"
            bgClass="bg-gradient-to-br from-emerald-950/50 to-background"
            iconBgClass="bg-emerald-500/10"
          />
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
          <StatsCard
            icon={TrendingUp}
            label="Avg. Confidence"
            value={analytics.averageConfidence}
            suffix="%"
            description={
              analytics.averageConfidence >= 85
                ? "Excellent accuracy"
                : analytics.averageConfidence >= 70
                ? "Good accuracy"
                : "Fair accuracy"
            }
            trendIcon={analytics.averageConfidence >= 85 ? ArrowUpRight : ArrowDownRight}
            colorClass="text-teal-400"
            borderClass="border-teal-500/20"
            bgClass="bg-gradient-to-br from-teal-950/50 to-background"
            iconBgClass="bg-teal-500/10"
          />
        </motion.div>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }}>
          <StatsCard
            icon={Layers}
            label="Categories"
            value={analytics.categoriesCount}
            description="Active categories"
            colorClass="text-lime-400"
            borderClass="border-lime-500/20"
            bgClass="bg-gradient-to-br from-lime-950/50 to-background"
            iconBgClass="bg-lime-500/10"
          />
        </motion.div>
      </motion.div>

      {/* AI Insights */}
      {session?.user?.id && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <AIInsightsCard userId={session.user.id} />
        </motion.div>
      )}

      {/* Receipt Chat */}
      {session?.user?.id && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <ReceiptChat userId={session.user.id} />
        </motion.div>
      )}

      {/* Charts Section */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <motion.div
            key="overview"
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending</CardTitle>
              <CardDescription>
                Your spending trends over the past 6 months
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ChartContainer config={monthlyChartConfig} className="h-[300px] w-full">
                <BarChart data={analytics.monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="var(--color-amount)" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <motion.div
            key="trends"
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>
                Track your spending patterns over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendChartConfig} className="h-[300px] w-full">
                <LineChart data={analytics.monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    yAxisId="left"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--color-amount)"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-count)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
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
              <ChartContainer config={merchantChartConfig} className="h-[250px] w-full">
                <BarChart data={analytics.topMerchants} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <YAxis 
                    dataKey="merchant" 
                    type="category" 
                    width={100}
                    tickLine={false}
                    axisLine={false}
                  />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Total Spent"]}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="var(--color-amount)"
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <motion.div
            key="categories"
            variants={tabVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
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
                <ChartContainer 
                  config={categoryChartConfig} 
                  className="h-[300px] w-full"
                >
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
                      dataKey="amount"
                      nameKey="category"
                    >
                      {analytics.categoryBreakdown.map((entry, index) => {
                        const greenShades = [
                          "hsl(142, 77%, 73%)", "hsl(142, 69%, 58%)", "hsl(142, 71%, 45%)",
                          "hsl(142, 76%, 36%)", "hsl(142, 72%, 29%)", "hsl(142, 70%, 24%)",
                          "hsl(160, 84%, 39%)", "hsl(158, 64%, 52%)", "hsl(152, 69%, 31%)",
                          "hsl(151, 55%, 42%)",
                        ]
                        return (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={greenShades[index % greenShades.length]}
                          />
                        )
                      })}
                    </Pie>
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => [`$${value.toFixed(2)}`, "Amount"]}
                    />
                  </PieChart>
                </ChartContainer>
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
                  {analytics.categoryBreakdown.map((cat, index) => {
                    const greenShades = [
                      "hsl(142, 77%, 73%)", "hsl(142, 69%, 58%)", "hsl(142, 71%, 45%)",
                      "hsl(142, 76%, 36%)", "hsl(142, 72%, 29%)", "hsl(142, 70%, 24%)",
                      "hsl(160, 84%, 39%)", "hsl(158, 64%, 52%)", "hsl(152, 69%, 31%)",
                      "hsl(151, 55%, 42%)",
                    ]
                    const color = greenShades[index % greenShades.length]
                    return (
                      <div key={cat.category} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: color }}
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
                                backgroundColor: color
                              }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {cat.count} receipt{cat.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Recent Receipts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
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
      </motion.div>
    </div>
  )
}
