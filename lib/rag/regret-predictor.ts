/**
 * Purchase Regret Predictor
 * AI warns users before potentially regrettable purchases
 */

import { getDb } from "./db"
import { generateText } from "./ai"
import type { ReceiptDoc } from "./types"

export interface RegretScore {
  score: number // 0-100, higher = more likely to regret
  confidence: number
  reasons: string[]
  recommendation: string
}

export interface RegretAnalysis {
  totalPurchases: number
  potentialRegrets: number
  regretRate: number // percentage
  riskCategories: { category: string; regretRate: number }[]
  topRegretMerchants: { merchant: string; regretCount: number }[]
  insights: {
    title: string
    description: string
    type: "warning" | "info" | "success"
  }[]
}

/**
 * Analyze historical purchases to identify regret patterns
 */
export async function analyzeRegretPatterns(
  userId: string
): Promise<RegretAnalysis> {
  const db = await getDb()
  const receiptsCol = db.collection<ReceiptDoc>("receipts")

  const receipts = await receiptsCol
    .find({
      userId,
      status: { $in: ["completed", "needs_review"] },
    })
    .toArray()

  console.log(`[Regret Predictor] Analyzing ${receipts.length} receipts`)

  // Identify potential regrets based on patterns
  const potentialRegrets = receipts.filter(isLikelyRegret)

  // Calculate regret rate by category
  const categoryRegrets: Record<string, { total: number; regrets: number }> = {}
  
  for (const receipt of receipts) {
    const cat = receipt.category || "Other"
    if (!categoryRegrets[cat]) {
      categoryRegrets[cat] = { total: 0, regrets: 0 }
    }
    categoryRegrets[cat].total++
    if (isLikelyRegret(receipt)) {
      categoryRegrets[cat].regrets++
    }
  }

  const riskCategories = Object.entries(categoryRegrets)
    .map(([category, data]) => ({
      category,
      regretRate: (data.regrets / data.total) * 100,
    }))
    .sort((a, b) => b.regretRate - a.regretRate)

  // Top regret merchants
  const merchantRegrets: Record<string, number> = {}
  for (const receipt of potentialRegrets) {
    const merchant = receipt.merchant || "Unknown"
    merchantRegrets[merchant] = (merchantRegrets[merchant] || 0) + 1
  }

  const topRegretMerchants = Object.entries(merchantRegrets)
    .map(([merchant, regretCount]) => ({ merchant, regretCount }))
    .sort((a, b) => b.regretCount - a.regretCount)
    .slice(0, 5)

  // Generate insights
  const insights = generateRegretInsights(
    receipts.length,
    potentialRegrets.length,
    riskCategories
  )

  return {
    totalPurchases: receipts.length,
    potentialRegrets: potentialRegrets.length,
    regretRate: receipts.length > 0 ? (potentialRegrets.length / receipts.length) * 100 : 0,
    riskCategories: riskCategories.slice(0, 5),
    topRegretMerchants,
    insights,
  }
}

/**
 * Predict regret score for a new purchase
 */
export async function predictRegretScore(
  userId: string,
  merchant: string,
  category: string,
  total: number
): Promise<RegretScore> {
  const db = await getDb()
  const receiptsCol = db.collection<ReceiptDoc>("receipts")

  // Fetch user's purchase history
  const history = await receiptsCol
    .find({
      userId,
      status: { $in: ["completed", "needs_review"] },
    })
    .toArray()

  let score = 0
  const reasons: string[] = []

  // Check 1: Similar purchases in past that might be unused
  const similarPurchases = history.filter(
    r => r.category === category && Math.abs((r.total || 0) - total) < total * 0.3
  )
  
  if (similarPurchases.length > 2) {
    score += 30
    reasons.push(`You've bought ${similarPurchases.length} similar items before`)
  }

  // Check 2: Impulse category
  const impulseCategories = ["Shopping", "Entertainment", "Electronics"]
  if (impulseCategories.includes(category)) {
    score += 20
    reasons.push("Category prone to impulse buying")
  }

  // Check 3: High price for category
  const categoryPurchases = history.filter(r => r.category === category)
  const avgCategoryPrice =
    categoryPurchases.reduce((sum, r) => sum + (r.total || 0), 0) / categoryPurchases.length
  
  if (total > avgCategoryPrice * 1.5) {
    score += 25
    reasons.push(`${Math.round((total / avgCategoryPrice - 1) * 100)}% more than usual for this category`)
  }

  // Check 4: Same merchant with high frequency
  const merchantPurchases = history.filter(
    r => (r.merchant || "").toLowerCase() === merchant.toLowerCase()
  )
  
  if (merchantPurchases.length > 5) {
    score += 15
    reasons.push(`You've shopped at ${merchant} ${merchantPurchases.length} times`)
  }

  // Check 5: Purchase timing (late night, weekend)
  const hour = new Date().getHours()
  if (hour >= 22 || hour <= 2) {
    score += 10
    reasons.push("Late night purchase - sleep on it?")
  }

  const recommendation = getRecommendation(score)

  return {
    score: Math.min(score, 100),
    confidence: 0.75,
    reasons,
    recommendation,
  }
}

function isLikelyRegret(receipt: ReceiptDoc): boolean {
  // Heuristics for identifying potential regrets
  const impulseCategories = ["Shopping", "Entertainment", "Electronics"]
  const isImpulseCategory = impulseCategories.includes(receipt.category || "")
  
  // Large purchases in impulse categories - use INR threshold (~$100 = 8350 INR)
  if (isImpulseCategory && (receipt.totalINR ?? receipt.total ?? 0) > 8350) return true
  
  // Low confidence AI categorization (might be wrong purchase)
  if ((receipt.categoryConfidence || 0) < 0.5) return true
  
  // Multiple purchases same merchant same day (over-buying)
  // This would require cross-receipt analysis in real implementation
  
  return false
}

function getRecommendation(score: number): string {
  if (score > 70) return "⚠️ High regret risk - Wait 48 hours before buying"
  if (score > 50) return "⏸️ Moderate risk - Sleep on it tonight"
  if (score > 30) return "💭 Consider if you really need this"
  return "✅ Low regret risk - Looks like a good purchase"
}

function generateRegretInsights(
  totalPurchases: number,
  potentialRegrets: number,
  riskCategories: any[]
): any[] {
  const insights: any[] = []

  const regretRate = totalPurchases > 0 ? (potentialRegrets / totalPurchases) * 100 : 0

  if (regretRate > 30) {
    insights.push({
      title: "High Regret Rate",
      description: `${regretRate.toFixed(0)}% of purchases might be regrettable`,
      type: "warning",
    })
  } else if (regretRate < 15) {
    insights.push({
      title: "Mindful Spender",
      description: `Only ${regretRate.toFixed(0)}% regret risk - you make good decisions!`,
      type: "success",
    })
  }

  // Risky category
  const topRiskyCategory = riskCategories[0]
  if (topRiskyCategory && topRiskyCategory.regretRate > 40) {
    insights.push({
      title: `Watch ${topRiskyCategory.category} Purchases`,
      description: `${topRiskyCategory.regretRate.toFixed(0)}% regret rate in this category`,
      type: "warning",
    })
  }

  insights.push({
    title: "💡 Pro Tip",
    description: "Use the 24-hour rule: Wait a day before making purchases over $50",
    type: "info",
  })

  return insights
}
