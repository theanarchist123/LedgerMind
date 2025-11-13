"use client"

import { useState } from "react"
import { Upload, FileText, CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useRouter } from "next/navigation"
import { nanoid } from "nanoid"
import { useSession } from "@/lib/auth-client"

/**
 * Upload page with RAG pipeline integration
 */
export default function UploadPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [error, setError] = useState("")

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploadedFileName(file.name)
    setIsUploading(true)
    setUploadProgress(0)
    setError("")
    setProcessingStatus("Uploading file...")

    try {
      // Generate receipt ID
      const receiptId = `r_${nanoid(12)}`
      const userId = session?.user?.id || "demo-user"

      // Simulate upload progress
      setUploadProgress(20)
      setProcessingStatus("Extracting text with OCR...")

      // Create form data
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", userId)

      setUploadProgress(40)
      setProcessingStatus("Analyzing with AI...")

      // Call the processing API
      const response = await fetch(`/api/receipts/${receiptId}/process`, {
        method: "POST",
        body: formData,
      })

      setUploadProgress(80)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Processing failed")
      }

      const result = await response.json()
      
      setUploadProgress(100)
      setProcessingStatus("Complete!")
      setIsUploading(false)
      setShowSuccess(true)
      
      console.log("Receipt processed:", result)
    } catch (err: any) {
      console.error("Upload error:", err)
      setError(err.message || "Failed to process receipt")
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    setUploadProgress(0)
    router.push("/app/receipts")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Receipt</h1>
        <p className="text-muted-foreground">
          Upload receipt images for AI-powered processing
        </p>
      </div>

      {/* Upload Card */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Your Receipt</CardTitle>
          <CardDescription>
            Drag and drop your receipt image or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }
              ${isUploading ? "pointer-events-none opacity-50" : "cursor-pointer"}
            `}
          >
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />

            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {isDragging
                    ? "Drop your file here"
                    : "Drop your receipt here"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  or click to browse from your device
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports: JPG, PNG, PDF (Max 10MB)
                </p>
              </div>

              {!isUploading && (
                <Button variant="outline" className="mt-4">
                  <FileText className="mr-2 h-4 w-4" />
                  Select File
                </Button>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">{processingStatus}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {uploadedFileName}
                </span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Uploads */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>Your recently processed receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "receipt-2025-03-14.jpg", status: "Completed", time: "2 hours ago" },
              { name: "grocery-receipt.pdf", status: "Completed", time: "1 day ago" },
              { name: "parking-ticket.jpg", status: "Processing", time: "2 days ago" },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    item.status === "Completed"
                      ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <DialogTitle className="text-center">Receipt Processed Successfully!</DialogTitle>
            <DialogDescription className="text-center">
              Your receipt has been processed using AI. The system has extracted merchant details,
              line items, and categorized your expense. View it in your receipts list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowSuccess(false)}>
              Upload Another
            </Button>
            <Button onClick={handleSuccessClose}>View Receipts</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
