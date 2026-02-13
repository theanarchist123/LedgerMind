import type { SMSTransaction } from "./transaction-parser"
import type { ReceiptDoc } from "@/lib/rag/types"

/**
 * Convert SMS transaction to ReceiptDoc format for database storage
 * This allows SMS transactions to work with all existing analytics
 */
export function smsToReceipt(
  transaction: SMSTransaction,
  userId: string,
  receiptId: string
): Partial<ReceiptDoc> {
  return {
    _id: receiptId,
    userId,
    fileKey: `sms/${transaction.transactionId}`, // Virtual file key
    originalName: `SMS-${transaction.merchant}-${transaction.date}.txt`,
    ocrText: transaction.rawMessage, // Store original SMS
    merchant: transaction.merchant,
    date: transaction.date,
    total: transaction.amount,
    totalINR: transaction.amount, // Already in INR
    currency: "INR",
    currencyConfidence: 1.0,
    fxRateToINR: 1.0,
    category: transaction.category || "Other",
    categoryConfidence: 0.85,
    categoryMethod: "heuristic",
    paymentMethod: "UPI",
    status: "completed",
    confidence: 0.95, // High confidence from structured SMS data
    lineItems: [],
    source: "sms",
    transactionId: transaction.transactionId,
    rawSMS: transaction.rawMessage,
    qaScore: 95,
    qaFlags: [],
    isDuplicate: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
}

/**
 * Check if two transactions are duplicates (same merchant, amount, and date)
 */
export function isDuplicateTransaction(
  t1: Partial<ReceiptDoc>,
  t2: Partial<ReceiptDoc>
): boolean {
  return (
    t1.merchant === t2.merchant &&
    t1.total === t2.total &&
    t1.date === t2.date &&
    t1.source === "sms" &&
    t2.source === "sms"
  )
}
