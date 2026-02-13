export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/rag/db"
import { learnFromCorrection, RECEIPT_CATEGORIES } from "@/lib/rag/auto-categorizer"

/**
 * Update receipt category and learn from user correction
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { userId, category } = body

    if (!userId || !category) {
      return NextResponse.json(
        { error: "userId and category are required" },
        { status: 400 }
      )
    }

    // Validate category
    if (!RECEIPT_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${RECEIPT_CATEGORIES.join(", ")}` },
        { status: 400 }
      )
    }

    // Get the receipt first
    const db = await getDb()
    const receipts = db.collection("receipts")
    
    console.log(`[update-category] Looking for receipt: ${id}, userId: ${userId}`)
    const receipt = await receipts.findOne({ _id: id, userId } as any)
    
    if (!receipt) {
      console.log(`[update-category] Receipt not found: ${id}`)
      return NextResponse.json(
        { error: "Receipt not found" },
        { status: 404 }
      )
    }

    console.log(`[update-category] Found receipt, merchant: ${receipt.merchant}, old category: ${receipt.category}`)

    // Update the receipt category in database
    await receipts.updateOne(
      { _id: id, userId } as any,
      {
        $set: {
          category,
          updatedAt: new Date(),
        },
      }
    )

    console.log(`[update-category] Updated category to: ${category}`)

    // Learn from this correction
    const result = await learnFromCorrection({
      userId,
      receiptId: id,
      merchant: receipt.merchant,
      lineItems: receipt.lineItems || [],
      newCategory: category,
    })

    console.log(`[update-category] Learning result: ${result.message}`)

    return NextResponse.json({
      success: true,
      message: result.message,
      receipt: {
        id,
        category,
        merchant: receipt.merchant,
      },
    })
  } catch (error: any) {
    console.error("Update category error:", error)
    return NextResponse.json(
      { error: error.message || "Update failed" },
      { status: 500 }
    )
  }
}
