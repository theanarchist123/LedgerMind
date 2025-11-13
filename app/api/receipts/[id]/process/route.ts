export const runtime = "nodejs"

import { NextRequest, NextResponse } from "next/server"
import { nanoid } from "nanoid"
import { processReceipt } from "@/lib/rag/pipeline"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await req.formData()
    const file = formData.get("file") as File
    const userId = formData.get("userId") as string || "demo-user"

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Process the receipt
    const result = await processReceipt({
      receiptId: id,
      userId,
      fileBuffer: buffer,
      fileName: file.name,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Receipt processing error:", error)
    return NextResponse.json(
      { error: error.message || "Processing failed" },
      { status: 500 }
    )
  }
}
