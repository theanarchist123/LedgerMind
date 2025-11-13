export type ReceiptStatus = "uploaded" | "processing" | "completed" | "needs_review" | "failed"

export interface ReceiptDoc {
  _id: string
  userId: string
  fileKey: string
  originalName: string
  ocrText?: string
  merchant?: string
  date?: string
  total?: number
  tax?: number
  currency?: string
  category?: string
  paymentMethod?: string
  status: ReceiptStatus
  lineItems?: LineItem[]
  confidence?: {
    merchant?: number
    date?: number
    total?: number
    category?: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
  confidence?: number
}

export interface Chunk {
  id: string
  receiptId: string
  userId: string
  page?: number
  text: string
  metadata: Record<string, any>
  embedding: number[]
}

export interface RerankedChunk extends Chunk {
  score: number
}

export interface ParsedReceipt {
  merchant?: string
  date?: string
  total?: number
  tax?: number
  currency?: string
  category?: string
  paymentMethod?: string
  lineItems?: LineItem[]
  confidence?: {
    merchant?: number
    date?: number
    total?: number
    category?: number
  }
}
