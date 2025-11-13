export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { ragSearch } from "@/lib/rag/pipeline"
import { generateText } from "@/lib/rag/ai"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { query, userId = "demo-user", k = 5 } = body

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      )
    }

    // Search for relevant chunks
    const hits = await ragSearch({ userId, query, k })

    // Generate answer using the chunks as context
    const context = hits.map((h, i) => `[${i + 1}] ${h.text}`).join("\n\n")
    
    const prompt = `You are a helpful assistant analyzing receipt data. Answer the user's question based on the following receipt information.

Context from receipts:
${context}

User question: ${query}

Provide a clear, concise answer. If the information isn't in the context, say so.`

    const answer = await generateText(prompt)

    return NextResponse.json({
      answer,
      hits: hits.map((h) => ({
        text: h.text,
        score: h.score,
        receiptId: h.receiptId,
        metadata: h.metadata,
      })),
    })
  } catch (error: any) {
    console.error("RAG query error:", error)
    return NextResponse.json(
      { error: error.message || "Query failed" },
      { status: 500 }
    )
  }
}
