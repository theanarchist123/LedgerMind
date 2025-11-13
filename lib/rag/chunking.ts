import type { Chunk } from "./types"

/**
 * Simple chunker that splits text into meaningful sections
 */
export function simpleChunker(
  text: string,
  receiptId: string,
  userId: string
): Omit<Chunk, "embedding">[] {
  // Split by double newlines or specific receipt sections
  const chunks = text
    .split(/\n{2,}|(?=Total|Tax|Subtotal|Payment)/gi)
    .map((t) => t.trim())
    .filter((t) => t.length > 0)

  return chunks.map((t, i) => ({
    id: `${receiptId}::${i}`,
    receiptId,
    userId,
    page: 1,
    text: t,
    metadata: {
      section: i === 0 ? "header" : i === chunks.length - 1 ? "footer" : "body",
      index: i,
    },
  }))
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
