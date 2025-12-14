/**
 * Currency Conversion Module
 * Converts any currency to INR using exchangerate-api.com (free tier, no API key required)
 */

type ExchangeRateCache = {
  rate: number
  timestamp: number
}

// In-memory cache with 6-hour TTL
const exchangeRateCache = new Map<string, ExchangeRateCache>()
const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 hours

/**
 * Fetch exchange rate from free API
 * Using exchangerate-api.com which provides free tier without API key requirement
 */
async function fetchExchangeRate(fromCurrency: string): Promise<number> {
  const base = fromCurrency.toUpperCase()
  
  if (base === 'INR') {
    return 1
  }

  const cacheKey = `${base}->INR`
  const now = Date.now()
  
  // Check cache first
  const cached = exchangeRateCache.get(cacheKey)
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    console.log(`[currency-convert] Using cached rate for ${base}->INR: ${cached.rate}`)
    return cached.rate
  }

  try {
    // Free API endpoint - no authentication required
    // https://exchangerate-api.com/docs (free tier available)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${base}`,
      {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      }
    )

    if (!response.ok) {
      console.warn(`[currency-convert] API returned ${response.status} for ${base}`)
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json() as { rates?: Record<string, number> }
    const rate = data?.rates?.INR

    if (!rate || typeof rate !== 'number' || rate <= 0) {
      console.warn(`[currency-convert] Invalid rate for ${base}->INR:`, rate)
      throw new Error('Invalid exchange rate')
    }

    // Cache the rate
    exchangeRateCache.set(cacheKey, { rate, timestamp: now })
    console.log(`[currency-convert] Fetched and cached rate for ${base}->INR: ${rate}`)
    
    return rate
  } catch (error) {
    console.error(`[currency-convert] Failed to fetch rate for ${base}:`, error)
    
    // Return a sensible fallback based on common currencies
    const fallbackRates: Record<string, number> = {
      'USD': 83.5,  // Approximate
      'EUR': 91.0,
      'GBP': 106.0,
      'JPY': 0.56,
      'CAD': 61.0,
      'AUD': 55.0,
      'CHF': 94.0,
      'SGD': 62.0,
      'HKD': 10.7,
      'MYR': 17.8,
      'THB': 2.35,
      'PKR': 0.3,
      'BDT': 0.79,
      'LKR': 0.25,
      'AED': 22.7,
      'SAR': 22.3,
      'MXN': 4.8,
      'BRL': 16.8,
    }
    
    const fallbackRate = fallbackRates[base] ?? 1
    console.warn(`[currency-convert] Using fallback rate for ${base}: ${fallbackRate}`)
    
    return fallbackRate
  }
}

/**
 * Convert amount from any currency to INR
 */
export async function convertToINR(
  amount: number,
  fromCurrency: string
): Promise<{
  inr: number
  rate: number
  fromCurrency: string
}> {
  if (!fromCurrency || amount < 0) {
    return { inr: 0, rate: 1, fromCurrency: fromCurrency || 'UNKNOWN' }
  }

  if (amount === 0) {
    return { inr: 0, rate: 1, fromCurrency }
  }

  const rate = await fetchExchangeRate(fromCurrency)
  const inr = roundTo2Decimals(amount * rate)

  return { inr, rate, fromCurrency }
}

/**
 * Convert multiple amounts at once (more efficient)
 */
export async function convertManyToINR(
  amounts: Array<{ amount: number; currency: string }>
): Promise<Array<{ inr: number; rate: number; original: number; currency: string }>> {
  // Get unique currencies
  const uniqueCurrencies = [...new Set(amounts.map(a => a.currency))]
  
  // Fetch all rates in parallel
  const ratesMap = new Map<string, number>()
  await Promise.all(
    uniqueCurrencies.map(async (currency) => {
      const rate = await fetchExchangeRate(currency)
      ratesMap.set(currency, rate)
    })
  )

  // Convert amounts
  return amounts.map(({ amount, currency }) => {
    const rate = ratesMap.get(currency) ?? 1
    return {
      original: amount,
      currency,
      inr: roundTo2Decimals(amount * rate),
      rate
    }
  })
}

/**
 * Get current exchange rate for a currency
 */
export async function getExchangeRate(fromCurrency: string): Promise<number> {
  return fetchExchangeRate(fromCurrency)
}

/**
 * Clear exchange rate cache (useful for testing or manual refresh)
 */
export function clearExchangeRateCache(): void {
  exchangeRateCache.clear()
  console.log('[currency-convert] Cache cleared')
}

/**
 * Get cached exchange rates (for debugging)
 */
export function getCachedRates(): Record<string, number> {
  const rates: Record<string, number> = {}
  for (const [key, value] of exchangeRateCache.entries()) {
    rates[key] = value.rate
  }
  return rates
}

/**
 * Format currency for display
 */
export function formatCurrency(
  amount: number,
  currency: string = 'INR'
): string {
  const symbols: Record<string, string> = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CHF': 'CHF',
    'CAD': 'C$',
    'AUD': 'A$',
    'NZD': 'NZ$',
    'SGD': 'S$',
  }

  const symbol = symbols[currency] || currency
  
  return `${symbol} ${amount.toFixed(2)}`
}

/**
 * Round number to 2 decimal places
 */
function roundTo2Decimals(num: number): number {
  return Math.round(num * 100) / 100
}
