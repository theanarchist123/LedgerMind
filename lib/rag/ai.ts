import { GoogleGenerativeAI } from "@google/generative-ai"

const LLM_PROVIDER = (process.env.LLM_PROVIDER || "groq").toLowerCase()
const EMB_PROVIDER = (process.env.EMBEDDINGS_PROVIDER || "ollama").toLowerCase()
const OLLAMA = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
const OLLAMA_LLM_MODEL = process.env.OLLAMA_LLM_MODEL || "tinyllama" // allow override (suggest smaller variants like llama3.2:3b or llama3.2:1b)
const USE_LOCAL_RECEIPT_PARSE = (process.env.USE_LOCAL_RECEIPT_PARSE || "false").toLowerCase() === "true"
const GROQ_KEY = process.env.GROQ_API_KEY
const GEM_KEY = process.env.GOOGLE_API_KEY

// Optional Gemini client (used only if GEM_KEY exists)
const genAI = GEM_KEY ? new GoogleGenerativeAI(GEM_KEY) : null

// --- Retry helper with exponential backoff ---
async function withRetry<T>(fn: () => Promise<T>, tries = 3, base = 400): Promise<T> {
  let last: any
  for (let i = 0; i < tries; i++) {
    try {
      return await fn()
    } catch (e) {
      last = e
      const wait = base * Math.pow(2, i) + Math.floor(Math.random() * 100)
      console.log(`Retry ${i + 1}/${tries} after ${wait}ms...`)
      await new Promise((r) => setTimeout(r, wait))
    }
  }
  throw last
}

/**
 * Generate embeddings with multi-provider fallback
 * Priority: Ollama (local) → Gemini (cloud) → Mock
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  // 1) Try Ollama (local, free, fast)
  if (EMB_PROVIDER === "ollama") {
    try {
      console.log("Using Ollama for embeddings...")
      const embeddings: number[][] = []
      
      for (const text of texts) {
        const res = await withRetry(async () => {
          const r = await fetch(`${OLLAMA}/api/embeddings`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              model: "nomic-embed-text", 
              prompt: text 
            }),
          })
          if (!r.ok) {
            const errText = await r.text()
            throw new Error(`Ollama embeddings ${r.status}: ${errText}`)
          }
          return r.json()
        })
        // Ollama returns { embedding: number[] }
        if (res.embedding) {
          embeddings.push(res.embedding)
        }
      }
      
      if (embeddings.length === texts.length) {
        return embeddings
      }
    } catch (e) {
      console.warn("Ollama embeddings failed, falling back to Gemini:", e)
    }
  }

  // 2) Try Gemini (free tier with retry/backoff)
  if (GEM_KEY && genAI) {
    try {
      console.log("Using Gemini for embeddings...")
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
      const embeddings: number[][] = []
      
      for (const text of texts) {
        const result = await withRetry(() => model.embedContent(text))
        embeddings.push(result.embedding.values)
      }
      
      return embeddings
    } catch (error) {
      console.warn("Gemini embeddings failed, falling back to mock:", error)
    }
  }

  // 3) Mock fallback
  console.log("Using mock embeddings (no providers available)")
  return texts.map((t) => mockEmbed(t, 768))
}

/**
 * Generate text with multi-provider fallback
 * Priority: Groq (cloud, fast) → Ollama (local) → Gemini (cloud) → Mock
 */
