import { nanoid } from "nanoid"
import { getDb } from "./db"
import { ocrImage } from "./ocr"
import { parseReceiptWithAI, embedTexts } from "./ai"
import { simpleChunker, cosineSimilarity } from "./chunking"
import { autoCategorizeReceipt } from "./auto-categorizer"
import { runReceiptQA, checkDuplicateReceipt } from "./receipt-qa"
import { detectCurrency } from "@/lib/currency/detect"
import { convertToINR } from "@/lib/currency/convert"
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

    // Step 2.4: Detect currency from OCR and merchant hints
    console.log(`[${receiptId}] Detecting currency...`)
    const currencyDetection = await detectCurrency({
      merchant: parsed.merchant,
      ocrText,
      ipCountry: null,
    })
    console.log(`[${receiptId}] Detected currency: ${currencyDetection.currency} (${Math.round(currencyDetection.confidence * 100)}%); signals: ${currencyDetection.signals.join(', ')}`)

    // Step 2.5: Auto-categorize with AI
    console.log(`[${receiptId}] Auto-categorizing...`)
    const categorization = await autoCategorizeReceipt({
      userId,
      merchant: parsed.merchant,
      lineItems: parsed.lineItems || [],
      total: parsed.total,
      ocrText,
    })
    // Convert amount to INR only if not already INR
    let fxRateToINR = 1
    let totalINR = parsed.total || 0
    if (currencyDetection.currency && currencyDetection.currency.toUpperCase() !== 'INR') {
      console.log(`[${receiptId}] Converting ${currencyDetection.currency} ${parsed.total} to INR...`)
      const conversion = await convertToINR(parsed.total || 0, currencyDetection.currency)
      totalINR = conversion.inr ?? totalINR
      fxRateToINR = conversion.rate ?? 1
      console.log(`[${receiptId}] Conversion complete: ${currencyDetection.currency} ${parsed.total} = INR ${totalINR} (rate: ${fxRateToINR})`)
    } else {
      // Already INR, keep rate as 1 and total as-is
      fxRateToINR = 1
      totalINR = parsed.total || 0
    }
    console.log(`[${receiptId}] Running QA checks...`)
    const qaResult = await runReceiptQA({
      merchant: parsed.merchant,
      date: parsed.date,
      total: parsed.total,
      tax: parsed.tax,
      lineItems: parsed.lineItems,
      confidence: parsed.confidence,
      ocrText,
    })
    
    console.log(`[${receiptId}] QA Score: ${qaResult.score}/100, Issues: ${qaResult.issues.length}, Needs Review: ${qaResult.needsReview}`)
    
    // Check for duplicates
    const existingReceipts = await receipts.find({ userId }).toArray()
    const duplicateCheck = await checkDuplicateReceipt(
      { merchant: parsed.merchant, date: parsed.date, total: parsed.total },
      existingReceipts.map(r => ({ merchant: r.merchant, date: r.date, total: r.total, receiptId: r._id }))
    )
    
    if (duplicateCheck.isDuplicate) {
      console.log(`[${receiptId}] Possible duplicate detected (${duplicateCheck.similarity}% similar to ${duplicateCheck.matchedReceipts[0]})`)
    }

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
          // Currency detection and conversion
          currency: currencyDetection.currency,
          currencyConfidence: currencyDetection.confidence,
          currencySignals: currencyDetection.signals,
          totalINR: totalINR,
          fxRateToINR: fxRateToINR,
          // Rest of fields
          category: categorization.category,
          categoryConfidence: categorization.confidence,
          categoryMethod: categorization.method,
          categorySuggestion: categorization.suggestion,
          paymentMethod: parsed.paymentMethod,
          lineItems: parsed.lineItems || [],
          confidence: parsed.confidence,
          status: qaResult.needsReview ? "needs_review" : "completed",
          qaScore: qaResult.score,
          qaIssues: qaResult.issues,
          qaFlags: qaResult.flags,
          isDuplicate: duplicateCheck.isDuplicate,
          duplicateOf: duplicateCheck.isDuplicate ? duplicateCheck.matchedReceipts : [],
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
