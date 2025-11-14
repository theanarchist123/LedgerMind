"use client"

import { useEffect, useState } from "react"
import { useSession } from "@/lib/auth-client"
import { Download, FileText, Calendar, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { exportToCSV, exportToPDF, exportTaxReport } from "@/lib/export-utils"

interface ReceiptItem {
  _id: string
  merchant: string
  date: string
  total: number
  tax?: number
  category?: string
  confidence?: number
  items?: Array<{ name: string; price: number }>
  createdAt: string
}

interface Analytics {
  totalSpent: number
  receiptsProcessed: number
  averageConfidence: number
  categoriesCount: number
  statusCounts: Record<string, number>
  categoryBreakdown: Array<{
    category: string
    amount: number
    count: number
    percentage: number
  }>
  monthlySpending: Array<{
    month: string
    amount: number
    count: number
  }>
  topMerchants: Array<{
    merchant: string
    amount: number
    count: number
  }>
}

/**
 * Reports page with date filters and export options - Fully Functional
 */
export default function ReportsPage() {
  const { data: session } = useSession()
  const [receipts, setReceipts] = useState<ReceiptItem[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<string | null>(null)
  
  // Filter states
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")

  useEffect(() => {
    if (session?.user?.id) {
      fetchReportData()
    }
  }, [session?.user?.id])

  async function fetchReportData() {
    try {
      setLoading(true)
      
      // Fetch all receipts
      const receiptsRes = await fetch(`/api/receipts/list?userId=${session?.user?.id}`)
      if (receiptsRes.ok) {
        const data = await receiptsRes.json()
        setReceipts(data.receipts || [])
      }

      // Fetch analytics
      const analyticsRes = await fetch("/api/analytics")
      if (analyticsRes.ok) {
        const data = await analyticsRes.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Failed to fetch report data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter receipts based on date range and category
  const filteredReceipts = receipts.filter(receipt => {
    const receiptDate = new Date(receipt.date || receipt.createdAt)
    const start = startDate ? new Date(startDate) : null
    const end = endDate ? new Date(endDate) : null

    const dateMatch = 
      (!start || receiptDate >= start) &&
      (!end || receiptDate <= end)

    const categoryMatch = 
      !categoryFilter || 
      receipt.category?.toLowerCase().includes(categoryFilter.toLowerCase())

    return dateMatch && categoryMatch
  })

  // Calculate filtered analytics
  const filteredAnalytics = {
    totalSpent: filteredReceipts.reduce((sum, r) => sum + (r.total || 0), 0),
    receiptsProcessed: filteredReceipts.length,
    averageConfidence: filteredReceipts.length > 0
      ? Math.round(filteredReceipts.reduce((sum, r) => sum + (r.confidence || 0), 0) / filteredReceipts.length)
      : 0,
    categoriesCount: new Set(filteredReceipts.map(r => r.category).filter(Boolean)).size,
    categoryBreakdown: analytics?.categoryBreakdown || []
  }

  function handleExportCSV() {
    setExporting('csv')
    exportToCSV(filteredReceipts, `ledgermind-receipts-${new Date().toISOString().split('T')[0]}.csv`)
    setTimeout(() => setExporting(null), 1000)
  }

  function handleExportPDF() {
    if (!analytics) return
    setExporting('pdf')
    exportToPDF(filteredReceipts, filteredAnalytics as Analytics, `ledgermind-report-${new Date().toISOString().split('T')[0]}.pdf`)
    setTimeout(() => setExporting(null), 1000)
  }

  function handleExportTaxReport() {
    if (!analytics) return
    setExporting('tax')
    exportTaxReport(filteredReceipts, analytics, `ledgermind-tax-report-${new Date().getFullYear()}.pdf`)
    setTimeout(() => setExporting(null), 1000)
  }

  function handleApplyFilters() {
    // Filters are applied automatically via filteredReceipts
    console.log("Filters applied:", { startDate, endDate, categoryFilter })
  }

  function handleResetFilters() {
    setStartDate("")
    setEndDate("")
    setCategoryFilter("")
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and export receipt reports
        </p>
      </motion.div>

      {/* Date Range Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>
              Select date range and category to filter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category Filter</Label>
                <Input
                  id="category"
                  placeholder="All Categories"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleApplyFilters}>
                <Calendar className="mr-2 h-4 w-4" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleResetFilters}>Reset</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-green-200">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Monthly Report</CardTitle>
              <CardDescription>
                Detailed breakdown of spending ({filteredReceipts.length} receipts)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
                onClick={handleExportPDF}
                disabled={exporting === 'pdf' || filteredReceipts.length === 0}
              >
                {exporting === 'pdf' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Generate PDF
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-emerald-200">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-emerald-600" />
              </div>
              <CardTitle>Export CSV</CardTitle>
              <CardDescription>
                Raw data export for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full gap-2" 
                variant="outline"
                onClick={handleExportCSV}
                disabled={exporting === 'csv' || filteredReceipts.length === 0}
              >
                {exporting === 'csv' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download CSV
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-teal-200">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>Tax Report</CardTitle>
              <CardDescription>
                Categorized for tax filing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full gap-2" 
                variant="outline"
                onClick={handleExportTaxReport}
                disabled={exporting === 'tax' || receipts.length === 0}
              >
                {exporting === 'tax' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Generate Report
            </Button>
          </CardContent>
        </Card>
        </motion.div>
      </div>

      {/* Report Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Report Preview</CardTitle>
            <CardDescription>
              {startDate || endDate 
                ? `Filtered results ${startDate ? `from ${new Date(startDate).toLocaleDateString()}` : ''} ${endDate ? `to ${new Date(endDate).toLocaleDateString()}` : ''}`
                : 'All receipts'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <motion.div 
                className="border border-green-500/20 rounded-lg p-4 bg-gradient-to-br from-green-950/50 to-background"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-sm text-green-400 font-medium">Total Receipts</p>
                <p className="text-3xl font-bold text-green-400">{filteredAnalytics.receiptsProcessed}</p>
              </motion.div>
              <motion.div 
                className="border border-emerald-500/20 rounded-lg p-4 bg-gradient-to-br from-emerald-950/50 to-background"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-sm text-emerald-400 font-medium">Total Amount</p>
                <p className="text-3xl font-bold text-emerald-400">
                  ${filteredAnalytics.totalSpent.toFixed(2)}
                </p>
              </motion.div>
              <motion.div 
                className="border border-teal-500/20 rounded-lg p-4 bg-gradient-to-br from-teal-950/50 to-background"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-sm text-teal-400 font-medium">Categories</p>
                <p className="text-3xl font-bold text-teal-400">
                  {filteredAnalytics.categoriesCount}
                </p>
              </motion.div>
              <motion.div 
                className="border border-lime-500/20 rounded-lg p-4 bg-gradient-to-br from-lime-950/50 to-background"
                whileHover={{ scale: 1.05 }}
              >
                <p className="text-sm text-lime-400 font-medium">Avg. Confidence</p>
                <p className="text-3xl font-bold text-lime-400">
                  {filteredAnalytics.averageConfidence}%
                </p>
              </motion.div>
            </div>

            {/* Data Table */}
            {filteredReceipts.length > 0 ? (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Confidence</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReceipts.slice(0, 10).map((receipt) => (
                      <TableRow key={receipt._id}>
                        <TableCell>
                          {new Date(receipt.date || receipt.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {receipt.merchant || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-green-300 text-green-700">
                            {receipt.category || 'Uncategorized'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${(receipt.total || 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-medium ${
                            (receipt.confidence || 0) >= 85 ? 'text-green-600' :
                            (receipt.confidence || 0) >= 70 ? 'text-yellow-600' :
                            'text-orange-600'
                          }`}>
                            {receipt.confidence || 0}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {filteredReceipts.length > 10 && (
                  <div className="flex justify-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing 10 of {filteredReceipts.length} receipts. Export to see all.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No receipts found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or upload some receipts
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
