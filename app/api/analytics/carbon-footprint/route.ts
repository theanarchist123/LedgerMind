export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { auth } from "@/lib/better-auth"
import { headers } from "next/headers"
import { analyzeCarbonFootprint } from "@/lib/rag/carbon-tracker"

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

    const analysis = await analyzeCarbonFootprint(session.user.id, period)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error("[carbon-footprint] Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze carbon footprint" },
      { status: 500 }
    )
  }
}
