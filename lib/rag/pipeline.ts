import { nanoid } from "nanoid"
import { getDb } from "./db"
import { ocrImage } from "./ocr"
import { parseReceiptWithAI, embedTexts } from "./ai"
import { simpleChunker, cosineSimilarity } from "./chunking"
import type { ReceiptDoc, Chunk, RerankedChunk } from "./types"

/**
 * Process a receipt: OCR → Parse → Chunk → Embed → Store
 */
export async function processReceipt({
  receiptId,
  userId,
  fileBuffer,
  fileName,
}: {
  receiptId: string
  userId: string
  fileBuffer: Buffer
  fileName: string
}) {
  const db = await getDb()
  const receipts = db.collection<ReceiptDoc>("receipts")
  const chunksCol = db.collection<Chunk>("receipt_chunks")

  try {
    // Mark as processing and ensure document exists with createdAt
    await receipts.updateOne(
      { _id: receiptId, userId },
      {
        $set: {
          status: "processing",
          updatedAt: new Date(),
          fileKey: fileName,
          originalName: fileName,
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    // Step 1: OCR
    console.log(`[${receiptId}] Running OCR...`)
    const { text: ocrText } = await ocrImage(fileBuffer)

    if (!ocrText || ocrText.length < 10) {
      throw new Error("OCR failed to extract text")
    }
    
    console.log(`[${receiptId}] OCR extracted ${ocrText.length} characters`)
    console.log(`[${receiptId}] OCR preview:`, ocrText.substring(0, 300))

    // Step 2: Parse with AI
    console.log(`[${receiptId}] Parsing with Gemini...`)
    const parsed = await parseReceiptWithAI(ocrText)
    
    console.log(`[${receiptId}] Parsed result:`, JSON.stringify({
      merchant: parsed.merchant,
      date: parsed.date,
      total: parsed.total,
      tax: parsed.tax,
      itemCount: parsed.lineItems?.length || 0,
      source: parsed.source
    }, null, 2))

    // Step 3: Chunk the text
    console.log(`[${receiptId}] Chunking text...`)
    const basicChunks = simpleChunker(ocrText, receiptId, userId)

    // Step 4: Embed chunks
    console.log(`[${receiptId}] Generating embeddings...`)
    const texts = basicChunks.map((c) => c.text)
    const embeddings = await embedTexts(texts)

    const chunks: Chunk[] = basicChunks.map((c, i) => ({
      ...c,
      embedding: embeddings[i] || [],
    }))

    // Step 5: Store everything
    console.log(`[${receiptId}] Storing to MongoDB...`)
    
    await receipts.updateOne(
      { _id: receiptId, userId },
      {
        $set: {
          ocrText,
          merchant: parsed.merchant,
          date: parsed.date,
          total: parsed.total,
          tax: parsed.tax,
          currency: parsed.currency || "USD",
          category: parsed.category,
          paymentMethod: parsed.paymentMethod,
          lineItems: parsed.lineItems || [],
          confidence: parsed.confidence,
          status: "completed",
          updatedAt: new Date(),
        },
      }
    )

    // Upsert chunks
    const chunkOps = chunks.map((c) => ({
      updateOne: {
        filter: { id: c.id },
        update: { $set: c },
        upsert: true,
      },
    }))

    if (chunkOps.length > 0) {
      await chunksCol.bulkWrite(chunkOps)
    }

    console.log(`[${receiptId}] Processing complete!`)

    return {
      receiptId,
      status: "completed",
      parsed,
      chunks: chunks.length,
    }
  } catch (error: any) {
    console.error(`[${receiptId}] Processing failed:`, error)

    await receipts.updateOne(
      { _id: receiptId, userId },
      {
        $set: {
          status: "failed",
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    throw error
  }
}

/**
 * Search receipts using semantic search
 */
export async function ragSearch({
  userId,
  query,
  k = 5,
}: {
  userId: string
  query: string
  k?: number
}): Promise<RerankedChunk[]> {
  const db = await getDb()
  const chunksCol = db.collection<Chunk>("receipt_chunks")

  try {
    // Embed the query
    const [queryEmbedding] = await embedTexts([query])

    // Get all chunks for user (limit for demo; use Atlas Vector Search in prod)
    const allChunks = await chunksCol
      .find({ userId })
      .limit(1000)
      .toArray()

    // Calculate similarity scores
    const scored: RerankedChunk[] = allChunks.map((chunk) => ({
      ...chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding),
    }))

    // Sort by score and return top k
    return scored.sort((a, b) => b.score - a.score).slice(0, k)
  } catch (error) {
    console.error("RAG search error:", error)
    return []
  }
}

/**
 * Get receipt by ID
 */
export async function getReceipt(receiptId: string, userId: string) {
  const db = await getDb()
  const receipts = db.collection<ReceiptDoc>("receipts")

  return receipts.findOne({ _id: receiptId, userId })
}

/**
 * List receipts for user
 */
export async function listReceipts(userId: string, limit = 50) {
  const db = await getDb()
  const receipts = db.collection<ReceiptDoc>("receipts")

  return receipts
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()
}
