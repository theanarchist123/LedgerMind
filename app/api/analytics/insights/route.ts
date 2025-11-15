export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { generateSpendingInsights } from "@/lib/rag/spending-insights"

/**
 * GET /api/analytics/insights - Get AI-generated spending insights
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    const period = (searchParams.get("period") || "month") as "week" | "month" | "year"

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      )
    }

    console.log(`[insights] Generating for user ${userId}, period: ${period}`)

    const analysis = await generateSpendingInsights(userId, period)

    return NextResponse.json({
      success: true,
      ...analysis,
    })
  } catch (error: any) {
    console.error("[insights] Error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate insights" },
      { status: 500 }
    )
  }
}
