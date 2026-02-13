"use client"

import { useState, useEffect } from "react"
import { useSession } from "@/lib/auth-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Receipt, MessageSquare, TrendingDown, TrendingUp, Search, Download, Filter, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Transaction {
  _id: string
  merchant: string
  date: string
  total: number
  totalINR: number
  currency: string
  category: string
  source: "receipt" | "sms" | "manual"
  transactionId?: string
  status: string
  createdAt: Date
}

/**
 * Expense Tracker - Shows all transactions (receipts + SMS)
 */
export default function ExpenseTrackerPage() {
  const { data: session } = useSession()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sourceFilter, setSourceFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")

  // Stats
  const [stats, setStats] = useState({
    totalSpent: 0,
    transactionCount: 0,
    smsCount: 0,
    receiptCount: 0,
  })

  useEffect(() => {
    if (session?.user?.id) {
      fetchTransactions()
    }
  }, [session?.user?.id])

  useEffect(() => {
    applyFilters()
  }, [transactions, searchQuery, sourceFilter, categoryFilter, sortBy])

  const fetchTransactions = async () => {
    try {
      const userId = session?.user?.id || "demo-user"
      const response = await fetch(`/api/receipts/list?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        const txns = data.receipts || []
        setTransactions(txns)
        calculateStats(txns)
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (txns: Transaction[]) => {
    const totalSpent = txns.reduce((sum, t) => sum + (t.totalINR || t.total || 0), 0)
    const smsCount = txns.filter((t) => t.source === "sms").length
    const receiptCount = txns.filter((t) => t.source === "receipt").length

    setStats({
      totalSpent,
      transactionCount: txns.length,
      smsCount,
      receiptCount,
    })
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (t) =>
          t.merchant?.toLowerCase().includes(query) ||
          t.category?.toLowerCase().includes(query) ||
          t.transactionId?.toLowerCase().includes(query)
      )
    }

    // Source filter
    if (sourceFilter !== "all") {
      filtered = filtered.filter((t) => t.source === sourceFilter)
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((t) => t.category === categoryFilter)
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
        case "date-asc":
          return new Date(a.date || a.createdAt).getTime() - new Date(b.date || b.createdAt).getTime()
        case "amount-desc":
          return (b.totalINR || b.total || 0) - (a.totalINR || a.total || 0)
        case "amount-asc":
          return (a.totalINR || a.total || 0) - (b.totalINR || b.total || 0)
        default:
          return 0
      }
    })

    setFilteredTransactions(filtered)
  }

  const exportToCSV = () => {
    const csv = [
      ["Date", "Merchant", "Amount (INR)", "Currency", "Category", "Source", "Transaction ID"],
      ...filteredTransactions.map((t) => [
        t.date || new Date(t.createdAt).toLocaleDateString(),
        t.merchant || "Unknown",
        (t.totalINR || t.total || 0).toFixed(2),
        t.currency || "INR",
        t.category || "Other",
        t.source || "receipt",
        t.transactionId || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  const getCategories = () => {
    const categories = new Set(transactions.map((t) => t.category).filter(Boolean))
    return Array.from(categories).sort()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
        <p className="text-muted-foreground">
          Complete transaction log from receipts and SMS
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalSpent.toLocaleString("en-IN")}</div>
            <p className="text-xs text-muted-foreground">{stats.transactionCount} transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Transactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.smsCount}</div>
            <p className="text-xs text-muted-foreground">Auto-tracked via SMS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receipt Uploads</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.receiptCount}</div>
            <p className="text-xs text-muted-foreground">Manually uploaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.transactionCount > 0 ? (stats.totalSpent / stats.transactionCount).toFixed(0) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Log</CardTitle>
          <CardDescription>View, filter, and export all your transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search merchant, category, or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  <SelectItem value="sms">💬 SMS/UPI</SelectItem>
                  <SelectItem value="receipt">📸 Receipt</SelectItem>
                  <SelectItem value="manual">✍️ Manual</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {getCategories().map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>

            {/* Transaction Table */}
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No transactions found</p>
                <p className="text-sm">Try adjusting your filters or upload your first receipt</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Merchant</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((txn) => (
                      <TableRow key={txn._id}>
                        <TableCell className="font-mono text-sm">
                          {txn.date || new Date(txn.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">
                          {txn.merchant || "Unknown"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{txn.category || "Other"}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          ₹{(txn.totalINR || txn.total || 0).toLocaleString("en-IN")}
                          {txn.currency !== "INR" && (
                            <span className="text-xs text-muted-foreground ml-1">
                              ({txn.currency})
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          {txn.source === "sms" ? (
                            <Badge variant="default" className="gap-1">
                              <MessageSquare className="h-3 w-3" />
                              SMS
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <Receipt className="h-3 w-3" />
                              Receipt
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={txn.status === "completed" ? "default" : "secondary"}
                          >
                            {txn.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <div className="text-sm text-muted-foreground">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
