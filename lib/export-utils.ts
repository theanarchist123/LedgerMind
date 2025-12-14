// Export utilities for CSV and PDF generation
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ReceiptData {
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

interface AnalyticsData {
  totalSpent: number
  receiptsProcessed: number
  averageConfidence: number
  categoriesCount: number
  categoryBreakdown: Array<{
    category: string
    amount: number
    count: number
    percentage: number
  }>
}

/**
 * Export receipts data to CSV format
 */
export function exportToCSV(receipts: ReceiptData[], filename: string = 'receipts-export.csv') {
  if (!receipts || receipts.length === 0) {
    alert('No data to export')
    return
  }

  // CSV Headers
  const headers = ['Date', 'Merchant', 'Category', 'Total', 'Tax', 'Confidence', 'Items Count']
  
  // CSV Rows
  const rows = receipts.map(receipt => [
    new Date(receipt.date || receipt.createdAt).toLocaleDateString(),
    receipt.merchant || 'Unknown',
    receipt.category || 'Uncategorized',
    `₹${(receipt.total || 0).toFixed(2)}`,
    `₹${(receipt.tax || 0).toFixed(2)}`,
    `${receipt.confidence || 0}%`,
    receipt.items?.length || 0
  ])

  // Build CSV content
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Export receipts to PDF report
 */
export function exportToPDF(
  receipts: ReceiptData[], 
  analytics: AnalyticsData,
  filename: string = 'receipts-report.pdf'
) {
  if (!receipts || receipts.length === 0) {
    alert('No data to export')
    return
  }

  const doc = new jsPDF()

  // Title
  doc.setFontSize(20)
  doc.setTextColor(34, 197, 94) // Green
  doc.text('LedgerMind Receipt Report', 14, 22)

  // Date Generated
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30)

  // Summary Statistics
  doc.setFontSize(14)
  doc.setTextColor(0)
  doc.text('Summary', 14, 42)

  doc.setFontSize(10)
  doc.text(`Total Receipts: ${analytics.receiptsProcessed}`, 14, 50)
  doc.text(`Total Spent: ₹${analytics.totalSpent.toFixed(2)}`, 14, 56)
  doc.text(`Categories: ${analytics.categoriesCount}`, 14, 62)
  doc.text(`Avg. Confidence: ${analytics.averageConfidence}%`, 14, 68)

  // Receipts Table
  const tableData = receipts.map(receipt => [
    new Date(receipt.date || receipt.createdAt).toLocaleDateString(),
    receipt.merchant || 'Unknown',
    receipt.category || 'Uncategorized',
    `₹${(receipt.total || 0).toFixed(2)}`,
    `₹${(receipt.tax || 0).toFixed(2)}`,
    `${receipt.confidence || 0}%`
  ])

  autoTable(doc, {
    head: [['Date', 'Merchant', 'Category', 'Total', 'Tax', 'Confidence']],
    body: tableData,
    startY: 76,
    theme: 'striped',
    headStyles: { 
      fillColor: [34, 197, 94], // Green
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 20 },
      5: { cellWidth: 25 }
    }
  })

  // Save PDF
  doc.save(filename)
}

/**
 * Generate category-based tax report
 */
export function exportTaxReport(
  receipts: ReceiptData[], 
  analytics: AnalyticsData,
  filename: string = 'tax-report.pdf'
) {
  if (!receipts || receipts.length === 0) {
    alert('No data to export')
    return
  }

  const doc = new jsPDF()

  // Title
  doc.setFontSize(20)
  doc.setTextColor(34, 197, 94)
  doc.text('Tax Report - Category Breakdown', 14, 22)

  // Tax Year
  doc.setFontSize(10)
  doc.setTextColor(100)
  doc.text(`Tax Year: ${new Date().getFullYear()}`, 14, 30)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 36)

  // Overall Summary
  doc.setFontSize(14)
  doc.setTextColor(0)
  doc.text('Overall Summary', 14, 48)

  doc.setFontSize(10)
  doc.text(`Total Business Expenses: ₹${analytics.totalSpent.toFixed(2)}`, 14, 56)
  doc.text(`Total Receipts: ${analytics.receiptsProcessed}`, 14, 62)
  doc.text(`Number of Categories: ${analytics.categoriesCount}`, 14, 68)

  // Category Breakdown Table
  doc.setFontSize(14)
  doc.text('Category Breakdown', 14, 80)

  const categoryData = analytics.categoryBreakdown.map(cat => [
    cat.category,
    cat.count.toString(),
    `₹${cat.amount.toFixed(2)}`,
    `${cat.percentage.toFixed(1)}%`
  ])

  autoTable(doc, {
    head: [['Category', 'Count', 'Total Amount', 'Percentage']],
    body: categoryData,
    startY: 86,
    theme: 'grid',
    headStyles: { 
      fillColor: [34, 197, 94],
      textColor: 255,
      fontStyle: 'bold'
    },
    styles: {
      fontSize: 10,
      cellPadding: 4
    },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 30, halign: 'center' },
      2: { cellWidth: 50, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' }
    },
    foot: [[
      'TOTAL',
      analytics.receiptsProcessed.toString(),
      `$${analytics.totalSpent.toFixed(2)}`,
      '100%'
    ]],
    footStyles: {
      fillColor: [220, 252, 231], // Light green
      textColor: 0,
      fontStyle: 'bold'
    }
  })

  // Detailed Receipts by Category
  let currentY = (doc as any).lastAutoTable.finalY + 15

  doc.setFontSize(14)
  doc.text('Detailed Receipts by Category', 14, currentY)

  analytics.categoryBreakdown.forEach((cat) => {
    const categoryReceipts = receipts.filter(r => r.category === cat.category)
    
    if (categoryReceipts.length === 0) return

    currentY += 10
    
    // Check if we need a new page
    if (currentY > 250) {
      doc.addPage()
      currentY = 20
    }

    doc.setFontSize(12)
    doc.setTextColor(34, 197, 94)
    doc.text(`${cat.category} (${cat.count} receipts)`, 14, currentY)

    const receiptsData = categoryReceipts.map(receipt => [
      new Date(receipt.date || receipt.createdAt).toLocaleDateString(),
      receipt.merchant || 'Unknown',
      `$${(receipt.total || 0).toFixed(2)}`
    ])

    autoTable(doc, {
      head: [['Date', 'Merchant', 'Amount']],
      body: receiptsData,
      startY: currentY + 4,
      theme: 'plain',
      headStyles: { 
        fillColor: [240, 253, 244],
        textColor: 0,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 90 },
        2: { cellWidth: 35, halign: 'right' }
      }
    })

    currentY = (doc as any).lastAutoTable.finalY + 8
  })

  // Footer note
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text('Note: Please consult with a tax professional for accurate tax filing.', 14, 285)

  // Save PDF
  doc.save(filename)
}
