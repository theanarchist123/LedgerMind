export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { auth } from "@/lib/better-auth"
import { headers } from "next/headers"
import { analyzeSpendingDNA } from "@/lib/rag/spending-dna"

// Map personality types to display info
const personalityInfo: Record<string, { emoji: string; color: string }> = {
  "The Planner": { emoji: "📊", color: "from-blue-500 to-cyan-500" },
  "The Impulsive": { emoji: "🎉", color: "from-orange-500 to-red-500" },
  "The Minimalist": { emoji: "✨", color: "from-gray-500 to-slate-600" },
  "The Experience Seeker": { emoji: "🌍", color: "from-purple-500 to-pink-500" },
  "The Balanced": { emoji: "⚖️", color: "from-green-500 to-teal-500" },
  "The Stress Shopper": { emoji: "💳", color: "from-red-500 to-pink-500" },
}

// Map trait names to icons
const traitIcons: Record<string, string> = {
  "Planning": "Target",
  "Frugality": "TrendingUp",
  "Experience Seeker": "Plane",
  "Consistency": "Zap",
  "Digital Adoption": "Sparkles",
  "Indulgence": "Heart",
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const analysis = await analyzeSpendingDNA(session.user.id)
    
    // Transform data to match frontend expectations
    const info = personalityInfo[analysis.personalityType] || { emoji: "🧬", color: "from-gray-500 to-gray-600" }
    
    const transformedData = {
      personalityType: {
        name: analysis.personalityType,
        tagline: analysis.shareableCard.tagline,
        emoji: info.emoji,
        color: info.color,
      },
      dnaStrands: analysis.dnaStrands.map(strand => ({
        trait: strand.trait,
        score: strand.value,
        icon: traitIcons[strand.trait] || "Sparkles",
        color: strand.color,
        description: strand.description,
      })),
      topCategories: [
        { category: "Based on your purchases", percentage: 100, icon: "ShoppingBag" }
      ],
      financialHabits: analysis.characteristics.slice(0, 4).map((char, idx) => ({
        habit: char.replace(/^You /, "").replace(/^you /, ""),
        positive: idx < 2,
      })),
      compatibleTypes: [
        { type: "The Balanced", compatibility: 82 },
        { type: "The Planner", compatibility: 75 },
        { type: "The Minimalist", compatibility: 60 },
      ],
      uniqueInsights: analysis.characteristics,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      shareCard: {
        type: analysis.personalityType,
        tagline: analysis.shareableCard.tagline,
        topTraits: analysis.shareableCard.topTraits,
        color: info.color.split(" ")[0].replace("from-", "").split("-")[0],
      },
    }

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error("[spending-dna] Error:", error)
    return NextResponse.json(
      { error: "Failed to analyze spending DNA" },
      { status: 500 }
    )
  }
}
