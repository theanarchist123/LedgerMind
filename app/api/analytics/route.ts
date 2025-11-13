import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { auth } from "@/lib/better-auth"
import { headers } from "next/headers"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const db = await getDb()
    const receiptsCollection = db.collection("receipts")

    // Get all user's receipts
    const receipts = await receiptsCollection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    // Calculate total spent
    const totalSpent = receipts.reduce((sum, r) => sum + (r.total || 0), 0)

    // Calculate receipts by status
    const statusCounts = receipts.reduce((acc: any, r) => {
      const status = r.status || "pending"
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    // Calculate average confidence
    const receiptsWithConfidence = receipts.filter((r) => r.confidence != null)
    const avgConfidence = receiptsWithConfidence.length > 0
      ? Math.round(
          receiptsWithConfidence.reduce((sum, r) => sum + (r.confidence || 0), 0) /
            receiptsWithConfidence.length
        )
      : 0

    // Category breakdown
    const categoryMap = receipts.reduce((acc: any, r) => {
      const category = r.category || "Uncategorized"
      if (!acc[category]) {
        acc[category] = { count: 0, total: 0 }
      }
      acc[category].count++
      acc[category].total += r.total || 0
      return acc
    }, {})

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([category, data]: [string, any]) => ({
        category,
        amount: data.total,
        count: data.count,
        percentage: totalSpent > 0 ? Math.round((data.total / totalSpent) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    // Monthly spending (last 6 months)
    const now = new Date()
    const monthlySpending: { month: string; amount: number; count: number }[] = []
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })
      
      const monthReceipts = receipts.filter((r) => {
        if (!r.date && !r.createdAt) return false
        const receiptDate = new Date(r.date || r.createdAt)
        return (
          receiptDate.getMonth() === monthDate.getMonth() &&
          receiptDate.getFullYear() === monthDate.getFullYear()
        )
      })

      monthlySpending.push({
        month: monthStr,
        amount: monthReceipts.reduce((sum, r) => sum + (r.total || 0), 0),
        count: monthReceipts.length,
      })
    }

    // Top merchants
    const merchantMap = receipts.reduce((acc: any, r) => {
      const merchant = r.merchant || "Unknown"
      if (!acc[merchant]) {
        acc[merchant] = { count: 0, total: 0 }
      }
      acc[merchant].count++
      acc[merchant].total += r.total || 0
      return acc
    }, {})

    const topMerchants = Object.entries(merchantMap)
      .map(([merchant, data]: [string, any]) => ({
        merchant,
        amount: data.total,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    return NextResponse.json({
      totalSpent,
      receiptsProcessed: receipts.length,
      averageConfidence: avgConfidence,
      categoriesCount: Object.keys(categoryMap).length,
      statusCounts,
      categoryBreakdown,
      monthlySpending,
      topMerchants,
    })
  } catch (error) {
    console.error("Analytics API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}
