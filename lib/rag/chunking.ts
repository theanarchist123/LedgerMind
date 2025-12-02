import type { Chunk } from "./types"

/**
 * Optimized chunker - creates fewer, more meaningful chunks
 * This reduces embedding API calls while maintaining search quality
 */
export function simpleChunker(
  text: string,
  receiptId: string,
  userId: string
): Omit<Chunk, "embedding">[] {
  // For receipts, we typically only need 1-2 chunks:
  // - The full text as one chunk (best for semantic search)
  // - Optionally split very long receipts (>2000 chars)
  
  const MAX_CHUNK_SIZE = 2000
  const chunks: Omit<Chunk, "embedding">[] = []
  
  if (text.length <= MAX_CHUNK_SIZE) {
    // Single chunk for most receipts (faster embedding)
    chunks.push({
      id: `${receiptId}::0`,
      receiptId,
      userId,
      page: 1,
      text: text.trim(),
      metadata: {
        section: "full",
        index: 0,
      },
    })
  } else {
    // Split longer receipts into 2 chunks: header+items, totals+footer
    const midpoint = Math.floor(text.length / 2)
    const splitPoint = text.indexOf('\n', midpoint) || midpoint
    
    chunks.push({
      id: `${receiptId}::0`,
      receiptId,
      userId,
      page: 1,
      text: text.slice(0, splitPoint).trim(),
      metadata: {
        section: "header",
        index: 0,
      },
    })
    
    chunks.push({
      id: `${receiptId}::1`,
      receiptId,
      userId,
      page: 1,
      text: text.slice(splitPoint).trim(),
      metadata: {
        section: "footer",
        index: 1,
      },
    })
  }
  
  return chunks
}

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = dot(a, b)
  const normA = norm(a)
  const normB = norm(b)
  
  if (normA === 0 || normB === 0) return 0
  
  return dotProduct / (normA * normB)
}

function dot(a: number[], b: number[]): number {
  let sum = 0
  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    sum += a[i] * b[i]
  }
  return sum
}

function norm(a: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * a[i]
  }
  return Math.sqrt(sum)
}
