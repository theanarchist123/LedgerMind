/**
 * Receipt Quality Assurance & Flagging System
 * Detects suspicious entries, inconsistencies, and low confidence scores
 */

export interface QAIssue {
  type: "low_confidence" | "missing_data" | "suspicious_amount" | "date_mismatch" | "calculation_error" | "duplicate"
  severity: "critical" | "warning" | "info"
  field?: string
  message: string
  suggestion?: string
}

export interface QAResult {
  passed: boolean
  score: number // 0-100
  issues: QAIssue[]
  needsReview: boolean
  flags: string[]
}

/**
 * Run comprehensive QA checks on a receipt
 */
export async function runReceiptQA(receipt: {
  merchant?: string
  date?: string
  total?: number
  tax?: number
  lineItems?: Array<{ description: string; quantity: number; unitPrice: number; total: number }>
  confidence?: number | { merchant?: number; date?: number; total?: number; category?: number }
  ocrText?: string
}): Promise<QAResult> {
  const issues: QAIssue[] = []
  const flags: string[] = []

  // Extract confidence values
  const confidenceObj: any = typeof receipt.confidence === "number"
    ? { overall: receipt.confidence }
    : receipt.confidence || {}
  
  const merchantConf = confidenceObj.merchant || confidenceObj.overall || 0
  const totalConf = confidenceObj.total || confidenceObj.overall || 0
  const dateConf = confidenceObj.date || confidenceObj.overall || 0

  // 1. Check OCR confidence scores
  if (merchantConf < 0.5) {
    issues.push({
      type: "low_confidence",
      severity: "warning",
      field: "merchant",
      message: `Merchant name has low confidence (${(merchantConf * 100).toFixed(0)}%)`,
      suggestion: "Please verify the merchant name is correct",
    })
    flags.push("low_confidence_merchant")
  }

  if (totalConf < 0.6) {
    issues.push({
      type: "low_confidence",
      severity: "critical",
      field: "total",
      message: `Total amount has low confidence (${(totalConf * 100).toFixed(0)}%)`,
      suggestion: "Please verify the total amount",
    })
    flags.push("low_confidence_total")
  }

  if (dateConf < 0.5) {
    issues.push({
      type: "low_confidence",
      severity: "info",
      field: "date",
      message: `Date has low confidence (${(dateConf * 100).toFixed(0)}%)`,
      suggestion: "Please verify the date is correct",
    })
    flags.push("low_confidence_date")
  }

  // 2. Check for missing critical data
  if (!receipt.merchant || receipt.merchant === "Unknown Merchant") {
    issues.push({
      type: "missing_data",
      severity: "warning",
      field: "merchant",
      message: "Merchant name is missing or could not be extracted",
      suggestion: "Please enter the merchant name manually",
    })
    flags.push("missing_merchant")
  }

  if (!receipt.total || receipt.total === 0) {
    issues.push({
      type: "missing_data",
      severity: "critical",
      field: "total",
      message: "Total amount is missing or zero",
      suggestion: "Please enter the total amount manually",
    })
    flags.push("missing_total")
  }

  if (!receipt.date) {
    issues.push({
      type: "missing_data",
      severity: "info",
      field: "date",
      message: "Receipt date is missing",
      suggestion: "Please enter the date",
    })
    flags.push("missing_date")
  }

  // 3. Check for suspicious amounts
  if (receipt.total && receipt.total > 10000) {
    issues.push({
      type: "suspicious_amount",
      severity: "warning",
      field: "total",
      message: `Unusually large amount: $${receipt.total.toFixed(2)}`,
      suggestion: "Please verify this amount is correct",
    })
    flags.push("large_amount")
  }

  if (receipt.total && receipt.total < 0) {
    issues.push({
      type: "suspicious_amount",
      severity: "critical",
      field: "total",
      message: "Negative total amount detected",
      suggestion: "Please check the receipt image",
    })
    flags.push("negative_amount")
  }

  // 4. Check date validity
  if (receipt.date) {
    const receiptDate = new Date(receipt.date)
    const today = new Date()
    const futureLimit = new Date()
    futureLimit.setDate(futureLimit.getDate() + 1)
    
    const pastLimit = new Date()
    pastLimit.setFullYear(pastLimit.getFullYear() - 10)

    if (receiptDate > futureLimit) {
      issues.push({
        type: "date_mismatch",
        severity: "warning",
        field: "date",
        message: "Receipt date is in the future",
        suggestion: "Please verify the date",
      })
      flags.push("future_date")
    }

    if (receiptDate < pastLimit) {
      issues.push({
        type: "date_mismatch",
        severity: "info",
        field: "date",
        message: "Receipt is more than 10 years old",
        suggestion: "Please verify the date",
      })
      flags.push("very_old")
    }
  }

  // 5. Validate line items calculations
  if (receipt.lineItems && receipt.lineItems.length > 0) {
    let calculatedSubtotal = 0
    let hasCalculationErrors = false

    for (const item of receipt.lineItems) {
      // Check if line item total matches quantity * price
      const expectedTotal = item.quantity * item.unitPrice
      const diff = Math.abs(expectedTotal - item.total)
      
      if (diff > 0.02) { // Allow 2 cent rounding error
        issues.push({
          type: "calculation_error",
          severity: "warning",
          field: "lineItems",
          message: `Line item "${item.description}": ${item.quantity} × $${item.unitPrice.toFixed(2)} ≠ $${item.total.toFixed(2)}`,
          suggestion: "Check for rounding or calculation errors",
        })
        hasCalculationErrors = true
      }

      calculatedSubtotal += item.total
    }

    if (hasCalculationErrors) {
      flags.push("calculation_error")
    }

    // Check if subtotal + tax ≈ total
    if (receipt.total && receipt.tax !== undefined && receipt.tax !== null) {
      const expectedTotal = calculatedSubtotal + receipt.tax
      const diff = Math.abs(expectedTotal - receipt.total)
      
      if (diff > 0.50) { // Allow 50 cent difference for rounding/tips/fees
        issues.push({
          type: "calculation_error",
          severity: "warning",
          field: "total",
          message: `Subtotal ($${calculatedSubtotal.toFixed(2)}) + Tax ($${receipt.tax.toFixed(2)}) ≠ Total ($${receipt.total.toFixed(2)})`,
          suggestion: "There may be additional fees or discounts not captured",
        })
        flags.push("total_mismatch")
      }
    }
  }

  // 6. Check for empty or invalid line items
  if (receipt.lineItems && receipt.lineItems.length > 0) {
    const invalidItems = receipt.lineItems.filter(item => 
      !item.description || 
      item.description.length < 2 || 
      item.quantity <= 0 || 
      item.unitPrice < 0
    )

    if (invalidItems.length > 0) {
      issues.push({
        type: "missing_data",
        severity: "info",
        field: "lineItems",
        message: `${invalidItems.length} invalid line item(s) detected`,
        suggestion: "Some items may need manual correction",
      })
      flags.push("invalid_items")
    }
  }

  // 7. Calculate overall QA score (0-100)
  let score = 100
  
  // Deduct points for issues
  for (const issue of issues) {
    if (issue.severity === "critical") score -= 25
    else if (issue.severity === "warning") score -= 10
    else if (issue.severity === "info") score -= 5
  }
  
  score = Math.max(0, score)

  // Determine if needs review
  const needsReview = 
    score < 70 || 
    issues.some(i => i.severity === "critical") ||
    flags.includes("low_confidence_total") ||
    flags.includes("missing_total")

  return {
    passed: score >= 80 && !needsReview,
    score,
    issues,
    needsReview,
    flags,
  }
}

