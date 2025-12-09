import { GoogleGenerativeAI } from "@google/generative-ai"
import { extractTotalFromText } from "./ocr"

// Provider configuration - Ollama is the default for everything
const LLM_PROVIDER = (process.env.LLM_PROVIDER || "ollama").toLowerCase()
const EMB_PROVIDER = (process.env.EMBEDDINGS_PROVIDER || "ollama").toLowerCase()

// Ollama configuration - supports local or remote (cloud) Ollama instances
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
const OLLAMA_LLM_MODEL = process.env.OLLAMA_LLM_MODEL || "llama3.2"
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text"

// Other API keys
const USE_LOCAL_RECEIPT_PARSE = (process.env.USE_LOCAL_RECEIPT_PARSE || "false").toLowerCase() === "true"
const GROQ_KEY = process.env.GROQ_API_KEY
const GEM_KEY = process.env.GOOGLE_API_KEY

// Optional Gemini client (used only if GEM_KEY exists)
const genAI = GEM_KEY ? new GoogleGenerativeAI(GEM_KEY) : null

// Check if Ollama is available (with timeout)
async function isOllamaAvailable(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 3000)
    
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response.ok
  } catch {
    return false
  }
}

// --- Retry helper with exponential backoff (reduced delays) ---
async function withRetry<T>(fn: () => Promise<T>, tries = 2, base = 200): Promise<T> {
  let last: any
  for (let i = 0; i < tries; i++) {
    try {
      return await fn()
    } catch (e) {
      last = e
      if (i < tries - 1) {
        const wait = base * Math.pow(2, i) + Math.floor(Math.random() * 50)
        console.log(`Retry ${i + 1}/${tries} after ${wait}ms...`)
        await new Promise((r) => setTimeout(r, wait))
      }
    }
  }
  throw last
}

/**
 * Generate embeddings with multi-provider fallback
 * Priority: Ollama (if configured) → Gemini (cloud, fast batch) → Mock
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  
  // 1) Try Ollama FIRST if it's the configured provider
  if (EMB_PROVIDER === "ollama" && await isOllamaAvailable()) {
    try {
      console.log(`Using Ollama for embeddings (${texts.length} texts) at ${OLLAMA_BASE_URL}...`)
      
      // Process in parallel (max 5 concurrent)
      const batchSize = 5
      const embeddings: number[][] = []
      
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize)
        const batchResults = await Promise.all(
          batch.map(text =>
            withRetry(async () => {
              const r = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, prompt: text }),
              })
              if (!r.ok) throw new Error(`Ollama ${r.status}`)
              const data = await r.json()
              return data.embedding as number[]
            }).catch(() => mockEmbed(text, 768))
          )
        )
        embeddings.push(...batchResults)
      }
      
      if (embeddings.length === texts.length) {
        return embeddings
      }
    } catch (e) {
      console.warn("Ollama embeddings failed:", e)
    }
  }

  // 2) Try Gemini (cloud, supports batch, fast)
  if ((EMB_PROVIDER === "gemini" || EMB_PROVIDER === "google" || EMB_PROVIDER === "ollama") && GEM_KEY && genAI) {
    try {
      console.log(`Using Gemini for embeddings (${texts.length} texts)...`)
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" })
      
      // Use parallel individual embedding calls (Gemini's batch API has type issues)
      const startTime = Date.now()
      const embeddings = await Promise.all(
        texts.map(text => 
          withRetry(() => model.embedContent(text))
            .then(r => r.embedding.values)
            .catch(() => mockEmbed(text, 768))
        )
      )
      
      console.log(`Gemini embeddings complete (${texts.length} vectors in ${Date.now() - startTime}ms)`)
      return embeddings
    } catch (error) {
      console.warn("Gemini embeddings failed:", error)
    }
  }

  // 3) Try Ollama as fallback (if not already tried)
  if (EMB_PROVIDER !== "ollama" && await isOllamaAvailable()) {
    try {
      console.log(`Using Ollama for embeddings (${texts.length} texts) at ${OLLAMA_BASE_URL}...`)
      
      // Process in parallel (max 5 concurrent)
      const batchSize = 5
      const embeddings: number[][] = []
      
      for (let i = 0; i < texts.length; i += batchSize) {
        const batch = texts.slice(i, i + batchSize)
        const batchResults = await Promise.all(
          batch.map(text =>
            withRetry(async () => {
              const r = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ model: OLLAMA_EMBED_MODEL, prompt: text }),
              })
              if (!r.ok) throw new Error(`Ollama ${r.status}`)
              const data = await r.json()
              return data.embedding as number[]
            }).catch(() => mockEmbed(text, 768))
          )
        )
        embeddings.push(...batchResults)
      }
      
      if (embeddings.length === texts.length) {
        return embeddings
      }
    } catch (e) {
      console.warn("Ollama embeddings failed:", e)
    }
  }

  // 3) Mock fallback (instant)
  console.log("Using mock embeddings (no providers available)")
  return texts.map((t) => mockEmbed(t, 768))
}

/**
 * Generate text with multi-provider fallback
 * Priority: Ollama (if configured) → Groq (cloud, fast) → Gemini (cloud) → Mock
 */
