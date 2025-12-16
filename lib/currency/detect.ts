/**
 * Currency Detection Module
 * Detects currency from receipt data using OCR text, merchant info, and IP geolocation
 */

export type CurrencyDetectInput = {
  merchant?: string
  ocrText?: string
  ipCountry?: string | null
}

export type CurrencyDetectResult = {
  currency: string // ISO 4217 code (e.g., 'USD', 'EUR', 'INR')
  confidence: number // 0-1
  signals: string[] // Debug info showing which signals detected the currency
}

// India-specific currency signals
const INDIA_HINTS = [
  /₹|INR|Rs\.?|Indian Rupee/i,
  /CGST|SGST|GSTIN/i, // Tax indicators
  /Pvt\. Ltd|Limited/i,
  /PIN\s*Code|\d{6}(?:\s|$)/i, // Postal code
  /\+91|\(0\)/i // Phone format
]

// US Dollar signals
const USD_HINTS = [
  /\$|USD|US Dollar|United States/i,
  /Sales Tax|State Tax|ZIP Code/i,
  /LLC|Inc\.|Suite|Corporation/i
]

// Euro signals
const EUR_HINTS = [
  /€|EUR|Euro/i,
  /TVA|VAT|Umsatzsteuer|IVA/i,
  /S\.A\.|GmbH|Ltd/i
]

// UK Pound signals
const GBP_HINTS = [
  /£|GBP|British Pound/i,
  /VAT|Limited|Ltd\./i
]

// Common currency symbols
const CURRENCY_SYMBOLS = new Map([
  ['₹', 'INR'],
  ['$', 'USD'],
  ['€', 'EUR'],
  ['£', 'GBP'],
  ['¥', 'JPY'],
  ['₽', 'RUB'],
  ['₩', 'KRW'],
  ['฿', 'THB'],
  ['₦', 'NGN'],
  ['₱', 'PHP'],
  ['₨', 'PKR'],
  ['₲', 'PYG'],
  ['₴', 'UAH'],
])

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  'IN': 'INR', 'US': 'USD', 'GB': 'GBP', 'CA': 'CAD',
  'AU': 'AUD', 'NZ': 'NZD', 'DE': 'EUR', 'FR': 'EUR',
  'ES': 'EUR', 'IT': 'EUR', 'NL': 'EUR', 'BE': 'EUR',
  'AT': 'EUR', 'CH': 'CHF', 'SE': 'SEK', 'NO': 'NOK',
  'DK': 'DKK', 'PL': 'PLN', 'CZ': 'CZK', 'HU': 'HUF',
  'RO': 'RON', 'BG': 'BGN', 'HR': 'HRK', 'SI': 'EUR',
  'SK': 'EUR', 'GR': 'EUR', 'PT': 'EUR', 'IE': 'EUR',
  'JP': 'JPY', 'CN': 'CNY', 'KR': 'KRW', 'TH': 'THB',
  'SG': 'SGD', 'MY': 'MYR', 'PH': 'PHP', 'VN': 'VND',
  'ID': 'IDR', 'PK': 'PKR', 'BD': 'BDT', 'LK': 'LKR',
  'MX': 'MXN', 'BR': 'BRL', 'AR': 'ARS', 'CO': 'COP',
  'ZA': 'ZAR', 'NG': 'NGN', 'KE': 'KES', 'EG': 'EGP',
  'SA': 'SAR', 'AE': 'AED', 'IL': 'ILS', 'TR': 'TRY',
}

function hasHint(text: string, hints: RegExp[]): boolean {
  return hints.some((r) => r.test(text))
}

/**
 * Detect currency symbol in OCR text
 */
function detectCurrencySymbol(text: string): string | null {
  if (!text) return null
  
  for (const [symbol, code] of CURRENCY_SYMBOLS.entries()) {
    if (text.includes(symbol)) {
      return code
    }
  }
  
  return null
}

/**
 * Lookup merchant country using OSM Nominatim (free, no API key)
 */
