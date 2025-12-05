export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/rag/db"
import { auth } from "@/lib/better-auth"
import { headers } from "next/headers"

/**
 * Update receipt details (merchant, date, total, category, etc.)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { merchant, date, total, category, lineItems } = body

    const db = await getDb()
    const receipts = db.collection("receipts")

    // Find the receipt by receiptId or _id
    const receipt = await receipts.findOne({ 
      $or: [
        { receiptId: id },
        { _id: id as any }
      ],
      userId: session.user.id 
    })

    if (!receipt) {
      return NextResponse.json(
        { error: "Receipt not found" },
        { status: 404 }
      )
    }

    // Build update object with only provided fields
    const updateFields: any = {
      updatedAt: new Date(),
    }

    if (merchant !== undefined) updateFields.merchant = merchant
    if (date !== undefined) updateFields.date = date
    if (total !== undefined) updateFields.total = parseFloat(total)
    if (category !== undefined) updateFields.category = category
    if (lineItems !== undefined) updateFields.lineItems = lineItems

    // Update the receipt using the found receipt's _id
    await receipts.updateOne(
      { _id: receipt._id },
      { $set: updateFields }
    )

    console.log(`[update-receipt] Updated receipt ${receipt.receiptId}:`, updateFields)

    return NextResponse.json({
      success: true,
      message: "Receipt updated successfully",
      receipt: {
        ...receipt,
        ...updateFields,
      },
    })
  } catch (error) {
    console.error("[update-receipt] Error:", error)
    return NextResponse.json(
      { error: "Failed to update receipt" },
      { status: 500 }
    )
  }
}