export async function generateText(prompt: string): Promise<string> {
  // 1) Try Ollama FIRST if it's the configured provider
  if (LLM_PROVIDER === "ollama" && await isOllamaAvailable()) {
    try {
      console.log(`Using Ollama for generation at ${OLLAMA_BASE_URL}...`)
      const data = await withRetry(async () => {
        const r = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
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
          if (r.status === 404) throw new Error(`Ollama model not found: ${OLLAMA_LLM_MODEL}`)
          const errText = await r.text()
          throw new Error(`Ollama ${r.status}: ${errText}`)
        }
        return r.json()
      })
      const text = data.response ?? data.message?.content ?? ""
      if (text) return text.trim()
    } catch (e) {
      console.warn("Ollama generation failed, falling back:", e)
    }
  }

  // 2) Try Groq (free API, very fast)
  if ((LLM_PROVIDER === "groq" || LLM_PROVIDER === "ollama") && GROQ_KEY) {
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
      console.warn("Groq generation failed, falling back:", e)
    }
  }

  // 3) Try Ollama as fallback (if not already tried)
  if (LLM_PROVIDER !== "ollama" && await isOllamaAvailable()) {
    try {
      console.log(`Using Ollama for generation at ${OLLAMA_BASE_URL}...`)
      const data = await withRetry(async () => {
        const r = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
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
          if (r.status === 404) throw new Error(`Ollama model not found: ${OLLAMA_LLM_MODEL}`)
          const errText = await r.text()
          throw new Error(`Ollama ${r.status}: ${errText}`)
        }
        return r.json()
      })
      const text = data.response ?? data.message?.content ?? ""
      if (text) return text.trim()
    } catch (e) {
      console.warn("Ollama fallback generation failed:", e)
    }
  }

  // 4) Try Gemini (with retry/backoff) - only if not using Ollama as primary
  if ((LLM_PROVIDER === "gemini" || LLM_PROVIDER === "groq") && GEM_KEY && genAI) {
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
      console.warn("Gemini generation failed:", error)
    }
  }

  // 5) Mock fallback
  console.log("Using mock generation (all providers failed or unavailable)")
  return "Mock response: Unable to connect to AI providers. Please ensure Ollama is running on http://localhost:11434 or configure Groq/Gemini API keys."
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
- confidence values are 0.0 to 1.0
- CRITICAL: For "total" field, use the FINAL TOTAL amount (e.g., "Total", "Total (Eat In)", "Grand Total")
- NEVER use "Sub Total" or "Subtotal" for the total field
- If you see both Subtotal and Total, ALWAYS use Total
- For "lineItems": ONLY include actual products/services purchased, NOT addresses, phone numbers, store names, or thank you messages
- lineItems example: [{"description":"Chicken Sandwich","quantity":1,"unitPrice":8.99,"total":8.99}]
- Skip any line that contains: street addresses, phone numbers, "thank you", website URLs, city/state/zip`

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
  
  // Use the robust OCR total extraction function instead of simple regex
  console.log("[Heuristic] Using OCR's extractTotalFromText for accurate total...")
  const total = extractTotalFromText(text) || 0
  
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
  
  // More strict patterns that require $ sign and reasonable prices
  const lineItemRegexes = [
    /^(\d+)\s+(.+?)\s+\$\s*(\d+\.\d{2})$/,  // quantity name $12.34 (strict)
    /^(.+?)\s{3,}\$\s*(\d+\.\d{2})$/,  // name    $12.34 (strict spacing)
  ]
  
  // Skip patterns that indicate non-product lines
  const skipPatterns = [
    /^(subtotal|sub total|tax|total|amount|balance|grand total|payment|change)/i,
    /^(street|road|avenue|ave|blvd|drive|dr|st\.|suite|unit|floor)/i,  // Address
    /^\d{1,5}\s+[a-z]+\s+(street|road|avenue|ave|blvd|drive|dr)/i,  // Full address
    /^(phone|tel|fax|email|website|www)/i,  // Contact info
    /^(thank you|thanks|visit|come again|please)/i,  // Messages
    /^[a-z]+,\s*[a-z]{2}\s*\d{5}/i,  // City, STATE ZIP
    /^\d{3}[-.\s]?\d{3}[-.\s]?\d{4}$/,  // Phone number
  ]
  
  for (const l of lines.slice(1)) {
    // Skip lines matching any skip pattern
    if (skipPatterns.some(pattern => pattern.test(l))) continue
    
    // Only match lines that look like actual products with prices
    for (const regex of lineItemRegexes) {
      const m = l.match(regex)
      if (m) {
        const hasQuantity = m.length === 4  // quantity is captured
        const description = hasQuantity ? m[2].trim() : m[1].trim()
        const quantity = hasQuantity ? parseInt(m[1]) : 1
        const amount = hasQuantity ? parseFloat(m[3]) : parseFloat(m[2])
        
        // Additional validation: price should be reasonable (not 0, not too large)
        if (amount > 0 && amount < 10000 && description.length > 2) {
          lineItems.push({ 
            description, 
            quantity, 
            unitPrice: amount / quantity,
            price: amount / quantity,  // Add both unitPrice and price for compatibility
            total: amount 
          })
        }
        break
      }
    }
  }
  return {
    merchant,
    date: date || new Date().toISOString().split('T')[0],
    total, // Use the OCR-extracted total
    tax: taxMatch ? parseFloat(taxMatch[1]) : null,
    currency,
    category: inferCategory(merchant, lineItems),
    paymentMethod: inferPayment(text),
    lineItems,
    confidence: {
      merchant: merchant ? 0.7 : 0.3,
      date: date ? 0.7 : 0.3,
      total: total > 0 ? 0.9 : 0.2, // Higher confidence when OCR function finds it
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
