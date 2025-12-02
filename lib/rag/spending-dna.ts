/**
 * Spending DNA Analyzer
 * Creates unique financial personality profiles
 */

import { getDb } from "./db"
import { generateText } from "./ai"
import type { ReceiptDoc } from "./types"

export type PersonalityType =
  | "The Planner"
  | "The Impulsive"
  | "The Minimalist"
  | "The Experience Seeker"
  | "The Balanced"
  | "The Stress Shopper"

export interface DNAStrand {
  trait: string
  value: number // 0-100
  description: string
  color: string
}

export interface SpendingDNA {
  personalityType: PersonalityType
  confidence: number
  dnaStrands: DNAStrand[]
  characteristics: string[]
  strengths: string[]
  weaknesses: string[]
  shareableCard: {
    type: PersonalityType
    tagline: string
    topTraits: string[]
  }
}

/**
 * Analyze user's spending to create personality profile
 */
export async function analyzeSpendingDNA(userId: string): Promise<SpendingDNA> {
  const db = await getDb()
  const receiptsCol = db.collection<ReceiptDoc>("receipts")

  const receipts = await receiptsCol
    .find({
      userId,
      status: { $in: ["completed", "needs_review"] },
    })
    .toArray()

  console.log(`[Spending DNA] Analyzing ${receipts.length} receipts`)

  // Calculate DNA strands (personality traits)
  const dnaStrands = calculateDNAStrands(receipts)

  // Determine personality type
  const personalityType = determinePersonalityType(dnaStrands)

  // Get characteristics
  const characteristics = getCharacteristics(personalityType)
  const { strengths, weaknesses } = getStrengthsWeaknesses(personalityType)

  // Create shareable card
  const shareableCard = {
    type: personalityType,
    tagline: getTagline(personalityType),
    topTraits: dnaStrands
      .sort((a, b) => b.value - a.value)
      .slice(0, 3)
      .map(s => s.trait),
  }

  return {
    personalityType,
    confidence: 0.85,
    dnaStrands,
    characteristics,
    strengths,
    weaknesses,
    shareableCard,
  }
}

function calculateDNAStrands(receipts: ReceiptDoc[]): DNAStrand[] {
  const totalSpent = receipts.reduce((sum, r) => sum + (r.total || 0), 0)
  const avgPerReceipt = receipts.length > 0 ? totalSpent / receipts.length : 0

  // Trait 1: Planning vs Spontaneity
  const smallFrequent = receipts.filter(r => (r.total || 0) < avgPerReceipt * 0.5).length
  const planningScore = Math.min((smallFrequent / receipts.length) * 100, 100)

  // Trait 2: Frugality
  const budgetPurchases = receipts.filter(r => (r.total || 0) < 30).length
  const frugalityScore = Math.min((budgetPurchases / receipts.length) * 120, 100)

  // Trait 3: Experience Seeking
  const experienceCategories = ["Entertainment", "Transportation", "Travel"]
  const experiencePurchases = receipts.filter(r =>
    experienceCategories.includes(r.category || "")
  )
  const experienceScore = Math.min((experiencePurchases.length / receipts.length) * 150, 100)

  // Trait 4: Consistency
  const dateGroups: Record<string, number> = {}
  for (const receipt of receipts) {
    const date = new Date(receipt.createdAt).toISOString().split("T")[0]
    dateGroups[date] = (dateGroups[date] || 0) + 1
  }
  const avgPerDay = Object.values(dateGroups).reduce((a, b) => a + b, 0) / Object.keys(dateGroups).length
  const variance = Object.values(dateGroups).reduce((sum, count) => sum + Math.pow(count - avgPerDay, 2), 0) / Object.keys(dateGroups).length
  const consistencyScore = Math.max(0, 100 - variance * 10)

  // Trait 5: Digital Adoption
  const onlineMerchants = ["amazon", "ebay", "etsy", "uber", "doordash"]
  const onlinePurchases = receipts.filter(r =>
    onlineMerchants.some(m => (r.merchant || "").toLowerCase().includes(m))
  )
  const digitalScore = Math.min((onlinePurchases.length / receipts.length) * 150, 100)

  // Trait 6: Indulgence
  const indulgenceCategories = ["Dining", "Entertainment", "Fashion", "Shopping"]
  const indulgencePurchases = receipts.filter(r =>
    indulgenceCategories.includes(r.category || "")
  )
  const indulgenceScore = Math.min((indulgencePurchases.length / receipts.length) * 120, 100)

  return [
    {
      trait: "Planning",
      value: Math.round(planningScore),
      description: planningScore > 60 ? "Careful planner" : "Spontaneous",
      color: "text-blue-500",
    },
    {
      trait: "Frugality",
      value: Math.round(frugalityScore),
      description: frugalityScore > 60 ? "Budget conscious" : "Value quality",
      color: "text-green-500",
    },
    {
      trait: "Experience Seeker",
      value: Math.round(experienceScore),
      description: experienceScore > 60 ? "Lives for experiences" : "Material focused",
      color: "text-purple-500",
    },
    {
      trait: "Consistency",
      value: Math.round(consistencyScore),
      description: consistencyScore > 60 ? "Routine spender" : "Variable patterns",
      color: "text-orange-500",
    },
    {
      trait: "Digital Adoption",
      value: Math.round(digitalScore),
      description: digitalScore > 60 ? "Digital native" : "Prefers in-store",
      color: "text-cyan-500",
    },
    {
      trait: "Indulgence",
      value: Math.round(indulgenceScore),
      description: indulgenceScore > 60 ? "Treats often" : "Necessity focused",
      color: "text-pink-500",
    },
  ]
}