/**
 * Check for duplicate receipts
 */
export async function checkDuplicateReceipt(
  receipt: { merchant?: string; date?: string; total?: number },
  existingReceipts: Array<{ merchant?: string; date?: string; total?: number; receiptId: string }>
): Promise<{ isDuplicate: boolean; matchedReceipts: string[]; similarity: number }> {
  if (!receipt.merchant || !receipt.date || !receipt.total) {
    return { isDuplicate: false, matchedReceipts: [], similarity: 0 }
  }

  const matches: Array<{ receiptId: string; similarity: number }> = []

  for (const existing of existingReceipts) {
    if (!existing.merchant || !existing.date || !existing.total) continue

    let similarity = 0
    
    // Check merchant match (case-insensitive, fuzzy)
    const merchantMatch = existing.merchant.toLowerCase().includes(receipt.merchant.toLowerCase()) ||
                         receipt.merchant.toLowerCase().includes(existing.merchant.toLowerCase())
    if (merchantMatch) similarity += 40

    // Check date match (same day)
    if (existing.date === receipt.date) similarity += 30

    // Check total match (exact or within $0.10)
    const totalDiff = Math.abs(existing.total - receipt.total)
    if (totalDiff < 0.10) similarity += 30
    else if (totalDiff < 1.00) similarity += 15

    if (similarity >= 70) {
      matches.push({ receiptId: existing.receiptId, similarity })
    }
  }

  // Sort by highest similarity
  matches.sort((a, b) => b.similarity - a.similarity)

  return {
    isDuplicate: matches.length > 0,
    matchedReceipts: matches.map(m => m.receiptId),
    similarity: matches[0]?.similarity || 0,
  }
}

/**
 * Suggest improvements for low-quality receipts
 */
export function generateQASuggestions(qaResult: QAResult): string[] {
  const suggestions: string[] = []

  if (qaResult.needsReview) {
    suggestions.push("This receipt needs manual review before processing")
  }

  if (qaResult.flags.includes("low_confidence_total")) {
    suggestions.push("Try re-uploading with better lighting or higher resolution")
  }

  if (qaResult.flags.includes("missing_merchant")) {
    suggestions.push("Add the merchant name from the receipt image")
  }

  if (qaResult.flags.includes("calculation_error")) {
    suggestions.push("Verify the line item totals and tax calculations")
  }

  if (qaResult.flags.includes("large_amount")) {
    suggestions.push("Double-check this unusually large amount")
  }

  if (qaResult.score < 50) {
    suggestions.push("Consider re-uploading a clearer image of the receipt")
  }

  return suggestions
}
