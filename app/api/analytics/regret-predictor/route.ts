export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { auth } from "@/lib/better-auth"
import { headers } from "next/headers"
import { analyzeRegretPatterns, predictRegretScore } from "@/lib/rag/regret-predictor"
import { getDb } from "@/lib/rag/db"

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const analysis = await analyzeRegretPatterns(session.user.id)
    
    // Get recent receipts for high risk purchases display
    const db = await getDb()
    const receipts = await db.collection("receipts")
      .find({ userId: session.user.id, status: { $in: ["completed", "needs_review"] } })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray()
    
    // Transform to match frontend expectations
    const highRiskPurchases = receipts
      .filter((r: any) => {
        // Late night (10PM-2AM) or high-risk categories
        const hour = new Date(r.createdAt).getHours()
        const isLateNight = hour >= 22 || hour <= 2
        const highRiskCategories = ["Electronics", "Fashion", "Entertainment", "Shopping"]
        const isHighRiskCategory = highRiskCategories.includes(r.category || "")
        return isLateNight || (isHighRiskCategory && (r.total || 0) > 50)
      })
      .slice(0, 5)
      .map((r: any, idx: number) => {
        const hour = new Date(r.createdAt).getHours()
        const isLateNight = hour >= 22 || hour <= 2
        return {
          id: idx + 1,
          merchant: r.merchant || "Unknown",
          item: r.lineItems?.[0]?.description || r.category || "Purchase",
          amount: r.total || 0,
          regretScore: isLateNight ? 75 + Math.random() * 15 : 50 + Math.random() * 25,
          reason: isLateNight 
            ? "Late night impulse purchase pattern" 
            : `${r.category} purchases over $50 have higher regret rates`,
          category: r.category || "Other",
          date: formatRelativeDate(r.createdAt),
        }
      })
    
    // Generate regret patterns from category data
    const regretPatterns = analysis.riskCategories.slice(0, 4).map(cat => ({
      pattern: cat.category,
      percentage: Math.round(cat.regretRate),
    }))
    
    // Tips based on analysis
    const tips = [
      "🕐 Wait 48 hours before purchases over $100",
      "📝 Check if you own something similar first",
      "💭 Ask: 'Will I use this in 6 months?'",
      "🎯 Set a monthly 'fun money' budget",
      "🔔 Enable purchase cooling-off notifications",
    ]

    const transformedData = {
      overallRegretRisk: Math.round(analysis.regretRate),
      totalPotentialRegrets: analysis.potentialRegrets,
      savedFromRegret: Math.floor(analysis.potentialRegrets * 0.3), // Estimated
      averageRegretAmount: receipts.length > 0 
        ? receipts.reduce((sum: number, r: any) => sum + (r.total || 0), 0) / receipts.length 
        : 0,
      highRiskPurchases,
      pastRegrets: analysis.topRegretMerchants.slice(0, 3).map(m => ({
        merchant: m.merchant,
        item: "Multiple purchases",
        amount: 0,
        regretConfirmed: true,
        usageFrequency: `${m.regretCount} flagged purchases`,
      })),
      regretPatterns,
      tips,
      insights: analysis.insights,
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("[regret-predictor] Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze regret patterns" },
      { status: 500 }
    )
  }
}

function formatRelativeDate(date: Date | string): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  return d.toLocaleDateString()
}

// POST - Predict regret for a potential purchase
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { merchant, category, total } = body

    if (!merchant || !category || total === undefined) {
      return NextResponse.json(
        { error: "merchant, category, and total are required" },
        { status: 400 }
      )
    }

    const prediction = await predictRegretScore(
      session.user.id,
      merchant,
      category,
      total
    )

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("[regret-predictor] Prediction error:", error)
    return NextResponse.json(
      { error: "Failed to predict regret score" },
      { status: 500 }
    )
  }
}