function determinePersonalityType(strands: DNAStrand[]): PersonalityType {
  const scores = Object.fromEntries(strands.map(s => [s.trait, s.value]))

  // The Planner: High planning, high consistency
  if (scores["Planning"] > 70 && scores["Consistency"] > 70) {
    return "The Planner"
  }

  // The Impulsive: Low planning, high indulgence
  if (scores["Planning"] < 40 && scores["Indulgence"] > 60) {
    return "The Impulsive"
  }

  // The Minimalist: High frugality, low indulgence
  if (scores["Frugality"] > 70 && scores["Indulgence"] < 40) {
    return "The Minimalist"
  }

  // The Experience Seeker: High experience seeking
  if (scores["Experience Seeker"] > 70) {
    return "The Experience Seeker"
  }

  // The Stress Shopper: Low consistency, high indulgence
  if (scores["Consistency"] < 40 && scores["Indulgence"] > 60) {
    return "The Stress Shopper"
  }

  // Default: The Balanced
  return "The Balanced"
}

function getCharacteristics(type: PersonalityType): string[] {
  const characteristics: Record<PersonalityType, string[]> = {
    "The Planner": [
      "You budget meticulously and rarely make impulse purchases",
      "Spreadsheets are your best friend",
      "You research before every major purchase",
      "Future security is a top priority",
    ],
    "The Impulsive": [
      "You live in the moment and enjoy spontaneous purchases",
      "Shopping is a form of self-expression",
      "You trust your gut when buying",
      "Experiences matter more than savings",
    ],
    "The Minimalist": [
      "You believe less is more",
      "Every purchase must serve a clear purpose",
      "Quality over quantity is your mantra",
      "You find joy in simplicity",
    ],
    "The Experience Seeker": [
      "You'd rather spend on experiences than things",
      "Travel and dining are your top categories",
      "Memories are more valuable than possessions",
      "YOLO is your financial philosophy",
    ],
    "The Balanced": [
      "You maintain a healthy spending equilibrium",
      "You save but also enjoy treats",
      "Practical with occasional indulgences",
      "Financial wisdom with room for fun",
    ],
    "The Stress Shopper": [
      "Shopping is your emotional release",
      "Late-night purchases are common",
      "Spending patterns fluctuate with mood",
      "Retail therapy is real for you",
    ],
  }

  return characteristics[type]
}

function getStrengthsWeaknesses(
  type: PersonalityType
): { strengths: string[]; weaknesses: string[] } {
  const profiles: Record<PersonalityType, { strengths: string[]; weaknesses: string[] }> = {
    "The Planner": {
      strengths: ["Excellent at saving", "Low financial stress", "Achieves long-term goals"],
      weaknesses: ["May miss out on spontaneous joy", "Can be overly restrictive"],
    },
    "The Impulsive": {
      strengths: ["Lives fully in the moment", "Open to opportunities", "High life satisfaction"],
      weaknesses: ["Struggles with savings", "May experience buyer's remorse"],
    },
    "The Minimalist": {
      strengths: ["Low clutter", "High satisfaction per purchase", "Eco-conscious"],
      weaknesses: ["May deprive yourself unnecessarily", "Can seem rigid"],
    },
    "The Experience Seeker": {
      strengths: ["Rich life experiences", "Great memories", "Well-traveled"],
      weaknesses: ["Lower material assets", "Less emergency savings"],
    },
    "The Balanced": {
      strengths: ["Financial stability", "Life enjoyment", "Flexible approach"],
      weaknesses: ["May lack strong direction", "Could optimize further"],
    },
    "The Stress Shopper": {
      strengths: ["Finds emotional outlets", "Quick mood boosts"],
      weaknesses: ["Unhealthy coping mechanism", "Financial instability"],
    },
  }

  return profiles[type]
}

function getTagline(type: PersonalityType): string {
  const taglines: Record<PersonalityType, string> = {
    "The Planner": "Every dollar has a purpose 📊",
    "The Impulsive": "Life's too short for spreadsheets 🎉",
    "The Minimalist": "Less stuff, more life ✨",
    "The Experience Seeker": "Collect moments, not things 🌍",
    "The Balanced": "Best of both worlds ⚖️",
    "The Stress Shopper": "Shopping = therapy 💳",
  }

  return taglines[type]
}
