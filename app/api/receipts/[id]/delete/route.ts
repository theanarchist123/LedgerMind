import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/rag/db"

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const db = await getDb()
    const receipts = db.collection("receipts")
    const chunks = db.collection("receipt_chunks")

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const { id: receiptId } = await ctx.params

    // Delete receipt document
    // Stored receipts use string `_id` equal to `receiptId`
    const res = await receipts.deleteOne({ _id: receiptId, userId })

    // Also delete associated chunks
    await chunks.deleteMany({ receiptId, userId })

    if (res.deletedCount === 0) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 })
    }

    return NextResponse.json({ ok: true, receiptId })
  } catch (error) {
    console.error("Delete receipt error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