export async function generateText(prompt: string): Promise<string> {
  // 1) Try Groq (free API, very fast)
  if (LLM_PROVIDER === "groq" && GROQ_KEY) {
    try {
      console.log("Using Groq for generation...")
      const data = await withRetry(async () => {
        const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${GROQ_KEY}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.2,
            max_tokens: 2048,
          }),
        })
        if (!r.ok) {
          const err = await r.text()
          throw new Error(`Groq ${r.status}: ${err}`)
        }
        return r.json()
      })
      const text = data.choices?.[0]?.message?.content ?? ""
      if (text) return text.trim()
    } catch (e) {
      console.warn("Groq generation failed, falling back to Ollama:", e)
    }
  }

  // 2) Try Ollama (local, free). Also used as fallback when Groq selected but failed.
  if (LLM_PROVIDER === "ollama" || LLM_PROVIDER === "groq") {
    try {
      console.log("Using Ollama for generation...")
      const data = await withRetry(async () => {
        // Use /api/generate for simpler interface
        const r = await fetch(`${OLLAMA}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: OLLAMA_LLM_MODEL,
            prompt,
            stream: false,
            options: {
              temperature: 0.2,
            },
          }),
        })
        if (!r.ok) {
          // If 404 model not found, abort further retries quickly
          if (r.status === 404) throw new Error(`Ollama model not found: ${OLLAMA_LLM_MODEL}`)
          const errText = await r.text()
          throw new Error(`Ollama ${r.status}: ${errText}`)
        }
        return r.json()
      })
      const text = data.response ?? data.message?.content ?? ""
      if (text) return text.trim()
    } catch (e) {
      console.warn("Ollama generation failed, falling back to Gemini:", e)
    }
  }

  // 3) Try Gemini (with retry/backoff)
  if (GEM_KEY && genAI) {
    try {
      console.log("Using Gemini for generation...")
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.1,
          topP: 0.9,
          maxOutputTokens: 2048,
        },
      })
      
      const result = await withRetry(() => model.generateContent(prompt))
      const text = result.response.text()
      if (text) return text.trim()
    } catch (error) {
      console.warn("Gemini generation failed, using mock:", error)
    }
  }

  // 4) Mock fallback
  console.log("Using mock generation (no providers available)")
  return "Mock response: Unable to connect to AI providers. Please configure Groq, Ollama, or Gemini."
}

/**
 * Parse receipt using structured output with multi-provider fallback
 */
export async function parseReceiptWithAI(ocrText: string): Promise<any> {
  // First attempt heuristic/local parse to reduce LLM usage
  const heuristic = parseReceiptHeuristic(ocrText)
  const needsLLM = !heuristic.merchant || heuristic.total === 0 || !heuristic.date
  if (!needsLLM || USE_LOCAL_RECEIPT_PARSE) {
    return {
      ...heuristic,
      source: USE_LOCAL_RECEIPT_PARSE ? "heuristic-local-only" : "heuristic-first-pass",
    }
  }
  const systemPrompt = "You are a strict JSON receipt parser. Respond with only a single JSON object, no prose or markdown."
  
  const schema = `{
  "merchant": "string",
  "date": "YYYY-MM-DD",
  "total": number,
  "tax": number|null,
  "currency": "string",
  "category": "Food & Beverage|Transportation|Shopping|Entertainment|Business|Other",
  "paymentMethod": "string|null",
  "lineItems": [{"description":"string","quantity":number,"unitPrice":number,"total":number}],
  "confidence": {"merchant":number,"date":number,"total":number,"category":number}
}`

  const prompt = `${systemPrompt}

Extract this exact JSON schema from the receipt:
${schema}

Receipt text:
${ocrText}

Rules:
- Return ONLY valid JSON, no markdown code blocks
- Numbers must be numbers (not strings)
- Use null for missing values
- confidence values are 0.0 to 1.0`

  try {
    console.log("Parsing receipt with AI (LLM)...")
    const raw = await generateText(prompt)
    const json = extractJson(raw)
    if (json && json.merchant) {
      // Merge heuristic-derived line items if LLM missed them
      if ((!json.lineItems || json.lineItems.length === 0) && heuristic.lineItems?.length) {
        json.lineItems = heuristic.lineItems
      }
      return { ...json, source: "llm" }
    }
  } catch (error) {
    console.warn("AI parsing failed, using heuristic fallback:", error)
    return { ...heuristic, source: "heuristic-fallback" }
  }
  return { ...heuristic, source: "heuristic-fallback" }
}

/**
 * Extract JSON from text (handles markdown code blocks)
 */
function extractJson(text: string): any | null {
  try {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "")
    
    // Try to find JSON object
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0])
    }
    
    // Try parsing the whole thing
    return JSON.parse(cleaned)
  } catch {
    return null
  }
}

// Simple mock embedding for fallback
function mockEmbed(text: string, dim = 768): number[] {
  let seed = 0
  for (const ch of text) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
  const out = new Array(dim).fill(0).map((_, i) => ((seed >> (i % 24)) & 255) / 255)
  return out
}

// Mock parse for fallback - tries to extract basic info from OCR text
function mockParse(ocrText: string) {
  // Try to extract some basic info from the text
  const lines = ocrText.split('\n').filter(l => l.trim())
  const merchant = lines[0]?.trim() || "Unknown Merchant"
  
  // Try to find total
  const totalMatch = ocrText.match(/total[:\s]*\$?(\d+\.?\d*)/i)
  const total = totalMatch ? parseFloat(totalMatch[1]) : 0
  
  // Try to find date
  const dateMatch = ocrText.match(/(\d{4}-\d{2}-\d{2})|(\d{1,2}\/\d{1,2}\/\d{2,4})/)
  const date = dateMatch ? dateMatch[0] : new Date().toISOString().split('T')[0]
  
  // Try to find tax
  const taxMatch = ocrText.match(/tax[:\s]*\$?(\d+\.?\d*)/i)
  const tax = taxMatch ? parseFloat(taxMatch[1]) : null
  
  return {
    merchant,
    date,
    total,
    tax,
    currency: "USD",
    category: "Other",
    paymentMethod: null,
    lineItems: [],
    confidence: {
      merchant: 0.4,
      date: 0.4,
      total: 0.4,
      category: 0.4,
    },
  }
}

// Heuristic (regex) parser to reduce dependency on LLM calls
function parseReceiptHeuristic(text: string) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length)
  const merchant = lines[0] || "Unknown Merchant"
  const dateRegexes = [/(\d{4}-\d{2}-\d{2})/, /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/]
  let date: string | null = null
  for (const r of dateRegexes) {
    const m = text.match(r)
    if (m) { date = normalizeDate(m[0]); break }
  }
  const currencyMatch = text.match(/\b(USD|EUR|GBP|INR|CAD|AUD)\b/i)
  const currency = currencyMatch ? currencyMatch[0].toUpperCase() : "USD"
  
  // Improved total matching - handle various formats and spacing
  const totalRegexes = [
    /total\s*[:]?\s*\$?\s*(\d+[,.]?\d*\.?\d{1,2})/i,  // Total: $38.02 or Total $38.02
    /\btotal\b.*?(\d+[,.]?\d+\.?\d{2})/i,             // Total anywhere with amount
    /amount\s*due\s*[:]?\s*\$?\s*(\d+[,.]?\d*\.?\d{1,2})/i,  // Amount due
    /balance\s*[:]?\s*\$?\s*(\d+[,.]?\d*\.?\d{1,2})/i,       // Balance
  ]
  
  let totalMatch = null
  for (const regex of totalRegexes) {
    const match = text.match(regex)
    if (match) {
      totalMatch = match
      break
    }
  }
  
  // Improved tax matching
  const taxRegexes = [
    /tax\s*[:]?\s*\$?\s*(\d+[,.]?\d*\.?\d{1,2})/i,
    /\btax\b.*?(\d+\.?\d{2})/i,
  ]
  
  let taxMatch = null
  for (const regex of taxRegexes) {
    const match = text.match(regex)
    if (match) {
      taxMatch = match
      break
    }
  }

  // Line items: lines with pattern: name ... $amount
  const lineItems = [] as any[]
  const lineItemRegexes = [
    /^(.+?)\s{2,}\$?\s*(\d+[,.]?\d*\.?\d{1,2})$/,  // Original pattern: name    $12.34
    /^(\d+)\s+(.+?)\s+\$?\s*(\d+[,.]?\d*\.?\d{1,2})$/,  // quantity name $12.34
    /^(.+?)\s+\$?\s*(\d+[,.]?\d*\.?\d{1,2})$/,  // name $12.34 (less spacing)
  ]
  
  for (const l of lines.slice(1)) {
    // Skip lines that are subtotal, tax, or total
    if (/^(subtotal|tax|total|amount|balance)/i.test(l)) continue
    
    for (const regex of lineItemRegexes) {
      const m = l.match(regex)
      if (m) {
        const hasQuantity = m.length === 4  // quantity is captured
        const description = hasQuantity ? m[2].trim() : m[1].trim()
        const quantity = hasQuantity ? parseInt(m[1]) : 1
        const amount = hasQuantity ? parseFloat(m[3]) : parseFloat(m[2])
        
        lineItems.push({ 
          description, 
          quantity, 
          unitPrice: amount / quantity, 
          total: amount 
        })
        break
      }
    }
  }
  return {
    merchant,
    date: date || new Date().toISOString().split('T')[0],
    total: totalMatch ? parseFloat(totalMatch[1]) : 0,
    tax: taxMatch ? parseFloat(taxMatch[1]) : null,
    currency,
    category: inferCategory(merchant, lineItems),
    paymentMethod: inferPayment(text),
    lineItems,
    confidence: {
      merchant: merchant ? 0.7 : 0.3,
      date: date ? 0.7 : 0.3,
      total: totalMatch ? 0.8 : 0.2,
      category: 0.5,
    },
  }
}

function normalizeDate(raw: string): string {
  if (/\d{4}-\d{2}-\d{2}/.test(raw)) return raw
  const parts = raw.split(/[\/-]/)
  if (parts[2]?.length === 2) parts[2] = '20' + parts[2]
  // Assume MM-DD-YYYY if first part > 12 maybe swap
  let [a,b,c] = parts
  if (parseInt(a,10) > 12) { [a,b] = [b,a] }
  return `${c}-${a.padStart(2,'0')}-${b.padStart(2,'0')}`
}

function inferCategory(merchant: string, items: any[]): string {
  const m = merchant.toLowerCase()
  if (/coffee|cafe|starbucks|restaurant|food|market|whole foods/.test(m)) return "Food & Beverage"
  if (/uber|lyft|taxi|transport|bus|flight/.test(m)) return "Transportation"
  if (/store|mart|shop|retail/.test(m)) return "Shopping"
  return "Other"
}

function inferPayment(text: string): string | null {
  const card = text.match(/card.*?(\*{2,}\d{2,}|ending\s+\d{2,4})/i)
  if (card) return card[0].replace(/\s+/g,' ').trim()
  if (/cash/i.test(text)) return "Cash"
  return null
}
