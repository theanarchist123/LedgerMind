import { Download, FileText, Calendar } from "lucide-react"
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
import { mockReceipts, mockAnalytics } from "@/lib/mockData"

/**
 * Reports page with date filters and export options
 */
export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and export receipt reports
        </p>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
          <CardDescription>
            Select date range and report type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                defaultValue="2025-01-01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                defaultValue="2025-03-31"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category Filter</Label>
              <Input
                id="category"
                placeholder="All Categories"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button>
              <Calendar className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
            <Button variant="outline">Reset</Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Monthly Report</CardTitle>
            <CardDescription>
              Detailed breakdown of monthly spending
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gap-2">
              <Download className="h-4 w-4" />
              Generate PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Export CSV</CardTitle>
            <CardDescription>
              Raw data export for analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gap-2" variant="outline">
              <Download className="h-4 w-4" />
              Download CSV
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Tax Report</CardTitle>
            <CardDescription>
              Categorized for tax filing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full gap-2" variant="outline">
              <Download className="h-4 w-4" />
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
          <CardDescription>
            Summary of selected date range
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Receipts</p>
              <p className="text-2xl font-bold">{mockReceipts.length}</p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">
                ${mockAnalytics.totalSpent.toFixed(2)}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">
                {mockAnalytics.categoriesCount}
              </p>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Avg. Confidence</p>
              <p className="text-2xl font-bold">
                {mockAnalytics.averageConfidence}%
              </p>
            </div>
          </div>

          {/* Data Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReceipts.slice(0, 5).map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell>{receipt.date}</TableCell>
                  <TableCell className="font-medium">
                    {receipt.merchant}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{receipt.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    ${receipt.total.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end mt-4">
            <Button variant="outline">View Full Report</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
