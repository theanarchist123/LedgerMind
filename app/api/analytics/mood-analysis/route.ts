export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { auth } from "@/lib/better-auth"
import { headers } from "next/headers"
import { analyzeMoodPatterns } from "@/lib/rag/mood-analysis"

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = (searchParams.get("period") || "month") as "week" | "month" | "year"

    const analysis = await analyzeMoodPatterns(session.user.id, period)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("[mood-analysis] Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze mood patterns" },
      { status: 500 }
    )
  }
}
