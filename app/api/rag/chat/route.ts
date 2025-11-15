export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { queryReceipts } from "@/lib/rag/nl-query"

/**
 * POST /api/rag/chat - Chat with receipts using natural language
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, query } = body

    if (!userId || !query) {
      return NextResponse.json(
        { error: "userId and query are required" },
        { status: 400 }
      )
    }

    console.log(`[chat] User ${userId} query: "${query}"`)

    const result = await queryReceipts(userId, query)

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error("[chat] Error:", error)
    return NextResponse.json(
      { error: error.message || "Query failed" },
      { status: 500 }
    )
  }
}
