export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/better-auth"
import { headers } from "next/headers"
import { getDb } from "@/lib/rag/db"
import { parseTransactionSMS } from "@/lib/sms/transaction-parser"
import { smsToReceipt } from "@/lib/sms/sms-to-receipt"
import { nanoid } from "nanoid"

/**
 * POST /api/transactions/sms/sync
 * Bulk import historical SMS transactions
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      )
    }

    const db = await getDb()
    const receiptsCol = db.collection("receipts")

    const results = {
      total: messages.length,
      imported: 0,
      duplicates: 0,
      failed: 0,
      errors: [] as string[],
    }

    // Process each message
    for (const msg of messages) {
      try {
        // Parse SMS into transaction
        const transaction = parseTransactionSMS(
          msg.body,
          new Date(msg.date || Date.now())
        )

        if (!transaction) {
          results.failed++
          continue
        }

        // Check for duplicates first
        const duplicate = await receiptsCol.findOne({
          userId: session.user.id,
          merchant: transaction.merchant,
          total: transaction.amount,
          date: transaction.date,
          source: "sms",
        })

        if (duplicate) {
          results.duplicates++
          continue
        }

        // Convert to receipt format and insert
        const receiptId = `r_${nanoid(12)}`
        const receipt = smsToReceipt(transaction, session.user.id, receiptId)

        await receiptsCol.insertOne(receipt as any)
        results.imported++

        console.log(
          `[SMS Sync] Imported: ${transaction.merchant} - ₹${transaction.amount}`
        )
      } catch (error: any) {
        results.failed++
        results.errors.push(error.message || "Unknown error")
      }
    }

    console.log(`[SMS Sync] Complete: ${results.imported}/${results.total} imported`)

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("[SMS Sync] Error:", error)
    return NextResponse.json(
      { error: "Failed to sync SMS transactions" },
      { status: 500 }
    )
  }
}
