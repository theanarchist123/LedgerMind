/**
 * AI Spending Insights Generator
 * Analyzes spending patterns and generates intelligent insights
 */

import { getDb } from "./db"
import { generateText } from "./ai"
import type { ReceiptDoc } from "./types"

export interface SpendingInsight {
  type: "success" | "warning" | "info"
  icon: string
  title: string
  description: string
  category?: string
  amount?: number
}

export interface SpendingAnalysis {
  insights: SpendingInsight[]
  totalSpent: number
  receiptCount: number
  topCategory: string
  categoryBreakdown: Record<string, number>
  monthlyTrend: "increasing" | "decreasing" | "stable"
  needsReviewCount: number
}

/**
 * Generate AI-powered spending insights
 */
export async function generateSpendingInsights(
  userId: string,
  period: "week" | "month" | "year" = "month"
): Promise<SpendingAnalysis> {
  const db = await getDb()
  const receiptsCol = db.collection<ReceiptDoc>("receipts")

  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  if (period === "week") startDate.setDate(startDate.getDate() - 7)
  else if (period === "month") startDate.setMonth(startDate.getMonth() - 1)
  else startDate.setFullYear(startDate.getFullYear() - 1)

  const startStr = startDate.toISOString().split("T")[0]
  const endStr = endDate.toISOString().split("T")[0]

  // Fetch receipts
  const receipts = await receiptsCol
    .find({
      userId,
      date: { $gte: startStr, $lte: endStr },
      status: { $in: ["completed", "needs_review"] },
    })
    .toArray()

  console.log(`[Insights] Analyzing ${receipts.length} receipts for period: ${period}`)

  // Calculate basic stats
  const totalSpent = receipts.reduce((sum, r) => sum + (r.total || 0), 0)
  const receiptCount = receipts.length
  const needsReviewCount = receipts.filter(r => r.status === "needs_review").length

  // Category breakdown
  const categoryBreakdown: Record<string, number> = {}
  for (const receipt of receipts) {
    const cat = receipt.category || "Other"
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + (receipt.total || 0)
  }

  const topCategory =
    Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || "Other"

  // Calculate trend (compare with previous period)
  const prevPeriodStart = new Date(startDate)
  const prevPeriodEnd = new Date(startDate)
  prevPeriodEnd.setDate(prevPeriodEnd.getDate() - 1)
  if (period === "week") prevPeriodStart.setDate(prevPeriodStart.getDate() - 7)
  else if (period === "month") prevPeriodStart.setMonth(prevPeriodStart.getMonth() - 1)
  else prevPeriodStart.setFullYear(prevPeriodStart.getFullYear() - 1)

  const prevReceipts = await receiptsCol
    .find({
      userId,
      date: {
        $gte: prevPeriodStart.toISOString().split("T")[0],
        $lte: prevPeriodEnd.toISOString().split("T")[0],
      },
      status: { $in: ["completed", "needs_review"] },
    })
    .toArray()

  const prevTotal = prevReceipts.reduce((sum, r) => sum + (r.total || 0), 0)
  const changePercent = prevTotal > 0 ? ((totalSpent - prevTotal) / prevTotal) * 100 : 0

  let monthlyTrend: "increasing" | "decreasing" | "stable" = "stable"
  if (changePercent > 10) monthlyTrend = "increasing"
  else if (changePercent < -10) monthlyTrend = "decreasing"

  // Generate insights
  const insights: SpendingInsight[] = []

  // 1. Learning accuracy insight
  const learnedCategories = receipts.filter(r => r.categoryMethod === "learned")
  if (learnedCategories.length > 0) {
    const accuracy = (learnedCategories.length / receiptCount) * 100
    insights.push({
      type: "success",
      icon: "CheckCircle",
      title: `AI Learning: ${accuracy.toFixed(0)}% Accurate`,
      description: `Smart categorization is learning from your ${learnedCategories.length} corrections`,
    })
  }

  // 2. Needs review alert
  if (needsReviewCount > 0) {
    insights.push({
      type: "warning",
      icon: "AlertCircle",
      title: `${needsReviewCount} Receipt${needsReviewCount > 1 ? "s" : ""} Need Review`,
      description: "Some receipts have quality issues and need your attention",
    })
  }

  // 3. Spending trend insight
  if (monthlyTrend === "increasing" && changePercent > 15) {
    insights.push({
      type: "warning",
      icon: "TrendingUp",
      title: `Spending Up ${changePercent.toFixed(0)}%`,
      description: `You're spending more than last ${period}. Top category: ${topCategory}`,
      category: topCategory,
    })
  } else if (monthlyTrend === "decreasing" && changePercent < -15) {
    insights.push({
      type: "success",
      icon: "TrendingDown",
      title: `Spending Down ${Math.abs(changePercent).toFixed(0)}%`,
      description: `Great job! You spent less than last ${period}`,
    })
  } else {
    insights.push({
      type: "info",
      icon: "TrendingUp",
      title: `Spending Stable`,
      description: `Similar to last ${period}. Total: $${totalSpent.toFixed(2)}`,
    })
  }

  // 4. Category-specific insights
  const topCategorySpent = categoryBreakdown[topCategory] || 0
  const topCategoryPercent = (topCategorySpent / totalSpent) * 100

  if (topCategoryPercent > 40) {
    insights.push({
      type: "info",
      icon: "PieChart",
      title: `${topCategoryPercent.toFixed(0)}% on ${topCategory}`,
      description: `This is your biggest expense category`,
      category: topCategory,
      amount: topCategorySpent,
    })
  }

  // 5. Generate AI summary using LLM (if available)
  try {
    const aiInsight = await generateAISummary(receipts, categoryBreakdown, monthlyTrend)
    if (aiInsight) {
      insights.push({
        type: "info",
        icon: "Sparkles",
        title: "AI Analysis",
        description: aiInsight,
      })
    }
  } catch (error) {
    console.warn("[Insights] AI summary generation failed:", error)
  }

  return {
    insights: insights.slice(0, 5), // Limit to 5 insights
    totalSpent,
    receiptCount,
    topCategory,
    categoryBreakdown,
    monthlyTrend,
    needsReviewCount,
  }
}

/**
 * Generate AI summary of spending patterns
 */
async function generateAISummary(
  receipts: ReceiptDoc[],
  categoryBreakdown: Record<string, number>,
  trend: string
): Promise<string | null> {
  if (receipts.length === 0) return null

  const total = receipts.reduce((sum, r) => sum + (r.total || 0), 0)
  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)

  const topMerchants = receipts
    .reduce((acc, r) => {
      const merchant = r.merchant || "Unknown"
      acc[merchant] = (acc[merchant] || 0) + (r.total || 0)
      return acc
    }, {} as Record<string, number>)

  const topMerchantsList = Object.entries(topMerchants)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, amt]) => `${name}: $${amt.toFixed(2)}`)

  const prompt = `Analyze this spending data and provide ONE insightful observation in 10-15 words:

Total: $${total.toFixed(2)} across ${receipts.length} receipts
Trend: ${trend}
Top Categories: ${topCategories.join(", ")}
Top Merchants: ${topMerchantsList.join(", ")}

Provide a single, specific insight about spending patterns (not generic advice). Focus on trends or unusual patterns.`

  try {
    const summary = await generateText(prompt)
    // Trim to reasonable length
    return summary.split(".")[0] + "."
  } catch (error) {
    return null
  }
}
