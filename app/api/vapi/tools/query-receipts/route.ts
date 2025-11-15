import { NextRequest, NextResponse } from "next/server"
import { queryReceipts } from "@/lib/rag/nl-query"
import { generateSpendingInsights } from "@/lib/rag/spending-insights"
import { getDb } from "@/lib/mongodb"

export const runtime = "nodejs"

/**
 * POST /api/vapi/tools/query-receipts
 * Tool endpoint for Vapi assistant to query receipt data
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    console.log("[Vapi Tool] Received request:", JSON.stringify(body, null, 2))

    // Extract parameters from Vapi's tool call format
    const message = body.message || {}
    const toolCallId = message.toolCallId || body.toolCallId
    const parameters = message.toolCallList?.[0]?.function?.arguments || body.parameters || {}
    
    const { query, userId, action } = parameters

    if (!query && !action) {
      return NextResponse.json({
        results: [{
          toolCallId,
          result: "Please provide a query or action parameter"
        }]
      })
    }

    // Default to a system userId if not provided (you may want to get from session)
    const effectiveUserId = userId || "system"

    let result: any

    // Handle different actions
    if (action === "get_insights") {
      // Get spending insights
      result = await generateSpendingInsights(effectiveUserId, "month")
      
      return NextResponse.json({
        results: [{
          toolCallId,
          result: `Here are your spending insights:\n\nTotal Spent: $${result.totalSpent.toFixed(2)}\nReceipts: ${result.receiptCount}\n\n${result.insights.map(i => `• ${i.title}: ${i.description}`).join('\n')}\n\nTop Category: ${result.topCategory || 'None'}\nNeeds Review: ${result.needsReviewCount} receipts`
        }]
      })
    }

    if (action === "get_receipts") {
      // Get all receipts summary
      const db = await getDb()
      const receipts = await db.collection("receipts")
        .find({ userId: effectiveUserId })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray()

      const summary = receipts.map(r => 
        `${r.merchant || 'Unknown'} - $${(r.total || 0).toFixed(2)} on ${r.date || 'N/A'} (${r.category || 'Uncategorized'})`
      ).join('\n')

      return NextResponse.json({
        results: [{
          toolCallId,
          result: `Your recent receipts:\n\n${summary}`
        }]
      })
    }

    // Default: Natural language query
    result = await queryReceipts(effectiveUserId, query)

    // Format response for Vapi
    let responseText = result.answer || "I couldn't find relevant information."

    // Add receipts information if available
    if (result.relevantReceipts && result.relevantReceipts.length > 0) {
      responseText += "\n\nRelevant receipts:\n"
      result.relevantReceipts.slice(0, 5).forEach((receipt: any) => {
        responseText += `\n• ${receipt.merchant} - $${receipt.total.toFixed(2)} on ${receipt.date} (${receipt.category})`
      })
    }

    return NextResponse.json({
      results: [{
        toolCallId,
        result: responseText
      }]
    })

  } catch (error: any) {
    console.error("[Vapi Tool] Error:", error)
    
    return NextResponse.json({
      results: [{
        toolCallId: "error",
        result: `I encountered an error: ${error.message || "Unknown error"}. Please try again.`
      }]
    }, { status: 500 })
  }
}
