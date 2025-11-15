"use client"

import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface QABadgeProps {
  score?: number
  issues?: Array<{
    type: string
    severity: string
    field?: string
    message: string
    suggestion?: string
  }>
  needsReview?: boolean
  isDuplicate?: boolean
  compact?: boolean
}

export function QABadge({ score, issues = [], needsReview, isDuplicate, compact = false }: QABadgeProps) {
  if (score === undefined && !needsReview && !isDuplicate) return null

  const criticalIssues = issues.filter(i => i.severity === "critical")
  const warningIssues = issues.filter(i => i.severity === "warning")
  const infoIssues = issues.filter(i => i.severity === "info")

  const getVariant = () => {
    if (isDuplicate) return "outline"
    if (criticalIssues.length > 0 || needsReview) return "destructive"
    if (warningIssues.length > 0) return "secondary"
    if (score !== undefined && score >= 80) return "default"
    return "secondary"
  }

  const getIcon = () => {
    if (isDuplicate) return <AlertCircle className="h-3 w-3" />
    if (criticalIssues.length > 0) return <AlertCircle className="h-3 w-3" />
    if (warningIssues.length > 0) return <AlertTriangle className="h-3 w-3" />
    if (score !== undefined && score >= 80) return <CheckCircle className="h-3 w-3" />
    return <Info className="h-3 w-3" />
  }

  const getLabel = () => {
    if (compact) {
      if (isDuplicate) return "Duplicate"
      if (needsReview) return "Review"
      if (score !== undefined) return `${score}%`
      return "QA"
    }

    if (isDuplicate) return "Possible Duplicate"
    if (needsReview) return "Needs Review"
    if (score !== undefined && score >= 90) return "Excellent"
    if (score !== undefined && score >= 80) return "Good"
    if (score !== undefined && score >= 70) return "Fair"
    if (score !== undefined) return "Poor"
    return "QA Check"
  }

  const getTooltipContent = () => {
    return (
      <div className="space-y-2 max-w-xs">
        {score !== undefined && (
          <div className="font-semibold">QA Score: {score}/100</div>
        )}
        
        {isDuplicate && (
          <div className="text-xs text-yellow-400">
            ⚠️ This may be a duplicate receipt
          </div>
        )}

        {criticalIssues.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-red-400">Critical Issues:</div>
            {criticalIssues.map((issue, idx) => (
              <div key={idx} className="text-xs">
                • {issue.message}
              </div>
            ))}
          </div>
        )}

        {warningIssues.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-yellow-400">Warnings:</div>
            {warningIssues.slice(0, 3).map((issue, idx) => (
              <div key={idx} className="text-xs">
                • {issue.message}
              </div>
            ))}
            {warningIssues.length > 3 && (
              <div className="text-xs text-muted-foreground">
                +{warningIssues.length - 3} more
              </div>
            )}
          </div>
        )}

        {infoIssues.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-blue-400">Info:</div>
            {infoIssues.slice(0, 2).map((issue, idx) => (
              <div key={idx} className="text-xs">
                • {issue.message}
              </div>
            ))}
          </div>
        )}

        {issues.length === 0 && !isDuplicate && score && score >= 80 && (
          <div className="text-xs text-green-400">
            ✓ All checks passed
          </div>
        )}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getVariant()} className="gap-1 cursor-help">
            {getIcon()}
            {getLabel()}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {getTooltipContent()}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
