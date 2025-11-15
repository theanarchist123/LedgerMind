"use client"

import { useState } from "react"
import { Check, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const CATEGORIES = [
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

interface CategorySelectorProps {
  receiptId: string
  userId: string
  currentCategory: string
  confidence?: number
  method?: "learned" | "heuristic" | "llm"
  suggestion?: string
  onCategoryChange?: (newCategory: string) => void
}

export function CategorySelector({
  receiptId,
  userId,
  currentCategory,
  confidence,
  method,
  suggestion,
  onCategoryChange,
}: CategorySelectorProps) {
  const [category, setCategory] = useState(currentCategory)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleChange = async (newCategory: string) => {
    if (newCategory === category) return

    setCategory(newCategory)
    setSaving(true)
    setSaved(false)

    try {
      console.log(`[CategorySelector] Updating category for receipt ${receiptId} to ${newCategory}`)
      const response = await fetch(`/api/receipts/${receiptId}/update-category`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          category: newCategory,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`[CategorySelector] API error:`, errorData)
        throw new Error(errorData.error || "Failed to update category")
      }

      const result = await response.json()
      console.log(`[CategorySelector] Success:`, result.message)

      setSaved(true)
      onCategoryChange?.(newCategory)

      // Show success briefly
      setTimeout(() => setSaved(false), 2000)
    } catch (err: any) {
      console.error("[CategorySelector] Failed to update category:", err)
      alert(err.message || "Failed to update category. Please try again.")
      setCategory(currentCategory) // Revert on error
    } finally {
      setSaving(false)
    }
  }

  const confidencePercent = confidence ? Math.round(confidence * 100) : null
  const showAIBadge = method && confidencePercent !== null

  return (
    <div className="flex items-center gap-2">
      <Select value={category} onValueChange={handleChange} disabled={saving}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showAIBadge && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant={
                  method === "learned"
                    ? "default"
                    : method === "heuristic"
                    ? "secondary"
                    : "outline"
                }
                className="cursor-help"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                AI · {confidencePercent}%
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">
                  {method === "learned"
                    ? "🎯 Learned from your edits"
                    : method === "heuristic"
                    ? "📋 Rule-based"
                    : "🤖 AI categorized"}
                </p>
                {suggestion && (
                  <p className="text-xs text-muted-foreground">{suggestion}</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {saved && (
        <Badge variant="default" className="animate-in fade-in">
          <Check className="h-3 w-3 mr-1" />
          Learned!
        </Badge>
      )}
    </div>
  )
}
