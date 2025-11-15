/**
 * Natural Language Query System
 * Allows users to ask questions about their receipts using natural language
 */

import { getDb } from "./db"
import { embedTexts, generateText } from "./ai"
import { cosineSimilarity } from "./chunking"
import type { ReceiptDoc } from "./types"

export interface QueryResult {
  answer: string
  relevantReceipts: Array<{
    receiptId: string
    merchant: string
    date: string
    total: number
    category: string
    relevance: number
  }>
  queryType: "spending" | "merchant" | "category" | "date" | "item" | "general"
  confidence: number
}

/**
 * Process natural language query about receipts
 */
export async function queryReceipts(
  userId: string,
  query: string
): Promise<QueryResult> {
  const db = await getDb()
  const receiptsCol = db.collection<ReceiptDoc>("receipts")
  const chunksCol = db.collection("receipt_chunks")

  console.log(`[NLQuery] Processing: "${query}"`)

  // Detect query type
  const queryType = detectQueryType(query)
  console.log(`[NLQuery] Type: ${queryType}`)

  // Get relevant receipts based on query type
  let relevantReceipts: ReceiptDoc[] = []

  if (queryType === "spending" || queryType === "category") {
    // For spending questions, filter by category/merchant
    const category = extractCategory(query)
    const merchant = extractMerchant(query)
    const dateRange = extractDateRange(query)

    const filter: any = { userId, status: "completed" }
    if (category) filter.category = new RegExp(category, "i")
    if (merchant) filter.merchant = new RegExp(merchant, "i")
    if (dateRange) {
      filter.date = { $gte: dateRange.start, $lte: dateRange.end }
    }

    relevantReceipts = await receiptsCol.find(filter).limit(50).toArray()
  } else if (queryType === "merchant") {
    // Find by merchant name
    const merchant = extractMerchant(query)
    if (merchant) {
      relevantReceipts = await receiptsCol
        .find({ userId, merchant: new RegExp(merchant, "i"), status: "completed" })
        .limit(20)
        .toArray()
    }
  } else {
    // Use semantic search for complex queries
    const [queryEmbedding] = await embedTexts([query])
    const allChunks = await chunksCol
      .find({ userId })
      .limit(100)
      .toArray() as any[]

    // Rank chunks by similarity
    const rankedChunks = allChunks
      .map(chunk => ({
        ...chunk,
        similarity: cosineSimilarity(queryEmbedding, chunk.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)

    // Get unique receipts from top chunks
    const receiptIds = [...new Set(rankedChunks.map(c => c.receiptId))]
    relevantReceipts = await receiptsCol
      .find({ _id: { $in: receiptIds } })
      .toArray()
  }

  console.log(`[NLQuery] Found ${relevantReceipts.length} relevant receipts`)

  // Generate answer using LLM
  const answer = await generateAnswer(query, queryType, relevantReceipts)

  // Calculate relevance scores
  const receiptsSummary = relevantReceipts.slice(0, 10).map(r => ({
    receiptId: r._id,
    merchant: r.merchant || "Unknown",
    date: r.date || "",
    total: r.total || 0,
    category: r.category || "Other",
    relevance: 0.8, // Could be improved with more sophisticated ranking
  }))

  return {
    answer,
    relevantReceipts: receiptsSummary,
    queryType,
    confidence: relevantReceipts.length > 0 ? 0.85 : 0.5,
  }
}

/**
 * Detect the type of query
 */
function detectQueryType(query: string): QueryResult["queryType"] {
  const lower = query.toLowerCase()

  if (/(how much|total|spent|spending|cost)/i.test(lower)) {
    return "spending"
  }
  if (/(where|which store|which restaurant|from)/i.test(lower)) {
    return "merchant"
  }
  if (/(category|type of|kind of)/i.test(lower)) {
    return "category"
  }
  if (/(when|date|last|this month|this year)/i.test(lower)) {
    return "date"
  }
  if (/(item|product|bought|purchased)/i.test(lower)) {
    return "item"
  }

  return "general"
}

/**
 * Extract category from query
 */
function extractCategory(query: string): string | null {
  const lower = query.toLowerCase()
  const categories = [
    "food",
    "beverage",
    "transportation",
    "shopping",
    "entertainment",
    "healthcare",
    "utilities",
    "business",
    "travel",
    "groceries",
  ]

  for (const cat of categories) {
    if (lower.includes(cat)) {
      // Map to full category names
      if (cat === "food" || cat === "beverage") return "Food & Beverage"
      if (cat === "transportation") return "Transportation"
      if (cat === "shopping") return "Shopping"
      if (cat === "entertainment") return "Entertainment"
      if (cat === "healthcare") return "Healthcare"
      if (cat === "utilities") return "Utilities"
      if (cat === "business") return "Business"
      if (cat === "travel") return "Travel"
      if (cat === "groceries") return "Groceries"
    }
  }

  return null
}

/**
 * Extract merchant name from query
 */
function extractMerchant(query: string): string | null {
  // Common merchant patterns
  const patterns = [
    /at\s+([A-Z][a-zA-Z\s&]+)/,
    /from\s+([A-Z][a-zA-Z\s&]+)/,
    /(Subway|Uber|Starbucks|Amazon|Walmart|Target|McDonald's|Pizza|Coffee)/i,
  ]

  for (const pattern of patterns) {
    const match = query.match(pattern)
    if (match) return match[1].trim()
  }

  return null
}

/**
 * Extract date range from query
 */
function extractDateRange(query: string): { start: string; end: string } | null {
  const lower = query.toLowerCase()
  const today = new Date()
  
  // This month
  if (/this month/.test(lower)) {
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    }
  }

  // Last month
  if (/last month/.test(lower)) {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    const end = new Date(today.getFullYear(), today.getMonth(), 0)
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    }
  }

  // This year
  if (/this year/.test(lower)) {
    const start = new Date(today.getFullYear(), 0, 1)
    const end = today
    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    }
  }

  // Last 7/30/90 days
  const daysMatch = lower.match(/last\s+(\d+)\s+days?/)
  if (daysMatch) {
    const days = parseInt(daysMatch[1])
    const start = new Date(today)
    start.setDate(start.getDate() - days)
    return {
      start: start.toISOString().split("T")[0],
      end: today.toISOString().split("T")[0],
    }
  }

  return null
}

/**
 * Generate natural language answer using LLM
 */
async function generateAnswer(
  query: string,
  queryType: string,
  receipts: ReceiptDoc[]
): Promise<string> {
  if (receipts.length === 0) {
    return "I couldn't find any receipts matching your query. Try uploading more receipts or adjusting your search."
  }

  // Calculate aggregations for spending queries
  if (queryType === "spending") {
    const total = receipts.reduce((sum, r) => sum + (r.total || 0), 0)
    const count = receipts.length
    const categories = [...new Set(receipts.map(r => r.category))]
    const merchants = [...new Set(receipts.map(r => r.merchant))]

    // Create context summary
    const summary = `
Total Receipts: ${count}
Total Amount: $${total.toFixed(2)}
Categories: ${categories.join(", ")}
Top Merchants: ${merchants.slice(0, 5).join(", ")}

Recent Receipts:
${receipts.slice(0, 5).map(r => 
  `- ${r.merchant}: $${(r.total || 0).toFixed(2)} on ${r.date} (${r.category})`
).join("\n")}
`

    // Generate answer with LLM
    const prompt = `You are a financial assistant helping analyze receipt data.

User Question: "${query}"

Receipt Data:
${summary}

Provide a clear, concise answer (2-3 sentences) that directly answers the user's question. Include specific numbers and dates when relevant. Be friendly and helpful.`

    try {
      const answer = await generateText(prompt)
      return answer
    } catch (error) {
      console.error("[NLQuery] LLM generation failed:", error)
      // Fallback to simple summary
      return `You spent **$${total.toFixed(2)}** across **${count} receipts**. The main categories were ${categories.slice(0, 3).join(", ")}.`
    }
  }

  // For other query types, generate context-aware response
  const context = receipts.slice(0, 5).map(r => 
    `${r.merchant} - $${(r.total || 0).toFixed(2)} on ${r.date} (${r.category})`
  ).join("\n")

  const prompt = `You are a financial assistant. Answer this question based on the receipt data:

Question: "${query}"

Receipts:
${context}

Provide a helpful, specific answer in 2-3 sentences.`

  try {
    return await generateText(prompt)
  } catch (error) {
    console.error("[NLQuery] LLM generation failed:", error)
    return `I found ${receipts.length} receipts that might answer your question. Check the list below for details.`
  }
}
