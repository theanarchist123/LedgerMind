/**
 * AI-Powered Receipt Mood Analysis
 * Detects emotional spending patterns based on time, frequency, and behavior
 */

import { getDb } from "./db"
import { generateText } from "./ai"
import type { ReceiptDoc } from "./types"

export interface SpendingMood {
  type: "stress" | "celebration" | "routine" | "impulse" | "necessity"
  score: number // 0-100
  description: string
  color: string
}

export interface TimePattern {
  hour: number
  count: number
  totalSpent: number
  avgAmount: number
}

export interface MoodInsight {
  title: string
  description: string
  icon: string
  type: "warning" | "info" | "success"
  recommendation?: string
}

export interface MoodAnalysisResult {
  overallMood: SpendingMood
  timePatterns: TimePattern[]
  dayPatterns: { day: string; count: number; totalSpent: number }[]
  stressSpendingScore: number // 0-100
  impulseSpendingScore: number // 0-100
  insights: MoodInsight[]
  lateNightSpending: { count: number; total: number; percentage: number }
  weekendSpending: { count: number; total: number; percentage: number }
}

/**
 * Analyze spending patterns to detect emotional triggers
 */
export async function analyzeMoodPatterns(
  userId: string,
  period: "week" | "month" | "year" = "month"
): Promise<MoodAnalysisResult> {
  const db = await getDb()
  const receiptsCol = db.collection<ReceiptDoc>("receipts")

  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  if (period === "week") startDate.setDate(startDate.getDate() - 7)
  else if (period === "month") startDate.setMonth(startDate.getMonth() - 1)
  else startDate.setFullYear(startDate.getFullYear() - 1)

  const receipts = await receiptsCol
    .find({
      userId,
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $in: ["completed", "needs_review"] },
    })
    .toArray()

  console.log(`[Mood Analysis] Analyzing ${receipts.length} receipts`)

  // Analyze time patterns
  const timePatterns = analyzeTimeOfDay(receipts)
  const dayPatterns = analyzeDayOfWeek(receipts)
  
  // Late night spending (10 PM - 2 AM)
  const lateNightReceipts = receipts.filter(r => {
    const hour = new Date(r.createdAt).getHours()
    return hour >= 22 || hour <= 2
  })
  const lateNightTotal = lateNightReceipts.reduce((sum, r) => sum + (r.total || 0), 0)
  const totalSpent = receipts.reduce((sum, r) => sum + (r.total || 0), 0)

  // Weekend spending
  const weekendReceipts = receipts.filter(r => {
    const day = new Date(r.createdAt).getDay()
    return day === 0 || day === 6
  })
  const weekendTotal = weekendReceipts.reduce((sum, r) => sum + (r.total || 0), 0)

  // Calculate stress spending score
  const stressSpendingScore = calculateStressScore(receipts, timePatterns)
  
  // Calculate impulse spending score
  const impulseSpendingScore = calculateImpulseScore(receipts)

  // Determine overall mood
  const overallMood = determineOverallMood(
    stressSpendingScore,
    impulseSpendingScore,
    lateNightReceipts.length,
    receipts.length
  )

  // Generate insights
  const insights = await generateMoodInsights(
    receipts,
    timePatterns,
    dayPatterns,
    stressSpendingScore,
    impulseSpendingScore,
    lateNightReceipts.length
  )

  return {
    overallMood,
    timePatterns,
    dayPatterns,
    stressSpendingScore,
    impulseSpendingScore,
    insights,
    lateNightSpending: {
      count: lateNightReceipts.length,
      total: lateNightTotal,
      percentage: receipts.length > 0 ? (lateNightReceipts.length / receipts.length) * 100 : 0,
    },
    weekendSpending: {
      count: weekendReceipts.length,
      total: weekendTotal,
      percentage: receipts.length > 0 ? (weekendReceipts.length / receipts.length) * 100 : 0,
    },
  }
}

function analyzeTimeOfDay(receipts: ReceiptDoc[]): TimePattern[] {
  const patterns: Record<number, TimePattern> = {}

  for (const receipt of receipts) {
    const hour = new Date(receipt.createdAt).getHours()
    if (!patterns[hour]) {
      patterns[hour] = { hour, count: 0, totalSpent: 0, avgAmount: 0 }
    }
    patterns[hour].count++
    patterns[hour].totalSpent += receipt.total || 0
  }

  return Object.values(patterns).map(p => ({
    ...p,
    avgAmount: p.count > 0 ? p.totalSpent / p.count : 0,
  }))
}

function analyzeDayOfWeek(receipts: ReceiptDoc[]) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const patterns: Record<string, { count: number; totalSpent: number }> = {}

  for (const receipt of receipts) {
    const day = days[new Date(receipt.createdAt).getDay()]
    if (!patterns[day]) {
      patterns[day] = { count: 0, totalSpent: 0 }
    }
    patterns[day].count++
    patterns[day].totalSpent += receipt.total || 0
  }

  return Object.entries(patterns).map(([day, data]) => ({
    day,
    count: data.count,
    totalSpent: data.totalSpent,
  }))
}

