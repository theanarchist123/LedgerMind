import { getDb } from "./db"
import { generateText } from "./ai"

/**
 * Category training data stored per user
 */
interface CategoryTraining {
  _id: string // userId_merchant_hash
  userId: string
  merchant: string
  merchantNormalized: string
  lineItemsPattern: string // Simplified pattern of common items
  category: string
  confidence: number
  occurrences: number
  lastUsed: Date
  createdAt: Date
}

/**
 * Available categories for receipts
 */
export const RECEIPT_CATEGORIES = [
  "Food & Beverage",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Utilities",
  "Business",
  "Travel",
  "Groceries",
  "Other",
] as const

export type ReceiptCategory = typeof RECEIPT_CATEGORIES[number]

/**
 * Auto-categorize a receipt using hybrid approach:
 * 1. Check learned patterns from user corrections
 * 2. Use rule-based heuristics
 * 3. Fall back to LLM if confidence is low
 */
export async function autoCategorizeReceipt({
  userId,
  merchant,
  lineItems,
  total,
  ocrText,
}: {
  userId: string
  merchant: string
  lineItems: Array<{ description: string; total: number }>
  total: number
  ocrText?: string
}): Promise<{
  category: ReceiptCategory
  confidence: number
  method: "learned" | "heuristic" | "llm"
  suggestion?: string
}> {
  const db = await getDb()
  const trainingCol = db.collection<CategoryTraining>("category_training")

  // Step 1: Check learned patterns
  const merchantNorm = normalizeMerchant(merchant)
  const learned = await trainingCol.findOne({
    userId,
    merchantNormalized: merchantNorm,
  })

  if (learned && learned.confidence >= 0.8 && learned.occurrences >= 2) {
    console.log(`[Auto-Cat] Using learned pattern: ${learned.category} (${learned.confidence})`)
    return {
      category: learned.category as ReceiptCategory,
      confidence: learned.confidence,
      method: "learned",
      suggestion: `Based on ${learned.occurrences} previous receipts from ${merchant}`,
    }
  }

  // Step 2: Rule-based heuristics
  const heuristicResult = categorizeByHeuristics(merchant, lineItems)
  
  if (heuristicResult.confidence >= 0.7) {
    console.log(`[Auto-Cat] Using heuristic: ${heuristicResult.category} (${heuristicResult.confidence})`)
    return {
      ...heuristicResult,
      method: "heuristic",
    }
  }

  // Step 3: Use LLM for uncertain cases
  console.log(`[Auto-Cat] Low confidence (${heuristicResult.confidence}), using LLM...`)
  try {
    const llmCategory = await categorizWithLLM(merchant, lineItems, ocrText)
    
    return {
      category: llmCategory.category,
      confidence: llmCategory.confidence,
      method: "llm",
      suggestion: llmCategory.reasoning,
    }
  } catch (error) {
    console.warn("[Auto-Cat] LLM failed, using heuristic fallback:", error)
    return {
      ...heuristicResult,
      method: "heuristic",
    }
  }
}

/**
 * Learn from user category correction
 * Called when user manually changes a receipt's category
 */
export async function learnFromCorrection({
  userId,
  receiptId,
  merchant,
  lineItems,
  newCategory,
}: {
  userId: string
  receiptId: string
  merchant: string
  lineItems: Array<{ description: string; total: number }>
  newCategory: ReceiptCategory
}) {
  const db = await getDb()
  const trainingCol = db.collection<CategoryTraining>("category_training")

  const merchantNorm = normalizeMerchant(merchant)
  const lineItemsPattern = extractLineItemsPattern(lineItems)
  const trainingId = `${userId}_${merchantNorm}`

  // Update or create training entry
  const existing = await trainingCol.findOne({ _id: trainingId })

  if (existing) {
    // If user changed to same category, increase confidence
    // If changed to different category, replace with new one
    const isSameCategory = existing.category === newCategory
    
    await trainingCol.updateOne(
      { _id: trainingId },
      {
        $set: {
          category: newCategory,
          confidence: isSameCategory
            ? Math.min(0.99, existing.confidence + 0.15)
            : 0.75, // Reset confidence if category changed
          lineItemsPattern,
          lastUsed: new Date(),
        },
        $inc: {
          occurrences: 1,
        },
      }
    )
    
    console.log(`[Learn] Updated pattern for ${merchant} → ${newCategory}`)
  } else {
    // Create new training entry
    await trainingCol.insertOne({
      _id: trainingId,
      userId,
      merchant,
      merchantNormalized: merchantNorm,
      lineItemsPattern,
      category: newCategory,
      confidence: 0.75,
      occurrences: 1,
      lastUsed: new Date(),
      createdAt: new Date(),
    })
    
    console.log(`[Learn] Created new pattern for ${merchant} → ${newCategory}`)
  }

  // Also update the receipt itself
  const receipts = db.collection("receipts")
  await receipts.updateOne(
    { _id: receiptId, userId },
    {
      $set: {
        category: newCategory,
        categorySource: "user_corrected",
        updatedAt: new Date(),
      },
    }
  )

  return {
    success: true,
    message: `Learned: "${merchant}" → "${newCategory}"`,
  }
}

/**
 * Normalize merchant name for consistent matching
 */
function normalizeMerchant(merchant: string): string {
  return merchant
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove special chars
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim()
    .substring(0, 50) // Limit length
}

/**
 * Extract pattern from line items (simplified for matching)
 */