async function lookupMerchantCountry(merchant?: string): Promise<string | null> {
  if (!merchant || merchant.trim().length < 3) return null
  
  try {
    const q = encodeURIComponent(merchant.trim())
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1&addressdetails=1`,
      { 
        headers: { 'User-Agent': 'receipt-tracker/1.0' },
        signal: AbortSignal.timeout(3000) // 3s timeout
      }
    )
    
    if (!response.ok) return null
    
    const data = await response.json() as Array<{
      address?: Record<string, string>
    }>
    
    const countryCode = data?.[0]?.address?.country_code?.toUpperCase()
    return countryCode && countryCode.length === 2 ? countryCode : null
  } catch (err) {
    console.warn('[currency-detect] Merchant lookup failed:', err)
    return null
  }
}

/**
 * Main currency detection function
 */
export async function detectCurrency(
  input: CurrencyDetectInput
): Promise<CurrencyDetectResult> {
  const signals: string[] = []
  const text = (input.ocrText || '').slice(0, 5000) // Limit text for performance
  const merchant = input.merchant || ''
  const ipCountry = input.ipCountry?.toUpperCase() || null

  // 1) Detect currency symbol in OCR text (highest confidence)
  const symbolCurrency = detectCurrencySymbol(text)
  if (symbolCurrency) {
    signals.push(`symbol:${symbolCurrency}`)
    // If symbol is INR, treat as definitive to prevent accidental USD override
    const conf = symbolCurrency === 'INR' ? 0.99 : 0.95
    return { currency: symbolCurrency, confidence: conf, signals }
  }

  // 2) Strong OCR text hints
  if (text) {
    if (hasHint(text, INDIA_HINTS)) {
      signals.push('ocr:india-patterns')
      return { currency: 'INR', confidence: 0.9, signals }
    }
    // Prefer INR whenever strong hints exist; only consider USD if no INR hints
    if (!hasHint(text, INDIA_HINTS) && hasHint(text, USD_HINTS)) {
      signals.push('ocr:usd-patterns')
      return { currency: 'USD', confidence: 0.85, signals }
    }
    if (hasHint(text, EUR_HINTS)) {
      signals.push('ocr:eur-patterns')
      return { currency: 'EUR', confidence: 0.85, signals }
    }
    if (hasHint(text, GBP_HINTS)) {
      signals.push('ocr:gbp-patterns')
      return { currency: 'GBP', confidence: 0.85, signals }
    }
  }

  // 3) Merchant name heuristics
  if (merchant) {
    if (/Pvt\. Ltd|Private Limited|India/i.test(merchant)) {
      signals.push('merchant:india-patterns')
      return { currency: 'INR', confidence: 0.8, signals }
    }
    if (/(LLC|Inc\.|Corp|USA|US|United States)/i.test(merchant)) {
      signals.push('merchant:usa-patterns')
      return { currency: 'USD', confidence: 0.75, signals }
    }
    if (/(GmbH|AG|Gmbh|Germany|Berlin|Munich)/i.test(merchant)) {
      signals.push('merchant:germany-patterns')
      return { currency: 'EUR', confidence: 0.75, signals }
    }
    if (/(Ltd\.|Limited|UK|London|Manchester)/i.test(merchant)) {
      signals.push('merchant:uk-patterns')
      return { currency: 'GBP', confidence: 0.75, signals }
    }
  }

  // 4) Merchant geocoding using free OSM (medium confidence)
  const merchantCountry = await lookupMerchantCountry(merchant)
  if (merchantCountry && COUNTRY_CURRENCY_MAP[merchantCountry]) {
    const currency = COUNTRY_CURRENCY_MAP[merchantCountry]
    signals.push(`geo:${merchantCountry}->${currency}`)
    // Boost INR slightly to avoid USD override when in India
    const conf = currency === 'INR' ? 0.8 : 0.7
    return { currency, confidence: conf, signals }
  }

  // 5) IP country hint (lower confidence, user might be traveling)
  if (ipCountry && COUNTRY_CURRENCY_MAP[ipCountry]) {
    const currency = COUNTRY_CURRENCY_MAP[ipCountry]
    signals.push(`ip:${ipCountry}->${currency}`)
    return { currency, confidence: 0.6, signals }
  }

  // 6) Default to INR (user is in India)
  signals.push('default:inr')
  return { currency: 'INR', confidence: 0.5, signals }
}