function calculateStressScore(receipts: ReceiptDoc[], timePatterns: TimePattern[]): number {
  let score = 0

  // Late night spending increases stress score
  const lateNightHours = [22, 23, 0, 1, 2]
  const lateNightCount = timePatterns
    .filter(p => lateNightHours.includes(p.hour))
    .reduce((sum, p) => sum + p.count, 0)
  
  if (receipts.length > 0) {
    score += (lateNightCount / receipts.length) * 40
  }

  // Frequent small purchases (stress buying)
  const smallPurchases = receipts.filter(r => (r.total || 0) < 20).length
  if (receipts.length > 0) {
    score += (smallPurchases / receipts.length) * 30
  }

  // Multiple purchases same day
  const dateGroups: Record<string, number> = {}
  for (const receipt of receipts) {
    const date = new Date(receipt.createdAt).toISOString().split("T")[0]
    dateGroups[date] = (dateGroups[date] || 0) + 1
  }
  const multiPurchaseDays = Object.values(dateGroups).filter(count => count > 3).length
  score += Math.min(multiPurchaseDays * 5, 30)

  return Math.min(Math.round(score), 100)
}

function calculateImpulseScore(receipts: ReceiptDoc[]): number {
  let score = 0

  // Large purchases in Entertainment/Shopping
  const impulseCategories = ["Shopping", "Entertainment"]
  const impulsePurchases = receipts.filter(
    r => impulseCategories.includes(r.category || "") && (r.total || 0) > 50
  )
  
  if (receipts.length > 0) {
    score += (impulsePurchases.length / receipts.length) * 50
  }

  // Quick succession purchases (within 1 hour)
  const sortedReceipts = [...receipts].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  let quickSuccession = 0
  for (let i = 1; i < sortedReceipts.length; i++) {
    const timeDiff =
      new Date(sortedReceipts[i].createdAt).getTime() -
      new Date(sortedReceipts[i - 1].createdAt).getTime()
    if (timeDiff < 3600000) quickSuccession++ // 1 hour in ms
  }
  score += Math.min((quickSuccession / receipts.length) * 50, 50)

  return Math.min(Math.round(score), 100)
}

function determineOverallMood(
  stressScore: number,
  impulseScore: number,
  lateNightCount: number,
  totalCount: number
): SpendingMood {
  if (stressScore > 60) {
    return {
      type: "stress",
      score: stressScore,
      description: "High stress spending detected",
      color: "text-red-500",
    }
  } else if (impulseScore > 60) {
    return {
      type: "impulse",
      score: impulseScore,
      description: "Frequent impulse purchases",
      color: "text-orange-500",
    }
  } else if (lateNightCount > totalCount * 0.3) {
    return {
      type: "celebration",
      score: 70,
      description: "Late night social spending",
      color: "text-purple-500",
    }
  } else if (stressScore < 30 && impulseScore < 30) {
    return {
      type: "routine",
      score: 85,
      description: "Disciplined, routine spending",
      color: "text-green-500",
    }
  } else {
    return {
      type: "necessity",
      score: 60,
      description: "Balanced spending patterns",
      color: "text-blue-500",
    }
  }
}

async function generateMoodInsights(
  receipts: ReceiptDoc[],
  timePatterns: TimePattern[],
  dayPatterns: any[],
  stressScore: number,
  impulseScore: number,
  lateNightCount: number
): Promise<MoodInsight[]> {
  const insights: MoodInsight[] = []

  // Late night spending insight
  if (lateNightCount > receipts.length * 0.2) {
    insights.push({
      title: "Late Night Shopping Alert",
      description: `${((lateNightCount / receipts.length) * 100).toFixed(0)}% of purchases after 10 PM`,
      icon: "Moon",
      type: "warning",
      recommendation: "Try a 24-hour waiting period for late-night purchases",
    })
  }

  // Stress spending insight
  if (stressScore > 50) {
    insights.push({
      title: "Stress Spending Pattern",
      description: "Multiple small purchases and late-night activity detected",
      icon: "AlertTriangle",
      type: "warning",
      recommendation: "Consider stress-relief activities before shopping",
    })
  }

  // Peak spending time
  const peakHour = timePatterns.sort((a, b) => b.count - a.count)[0]
  if (peakHour) {
    const timeLabel = peakHour.hour >= 12 ? `${peakHour.hour - 12 || 12} PM` : `${peakHour.hour} AM`
    insights.push({
      title: `Peak Spending: ${timeLabel}`,
      description: `You spend most around ${timeLabel} ($${peakHour.avgAmount.toFixed(2)} avg)`,
      icon: "Clock",
      type: "info",
    })
  }

  // Weekend spending
  const weekend = dayPatterns.filter(d => d.day === "Saturday" || d.day === "Sunday")
  const weekendTotal = weekend.reduce((sum, d) => sum + d.totalSpent, 0)
  const totalSpent = receipts.reduce((sum, r) => sum + (r.total || 0), 0)
  
  if (weekendTotal > totalSpent * 0.5) {
    insights.push({
      title: "Weekend Spender",
      description: `${((weekendTotal / totalSpent) * 100).toFixed(0)}% of spending happens on weekends`,
      icon: "Calendar",
      type: "info",
    })
  }

  // AI-generated personalized insight
  try {
    const prompt = `Based on this spending behavior, give ONE specific psychological insight in 15 words:
- Stress score: ${stressScore}/100
- Impulse score: ${impulseScore}/100
- Late night purchases: ${lateNightCount}/${receipts.length}
- Total spent: $${receipts.reduce((s, r) => s + (r.total || 0), 0).toFixed(2)}

Focus on the emotional driver, not generic advice.`

    const aiInsight = await generateText(prompt)
    if (aiInsight) {
      insights.push({
        title: "AI Psychological Analysis",
        description: aiInsight.split(".")[0] + ".",
        icon: "Brain",
        type: "info",
      })
    }
  } catch (error) {
    console.warn("[Mood Analysis] AI insight generation failed:", error)
  }

  return insights.slice(0, 5)
}