function extractLineItemsPattern(
  lineItems: Array<{ description: string; total: number }>
): string {
  if (!lineItems || lineItems.length === 0) return ""
  
  // Take first 3 items and normalize
  const pattern = lineItems
    .slice(0, 3)
    .map((item) =>
      item.description
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(" ")
        .slice(0, 3)
        .join(" ")
    )
    .join(" | ")

  return pattern.substring(0, 200)
}

/**
 * Rule-based categorization heuristics
 */
function categorizeByHeuristics(
  merchant: string,
  lineItems: Array<{ description: string; total: number }>
): {
  category: ReceiptCategory
  confidence: number
} {
  const m = merchant.toLowerCase()
  const itemsText = lineItems
    .map((i) => i.description.toLowerCase())
    .join(" ")

  // Food & Beverage
  if (
    /subway|mcdonalds|burger|pizza|restaurant|cafe|coffee|starbucks|dunkin|chipotle|taco|wendys|kfc|dominos/i.test(
      m
    ) ||
    /sandwich|burger|fries|drink|soda|coffee|tea|meal/i.test(itemsText)
  ) {
    return { category: "Food & Beverage", confidence: 0.85 }
  }

  // Groceries
  if (
    /walmart|target|kroger|safeway|whole foods|trader joe|aldi|costco|sams club|grocery|market|supermarket/i.test(
      m
    )
  ) {
    return { category: "Groceries", confidence: 0.8 }
  }

  // Transportation
  if (
    /uber|lyft|taxi|cab|transit|metro|bus|train|parking|shell|chevron|exxon|bp|gas|fuel/i.test(
      m
    )
  ) {
    return { category: "Transportation", confidence: 0.85 }
  }

  // Entertainment
  if (
    /cinema|movie|theater|netflix|spotify|gaming|amc|regal|imax|hulu|disney/i.test(
      m
    )
  ) {
    return { category: "Entertainment", confidence: 0.8 }
  }

  // Healthcare
  if (/pharmacy|cvs|walgreens|rite aid|clinic|hospital|doctor|medical|health/i.test(m)) {
    return { category: "Healthcare", confidence: 0.85 }
  }

  // Shopping
  if (/amazon|ebay|store|shop|mall|retail|bestbuy|macys|nordstrom/i.test(m)) {
    return { category: "Shopping", confidence: 0.7 }
  }

  // Travel
  if (/hotel|motel|airbnb|airline|flight|airport|booking|expedia|marriott|hilton/i.test(m)) {
    return { category: "Travel", confidence: 0.85 }
  }

  // Utilities
  if (/electric|water|gas|utility|internet|phone|verizon|att|tmobile|comcast/i.test(m)) {
    return { category: "Utilities", confidence: 0.85 }
  }

  // Default
  return { category: "Other", confidence: 0.3 }
}

/**
 * Use LLM to categorize when heuristics are uncertain
 */
async function categorizWithLLM(
  merchant: string,
  lineItems: Array<{ description: string; total: number }>,
  ocrText?: string
): Promise<{
  category: ReceiptCategory
  confidence: number
  reasoning: string
}> {
  const itemsList = lineItems
    .map((item, i) => `${i + 1}. ${item.description} - $${item.total}`)
    .join("\n")

  const prompt = `You are a receipt categorization expert. Categorize this receipt into exactly ONE category.

Available categories:
${RECEIPT_CATEGORIES.join(", ")}

Merchant: ${merchant}
Items purchased:
${itemsList || "No items listed"}

Respond with ONLY a JSON object in this exact format:
{
  "category": "Food & Beverage",
  "confidence": 0.85,
  "reasoning": "Brief explanation"
}

Rules:
- category must be ONE of the available categories listed above
- confidence is a number between 0 and 1
- reasoning should be one sentence explaining why`

  const response = await generateText(prompt)
  
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error("No JSON in response")
    
    const parsed = JSON.parse(jsonMatch[0])
    
    // Validate category
    if (!RECEIPT_CATEGORIES.includes(parsed.category)) {
      console.warn(`LLM returned invalid category: ${parsed.category}`)
      return {
        category: "Other",
        confidence: 0.5,
        reasoning: "LLM returned invalid category",
      }
    }

    return {
      category: parsed.category,
      confidence: Math.max(0.5, Math.min(0.95, parsed.confidence || 0.7)),
      reasoning: parsed.reasoning || "Categorized by AI",
    }
  } catch (error) {
    console.error("[LLM Cat] Failed to parse response:", error)
    return {
      category: "Other",
      confidence: 0.4,
      reasoning: "Failed to parse AI response",
    }
  }
}

/**
 * Get category suggestions for a merchant (for UI autocomplete)
 */
export async function getCategorySuggestions(
  userId: string,
  merchantPrefix: string
): Promise<Array<{ merchant: string; category: ReceiptCategory; confidence: number }>> {
  const db = await getDb()
  const trainingCol = db.collection<CategoryTraining>("category_training")

  const merchantNorm = normalizeMerchant(merchantPrefix)

  const suggestions = await trainingCol
    .find({
      userId,
      merchantNormalized: { $regex: `^${merchantNorm}`, $options: "i" },
    })
    .sort({ confidence: -1, occurrences: -1 })
    .limit(5)
    .toArray()

  return suggestions.map((s) => ({
    merchant: s.merchant,
    category: s.category as ReceiptCategory,
    confidence: s.confidence,
  }))
}
