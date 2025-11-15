import React from "react"

interface SafeTextProps {
  value: any
  className?: string
}

/**
 * SafeText - Defensive component that prevents "Objects are not valid as a React child" errors
 * by converting any non-primitive value to a safe string representation
 */
export function SafeText({ value, className = "" }: SafeTextProps) {
  // Handle null/undefined
  if (value == null) {
    return <span className={className}></span>
  }

  // Handle primitives (safe to render directly)
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return <span className={className}>{value}</span>
  }

  // Handle objects that look like receipt summaries
  if (typeof value === "object") {
    try {
      // Check if it's a receipt-like object {merchant, date, total, category}
      if (value.merchant !== undefined && value.total !== undefined) {
        const merchant = String(value.merchant || "Unknown")
        const total = typeof value.total === "number" ? value.total.toFixed(2) : String(value.total || "0.00")
        const category = value.category ? ` • ${String(value.category)}` : ""
        const date = value.date ? ` • ${String(value.date)}` : ""
        return <span className={className}>{`${merchant} - $${total}${category}${date}`}</span>
      }

      // Check if it's a Date object
      if (value instanceof Date) {
        return <span className={className}>{value.toLocaleDateString()}</span>
      }

      // Fallback: stringify the object
      return <span className={className}>{JSON.stringify(value)}</span>
    } catch (err) {
      console.warn("[SafeText] Failed to convert object:", err)
      return <span className={className}>[invalid]</span>
    }
  }

  // Ultimate fallback
  return <span className={className}>{String(value)}</span>
}
