export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/better-auth"
import { headers } from "next/headers"
import { getDb } from "@/lib/rag/db"
import { parseTransactionSMS } from "@/lib/sms/transaction-parser"
import { smsToReceipt } from "@/lib/sms/sms-to-receipt"
import { nanoid } from "nanoid"

/**
 * POST /api/transactions/sms
 * Create a single SMS transaction
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { smsBody, timestamp } = await req.json()

    if (!smsBody) {
      return NextResponse.json(
        { error: "SMS body is required" },
        { status: 400 }
      )
    }

    // Parse SMS into transaction
    const transaction = parseTransactionSMS(
      smsBody,
      new Date(timestamp || Date.now())
    )

    if (!transaction) {
      return NextResponse.json(
        {
          error: "Could not parse transaction from SMS",
          smsBody,
        },
        { status: 400 }
      )
    }

    // Convert to receipt format
    const receiptId = `r_${nanoid(12)}`
    const receipt = smsToReceipt(transaction, session.user.id, receiptId)

    // Save to database
    const db = await getDb()
    const receiptsCol = db.collection("receipts")

    // Check for duplicates (same merchant + amount + date)
    const duplicate = await receiptsCol.findOne({
      userId: session.user.id,
      merchant: receipt.merchant,
      total: receipt.total,
      date: receipt.date,
      source: "sms",
    })

    if (duplicate) {
      return NextResponse.json(
        {
          success: false,
          error: "Duplicate transaction detected",
          existingId: duplicate._id,
        },
        { status: 409 }
      )
    }

    await receiptsCol.insertOne(receipt as any)

    console.log(
      `[SMS Transaction] Created: ${transaction.merchant} - ₹${transaction.amount}`
    )

    return NextResponse.json({
      success: true,
      transaction,
      receiptId: receipt._id,
    })
  } catch (error) {
    console.error("[SMS Transaction] Error:", error)
    return NextResponse.json(
      { error: "Failed to process SMS transaction" },
      { status: 500 }
    )
  }
}
