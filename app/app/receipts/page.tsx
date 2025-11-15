"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, Filter, ChevronLeft, ChevronRight, Eye, Edit, Trash, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "@/lib/auth-client"
import { QABadge } from "@/components/qa-badge"

interface Receipt {
  _id: string
  receiptId: string
  merchant: string
  date: string
  total: number
  category: string
  categoryConfidence?: number
  categoryMethod?: "learned" | "heuristic" | "llm"
  status: string
  qaScore?: number
  qaIssues?: Array<{
    type: string
    severity: string
    field?: string
    message: string
    suggestion?: string
  }>
  isDuplicate?: boolean
  createdAt: string
}

/**
 * Receipts list page with search, filters, and actions
 */
export default function ReceiptsPage() {
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 10

  // Fetch receipts from MongoDB
  useEffect(() => {
    async function fetchReceipts() {
      try {
        setLoading(true)
        const userId = session?.user?.id || "demo-user"
        console.log("Fetching receipts for userId:", userId)
        
        const response = await fetch(`/api/receipts/list?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          console.log("Fetched receipts:", data.count)
          setReceipts(data.receipts || [])
        }
      } catch (error) {
        console.error("Error fetching receipts:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchReceipts()
  }, [session])

  // Filter receipts based on search
  const filteredReceipts = receipts.filter((receipt) =>
    receipt.merchant.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedReceipts = filteredReceipts.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Receipts</h1>
          <p className="text-muted-foreground">
            Manage and track all your receipts
          </p>
        </div>
        <Button asChild>
          <Link href="/app/upload">Upload Receipt</Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by merchant..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Receipts ({filteredReceipts.length})</CardTitle>
          <CardDescription>
            Complete list of processed receipts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : paginatedReceipts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg font-medium">No receipts found</p>
              <p className="text-sm mt-2">Upload your first receipt to get started</p>
              <Button asChild className="mt-4">
                <Link href="/app/upload">Upload Receipt</Link>
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReceipts.map((receipt) => (
                    <TableRow key={receipt._id}>
                      <TableCell className="font-medium">
                        {receipt.merchant}
                      </TableCell>
                      <TableCell>{receipt.date}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{receipt.category}</Badge>
                          {receipt.categoryConfidence && receipt.categoryConfidence > 0 && (
                            <Badge
                              variant={
                                receipt.categoryMethod === "learned"
                                  ? "default"
                                  : receipt.categoryMethod === "heuristic"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs gap-1"
                            >
                              <Sparkles className="h-3 w-3" />
                              {Math.round(receipt.categoryConfidence * 100)}%
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <QABadge
                          score={receipt.qaScore}
                          issues={receipt.qaIssues}
                          needsReview={receipt.status === "needs_review"}
                          isDuplicate={receipt.isDuplicate}
                          compact
                        />
                      </TableCell>
                      <TableCell>
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
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${receipt.total.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/app/receipts/${receipt.receiptId}`} className="cursor-pointer">
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(startIndex + itemsPerPage, filteredReceipts.length)} of{" "}
                  {filteredReceipts.length} receipts
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
