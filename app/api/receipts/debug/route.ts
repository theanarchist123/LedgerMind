import { NextResponse } from "next/server"
import { getDb } from "@/lib/rag/db"

export const runtime = "nodejs"

/**
 * Debug endpoint to check MongoDB receipts
 */
export async function GET() {
  try {
    const db = await getDb()
    const receipts = db.collection("receipts")
    
    // Get all receipts (no filter)
    const allReceipts = await receipts.find({}).limit(10).toArray()
    
    // Get count by userId
    const demoUserCount = await receipts.countDocuments({ userId: "demo-user" })
    const allCount = await receipts.countDocuments({})
    
    return NextResponse.json({
      success: true,
      totalReceipts: allCount,
      demoUserReceipts: demoUserCount,
      sampleReceipts: allReceipts.map(r => ({
        _id: r._id,
        userId: r.userId,
        merchant: r.merchant,
        status: r.status,
        createdAt: r.createdAt,
        hasCreatedAt: !!r.createdAt,
      })),
    })
  } catch (error: any) {
    console.error("Debug endpoint error:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
