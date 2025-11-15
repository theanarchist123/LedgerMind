import { NextRequest, NextResponse } from "next/server"
import { listReceipts } from "@/lib/rag/pipeline"

export const runtime = "nodejs"

/**
 * GET /api/receipts/list - List all receipts from MongoDB
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "demo-user"
    const limit = parseInt(searchParams.get("limit") || "100")
    
    console.log(`[receipts/list] Fetching receipts for userId: ${userId}, limit: ${limit}`)
    
    const receipts = await listReceipts(userId, limit)
    
    console.log(`[receipts/list] Found ${receipts.length} receipts`)
    
    return NextResponse.json({
      success: true,
      count: receipts.length,
      receipts: receipts.map((r) => {
        // Handle invalid or missing dates gracefully
        let displayDate = r.date
        if (!displayDate) {
          try {
            displayDate = r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          } catch {
            displayDate = new Date().toISOString().split('T')[0]
          }
        }
        
        return {
          _id: r._id,
          receiptId: r._id, // Use _id as receiptId for the frontend
          merchant: r.merchant || "Unknown Merchant",
          date: displayDate,
          total: r.total || 0,
          tax: r.tax || 0,
          category: r.category || "Other",
          categoryConfidence: r.categoryConfidence,
          categoryMethod: r.categoryMethod,
          categorySuggestion: r.categorySuggestion,
          status: r.status,
          currency: r.currency || "USD",
          confidence: r.confidence || 0,
          lineItems: r.lineItems,
          ocrText: r.ocrText,
          parsedData: r.parsedData,
          userId: r.userId,
          createdAt: r.createdAt || new Date(),
        }
      }),
    })
  } catch (error) {
    console.error("Error listing receipts:", error)
    return NextResponse.json(
      { success: false, error: "Failed to list receipts" },
      { status: 500 }
    )
  }
}
