"use client"

import { useState } from "react"
import { Send, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  receipts?: Array<{
    receiptId: string
    merchant: string
    date: string
    total: number
    category: string
  }>
  queryType?: string
}

interface ReceiptChatProps {
  userId: string
}

export function ReceiptChat({ userId }: ReceiptChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi! Ask me anything about your receipts. For example:\n\n• How much did I spend on food last month?\n• Show me all Uber receipts\n• What's my biggest purchase this year?",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      role: "user",
      content: input,
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      const response = await fetch("/api/rag/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          query: input,
        }),
      })

      if (!response.ok) {
        throw new Error("Query failed")
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.answer,
        receipts: data.relevantReceipts,
        queryType: data.queryType,
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error processing your request. Please try again.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-green-500" />
          Chat with Your Receipts
        </CardTitle>
      </CardHeader>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-green-500/20 text-green-100"
                    : "bg-muted"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>

                {message.receipts && message.receipts.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-muted-foreground">
                      Related receipts:
                    </div>
                    {message.receipts.slice(0, 5).map((receipt, ridx) => (
                      <a
                        key={ridx}
                        href={`/app/receipts/${receipt.receiptId}`}
                        className="block p-2 bg-background/50 rounded hover:bg-background/80 transition-colors"
                      >
                        <div className="flex justify-between items-start text-sm">
                          <div>
                            <div className="font-medium">{receipt.merchant}</div>
                            <div className="text-xs text-muted-foreground">
                              {receipt.date} • {receipt.category}
                            </div>
                          </div>
                          <div className="font-semibold">
                            ${receipt.total.toFixed(2)}
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {message.queryType && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    {message.queryType}
                  </Badge>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <CardContent className="border-t pt-4 pb-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about your receipts..."
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        <div className="mt-2 text-xs text-muted-foreground">
          Try: "How much on food?", "Show Starbucks receipts", "Biggest purchase?"
        </div>
      </CardContent>
    </Card>
  )
}
