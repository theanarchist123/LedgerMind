"use client"

import { useState } from "react"
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
import {
  getReceiptById,
  getLineItemsByReceiptId,
  getAIResultsByReceiptId,
} from "@/lib/mockData"

/**
 * Receipt detail page with editable fields and tabs
 */
export default function ReceiptDetailPage() {
  const params = useParams()
  const receiptId = params.id as string
  const receipt = getReceiptById(receiptId)
  const lineItems = getLineItemsByReceiptId(receiptId)
  const aiResults = getAIResultsByReceiptId(receiptId)

  const [editedReceipt, setEditedReceipt] = useState(receipt)

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
                    value={editedReceipt?.merchant || ""}
                    onChange={(e) =>
                      setEditedReceipt(
                        editedReceipt
                          ? { ...editedReceipt, merchant: e.target.value }
                          : undefined
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={editedReceipt?.date || ""}
                    onChange={(e) =>
                      setEditedReceipt(
                        editedReceipt
                          ? { ...editedReceipt, date: e.target.value }
                          : undefined
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total">Total Amount</Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    value={editedReceipt?.total || 0}
                    onChange={(e) =>
                      setEditedReceipt(
                        editedReceipt
                          ? { ...editedReceipt, total: parseFloat(e.target.value) }
                          : undefined
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={editedReceipt?.category || ""}
                    onChange={(e) =>
                      setEditedReceipt(
                        editedReceipt
                          ? { ...editedReceipt, category: e.target.value as any }
                          : undefined
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confidence">Confidence Score</Label>
                  <Input
                    id="confidence"
                    type="number"
                    value={editedReceipt?.confidence || 0}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Input
                    id="status"
                    value={editedReceipt?.status || ""}
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
              {lineItems.length > 0 ? (
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
                    {lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.description}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          ${item.total.toFixed(2)}
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
              {aiResults ? (
                <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Extracted Data</h4>
                      <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto">
                        {JSON.stringify(aiResults, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Raw Text</h4>
                      <pre className="text-sm bg-muted p-4 rounded-lg whitespace-pre-wrap">
                        {aiResults.rawText}
                      </pre>
                    </div>
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
        <Button className="gap-2">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
