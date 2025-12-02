/**
 * Carbon Footprint Tracker
 * Estimates environmental impact of purchases using AI and category-based calculations
 */

import { getDb } from "./db"
import { generateText } from "./ai"
import type { ReceiptDoc } from "./types"

export interface CarbonEstimate {
  co2kg: number // kg of CO2
  source: "category" | "ai" | "merchant"
  confidence: number // 0-1
}

export interface EcoInsight {
  title: string
  description: string
  icon: string
  type: "success" | "warning" | "info"
  action?: string
}

export interface CarbonAnalysisResult {
  totalCO2kg: number
  treesEquivalent: number // trees needed to offset
  categoryBreakdown: { category: string; co2kg: number; percentage: number }[]
  monthlyTrend: { month: string; co2kg: number }[]
  ecoScore: number // 0-100, higher is better
  insights: EcoInsight[]
  topPolluters: { merchant: string; co2kg: number; category: string }[]
  recommendations: string[]
}

// Category-based CO2 estimates (kg CO2 per dollar spent)
const CATEGORY_CO2_FACTORS: Record<string, number> = {
  "Food & Beverage": 0.5, // Local food
  "Fast Food": 1.2,
  "Transportation": 0.8,
  "Air Travel": 5.0,
  "Shopping": 0.6,
  "Electronics": 1.5,
  "Fashion": 1.8,
  "Utilities": 0.4,
  "Groceries": 0.3,
  "Entertainment": 0.2,
  "Business": 0.5,
  "Other": 0.4,
}

// Merchant-specific overrides (known eco-friendly or high-polluting brands)
const MERCHANT_CO2_MULTIPLIERS: Record<string, number> = {
  "whole foods": 0.6, // Organic focus
  "trader joe": 0.7,
  "amazon": 1.3, // Shipping emissions
  "uber": 0.9,
  "lyft": 0.9,
  "tesla": 0.3, // Electric
  "shell": 2.0, // Fossil fuels
  "bp": 2.0,
}

/**
 * Analyze carbon footprint of user's spending
 */
export async function analyzeCarbonFootprint(
  userId: string,
  period: "week" | "month" | "year" = "month"
): Promise<CarbonAnalysisResult> {
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

  console.log(`[Carbon Tracker] Analyzing ${receipts.length} receipts`)

  // Calculate CO2 for each receipt
  const receiptsWithCO2 = await Promise.all(
    receipts.map(async (receipt) => {
      const estimate = await estimateCO2(receipt)
      return { ...receipt, co2Estimate: estimate }
    })
  )

  // Total CO2
  const totalCO2kg = receiptsWithCO2.reduce((sum, r) => sum + r.co2Estimate.co2kg, 0)

  // Trees equivalent (1 tree absorbs ~22 kg CO2/year)
  const treesEquivalent = Math.ceil(totalCO2kg / 22)

  // Category breakdown
  const categoryMap: Record<string, number> = {}
  for (const receipt of receiptsWithCO2) {
    const cat = receipt.category || "Other"
    categoryMap[cat] = (categoryMap[cat] || 0) + receipt.co2Estimate.co2kg
  }
  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, co2kg]) => ({
      category,
      co2kg,
      percentage: (co2kg / totalCO2kg) * 100,
    }))
    .sort((a, b) => b.co2kg - a.co2kg)

  // Monthly trend (if period is long enough)
  const monthlyTrend = calculateMonthlyTrend(receiptsWithCO2)

  // Eco score (0-100, based on CO2 per dollar)
  const totalSpent = receipts.reduce((sum, r) => sum + (r.total || 0), 0)
  const co2PerDollar = totalSpent > 0 ? totalCO2kg / totalSpent : 0
  const ecoScore = Math.max(0, Math.min(100, 100 - co2PerDollar * 50))

  // Top polluters
  const topPolluters = receiptsWithCO2
    .sort((a, b) => b.co2Estimate.co2kg - a.co2Estimate.co2kg)
    .slice(0, 5)
    .map(r => ({
      merchant: r.merchant || "Unknown",
      co2kg: r.co2Estimate.co2kg,
      category: r.category || "Other",
    }))

  // Generate insights
  const insights = await generateEcoInsights(
    receiptsWithCO2,
    categoryBreakdown,
    ecoScore,
    totalCO2kg
  )

  // Generate recommendations
  const recommendations = generateRecommendations(categoryBreakdown, topPolluters)

  return {
    totalCO2kg,
    treesEquivalent,
    categoryBreakdown,
    monthlyTrend,
    ecoScore,
    insights,
    topPolluters,
    recommendations,
  }
}

