"use client"

import { useState } from "react"
import { Send, Sparkles, Loader2, MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion, AnimatePresence } from "framer-motion"

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

interface ChatWidgetProps {
  userId: string
}

export function ChatWidget({ userId }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
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
      // Call server API which uses Ollama Cloud
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
    <>
      {/* Floating Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg bg-green-600 hover:bg-green-700 relative"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full animate-pulse" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[400px] h-[600px] bg-background border rounded-lg shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Ollama Cloud • Fast AI</p>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Badge className="text-xs bg-green-600">Ready</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages */}
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
                      className={`max-w-[85%] rounded-lg p-3 ${
                        message.role === "user"
                          ? "bg-green-600 text-white"
                          : "bg-muted"
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>

                      {message.receipts && message.receipts.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <div className="text-xs opacity-70">
                            Related receipts:
                          </div>
                          {message.receipts.slice(0, 3).map((receipt, ridx) => (
                            <a
                              key={ridx}
                              href={`/app/receipts/${receipt.receiptId}`}
                              className="block p-2 bg-background/10 rounded hover:bg-background/20 transition-colors"
                            >
                              <div className="flex justify-between items-start text-xs">
                                <div>
                                  <div className="font-medium">{receipt.merchant}</div>
                                  <div className="opacity-70">
                                    {receipt.date}
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

            {/* Input */}
            <div className="p-4 border-t bg-muted/30">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about your receipts..."
                  disabled={loading}
                  className="flex-1 text-sm"
                />
                <Button 
                  type="submit" 
                  disabled={loading || !input.trim()}
                  size="icon"
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>

              <div className="mt-2 text-xs text-muted-foreground">
                Try: "How much on food?", "Show Uber receipts"
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
