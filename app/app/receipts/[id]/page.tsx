"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Save, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/lib/auth-client"
import { CategorySelector } from "@/components/category-selector"
import { QABadge } from "@/components/qa-badge"

interface Receipt {
  _id: string
  receiptId: string
  userId: string
  merchant: string
  date: string
  total: number
  category: string
  categoryConfidence?: number
  categoryMethod?: "learned" | "heuristic" | "llm"
  categorySuggestion?: string
  status: string
  confidence: number
  qaScore?: number
  qaIssues?: Array<{
    type: string
    severity: string
    field?: string
    message: string
    suggestion?: string
  }>
  qaFlags?: string[]
  isDuplicate?: boolean
  duplicateOf?: string[]
  ocrText?: string
  parsedData?: any
  lineItems?: any[]
  createdAt: string
}

/**
 * Receipt detail page with editable fields and tabs
 */
export default function ReceiptDetailPage() {
  const params = useParams()
  const receiptId = params.id as string
  const { data: session } = useSession()
  
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Fetch receipt from MongoDB
  useEffect(() => {
    async function fetchReceipt() {
      try {
        setLoading(true)
        const userId = session?.user?.id || "demo-user"
        
        const response = await fetch(`/api/receipts/list?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          const found = data.receipts?.find((r: Receipt) => r.receiptId === receiptId)
          setReceipt(found || null)
        }
      } catch (error) {
        console.error("Error fetching receipt:", error)
      } finally {
        setLoading(false)
      }
    }
    
    if (session) {
      fetchReceipt()
    }
  }, [receiptId, session])

  const handleCategoryChange = (newCategory: string) => {
    if (receipt) {
      setReceipt({ ...receipt, category: newCategory })
    }
  }

  const handleSave = async () => {
    if (!receipt) return
    
    try {
      setSaving(true)
      // Add save logic here
      console.log("Saving receipt:", receipt)
    } catch (error) {
      console.error("Error saving receipt:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Receipt Not Found</CardTitle>
            <CardDescription>
              The receipt you're looking for doesn't exist.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/app/receipts">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Receipts
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/receipts">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Receipt Details
            </h1>
            <p className="text-muted-foreground">{receipt.merchant}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <QABadge
            score={receipt.qaScore}
            issues={receipt.qaIssues}
            needsReview={receipt.status === "needs_review"}
            isDuplicate={receipt.isDuplicate}
          />
          <Badge
            variant={
              receipt.status === "completed"
                ? "default"
                : receipt.status === "needs_review"
                ? "secondary"
                : "outline"
            }
          >
            {receipt.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="line-items">Line Items</TabsTrigger>
          <TabsTrigger value="ai-results">AI Results</TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receipt Information</CardTitle>
              <CardDescription>
                Edit receipt details and categorization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="merchant">Merchant</Label>
                  <Input
                    id="merchant"
                    value={receipt.merchant}
                    onChange={(e) =>
                      setReceipt({ ...receipt, merchant: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={receipt.date}
                    onChange={(e) =>
                      setReceipt({ ...receipt, date: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total">Total Amount</Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    value={receipt.total}
                    onChange={(e) =>
                      setReceipt({ ...receipt, total: parseFloat(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <CategorySelector
                    receiptId={receipt.receiptId}
                    userId={receipt.userId}
                    currentCategory={receipt.category}
                    confidence={receipt.categoryConfidence}
                    method={receipt.categoryMethod}
                    suggestion={receipt.categorySuggestion}
                    onCategoryChange={handleCategoryChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confidence">OCR Confidence Score</Label>
                  <Input
                    id="confidence"
                    type="number"
                    value={(receipt.confidence * 100).toFixed(0)}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    value={receipt.status}
                    disabled
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Line Items Tab */}
        <TabsContent value="line-items" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Line Items</CardTitle>
                  <CardDescription>
                    Individual items from this receipt
                  </CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Line Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {receipt.lineItems && receipt.lineItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipt.lineItems?.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">
                          {item.description || item.name || "Unknown Item"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity || 1}
                        </TableCell>
                        <TableCell className="text-right">
                          ${(item.unitPrice || item.price || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${(item.total || ((item.quantity || 1) * (item.unitPrice || item.price || 0))).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No line items available for this receipt
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Results Tab */}
        <TabsContent value="ai-results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis Results</CardTitle>
              <CardDescription>
                Raw AI extraction data from receipt image
              </CardDescription>
            </CardHeader>
            <CardContent>
              {receipt.ocrText || receipt.parsedData ? (
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    {receipt.parsedData && (
                      <div>
                        <h4 className="font-semibold mb-2">Extracted Data</h4>
                        <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                          {JSON.stringify(receipt.parsedData, null, 2)}
                        </pre>
                      </div>
                    )}
                    {receipt.ocrText && (
                      <div>
                        <h4 className="font-semibold mb-2">Raw OCR Text</h4>
                        <pre className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">
                          {receipt.ocrText}
                        </pre>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No AI analysis results available for this receipt
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sticky Bottom Actions */}
      <div className="sticky bottom-0 bg-background border-t p-4 flex justify-end gap-2">
        <Button variant="outline" asChild>
          <Link href="/app/receipts">Cancel</Link>
        </Button>
        <Button className="gap-2" onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