/**
 * Estimate CO2 for a single receipt
 */
async function estimateCO2(receipt: ReceiptDoc): Promise<CarbonEstimate> {
  const total = receipt.total || 0
  const category = receipt.category || "Other"
  const merchant = (receipt.merchant || "").toLowerCase()

  // Get base factor from category
  let co2Factor = CATEGORY_CO2_FACTORS[category] || CATEGORY_CO2_FACTORS["Other"]

  // Apply merchant multiplier if applicable
  for (const [key, multiplier] of Object.entries(MERCHANT_CO2_MULTIPLIERS)) {
    if (merchant.includes(key)) {
      co2Factor *= multiplier
      break
    }
  }

  // Calculate CO2
  const co2kg = total * co2Factor

  return {
    co2kg: Math.round(co2kg * 100) / 100,
    source: "category",
    confidence: 0.7,
  }
}

function calculateMonthlyTrend(receipts: any[]): { month: string; co2kg: number }[] {
  const monthMap: Record<string, number> = {}

  for (const receipt of receipts) {
    const date = new Date(receipt.createdAt)
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
    monthMap[monthKey] = (monthMap[monthKey] || 0) + receipt.co2Estimate.co2kg
  }

  return Object.entries(monthMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, co2kg]) => ({ month, co2kg }))
}

async function generateEcoInsights(
  receipts: any[],
  categoryBreakdown: any[],
  ecoScore: number,
  totalCO2: number
): Promise<EcoInsight[]> {
  const insights: EcoInsight[] = []

  // Eco score insight
  if (ecoScore > 75) {
    insights.push({
      title: "🌱 Eco Champion",
      description: `Your eco score is ${Math.round(ecoScore)}/100. You're in the top 25% of sustainable spenders!`,
      icon: "Leaf",
      type: "success",
    })
  } else if (ecoScore < 40) {
    insights.push({
      title: "⚠️ High Carbon Footprint",
      description: `Eco score: ${Math.round(ecoScore)}/100. Consider switching to eco-friendly alternatives.`,
      icon: "AlertTriangle",
      type: "warning",
      action: "View Recommendations",
    })
  }

  // Category-specific insights
  const highestCategory = categoryBreakdown[0]
  if (highestCategory && highestCategory.percentage > 40) {
    insights.push({
      title: `${highestCategory.category} Impact`,
      description: `${Math.round(highestCategory.percentage)}% of your carbon footprint comes from ${highestCategory.category}`,
      icon: "PieChart",
      type: "info",
    })
  }

  // Trees equivalent insight
  const trees = Math.ceil(totalCO2 / 22)
  insights.push({
    title: `Plant ${trees} Trees to Offset`,
    description: `Your carbon footprint equals ${totalCO2.toFixed(1)} kg CO2 this period`,
    icon: "TreePine",
    type: "info",
    action: "Offset Now",
  })

  // Transport insight
  const transportCO2 = categoryBreakdown.find(c => c.category === "Transportation")?.co2kg || 0
  if (transportCO2 > totalCO2 * 0.3) {
    insights.push({
      title: "Consider Public Transport",
      description: `${Math.round((transportCO2 / totalCO2) * 100)}% of emissions from transportation`,
      icon: "Bus",
      type: "warning",
      action: "Explore Alternatives",
    })
  }

  return insights.slice(0, 5)
}

function generateRecommendations(
  categoryBreakdown: any[],
  topPolluters: any[]
): string[] {
  const recommendations: string[] = []

  // Category-based recommendations
  for (const cat of categoryBreakdown.slice(0, 3)) {
    if (cat.category === "Transportation" && cat.percentage > 20) {
      recommendations.push("🚴 Switch to bike or public transport for short distances")
    } else if (cat.category === "Food & Beverage" && cat.percentage > 30) {
      recommendations.push("🥗 Choose local, plant-based options to reduce food emissions")
    } else if (cat.category === "Shopping" && cat.percentage > 25) {
      recommendations.push("♻️ Buy second-hand or from sustainable brands")
    }
  }

  // General recommendations
  recommendations.push("🌍 Use reusable bags and containers")
  recommendations.push("💚 Support eco-certified businesses")
  recommendations.push("📦 Reduce online shopping to minimize shipping emissions")

  return recommendations.slice(0, 5)
}
