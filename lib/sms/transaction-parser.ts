import { nanoid } from "nanoid"

export interface SMSTransaction {
  merchant: string
  amount: number
  date: string
  upiId?: string
  bank: string
  transactionId: string
  category?: string
  type: "debit" | "credit"
  rawMessage: string
}

/**
 * Parse UPI/Banking SMS into structured transaction
 */
export function parseTransactionSMS(
  smsBody: string,
  timestamp: Date
): SMSTransaction | null {
  // Patterns for Indian banks/UPI (Debit transactions)
  const debitPatterns = {
    // SBI: "Rs.250.00 debited from A/c XX1234 on 14-MAR-25 to UPI/BigBasket"
    sbi: /Rs\.?\s?([\d,]+\.?\d*)\s+debited.*?(?:to\s+UPI\/|for\s+)(.+?)(?:\s+on|\.|$)/i,

    // HDFC: "INR 450.00 debited from XX1234 on 14-MAR-25 UPI-Swiggy"
    hdfc: /INR\s+([\d,]+\.?\d*)\s+debited.*?UPI[:\-\s](.+?)(?:\s+on|\.|$)/i,

    // ICICI: "Rs 1200 debited from XX1234 for UPI/Amazon on 14-03-25"
    icici: /Rs\.?\s?([\d,]+)\s+debited.*?(?:UPI\/|to\s+)(.+?)(?:\s+on|\.|$)/i,

    // Paytm: "Rs.300 paid to Uber via Paytm"
    paytm: /Rs\.?\s?([\d,]+)\s+paid to\s+(.+?)\s+via\s+Paytm/i,

    // PhonePe: "You paid Rs.500 to Zomato via PhonePe"
    phonepe: /(?:paid|sent)\s+Rs\.?\s?([\d,]+)\s+to\s+(.+?)\s+(?:via\s+PhonePe|using)/i,

    // Google Pay: "You sent Rs 250 to Swiggy"
    gpay: /sent Rs\.?\s?([\d,]+)\s+to\s+(.+?)(?:\s+on|\.|$)/i,

    // Generic UPI pattern
    generic: /(?:debited|paid|sent).*?Rs\.?\s?([\d,]+).*?(?:to|for)\s+(.+?)(?:\s+on|\.|$)/i,
  }

  // Try debit patterns first
  for (const [bank, regex] of Object.entries(debitPatterns)) {
    const match = smsBody.match(regex)
    if (match) {
      const amount = parseFloat(match[1].replace(/,/g, ""))
      const merchant = cleanMerchantName(match[2])

      return {
        merchant,
        amount,
        date: timestamp.toISOString().split("T")[0],
        bank,
        transactionId: extractTransactionId(smsBody) || `sms_${nanoid(8)}`,
        category: inferCategory(merchant),
        type: "debit",
        rawMessage: smsBody,
      }
    }
  }

  return null
}

/**
 * Clean merchant name from UPI ID or extra characters
 */
function cleanMerchantName(merchant: string): string {
  // Remove UPI ID if present (e.g., "Swiggy@paytm" -> "Swiggy")
  merchant = merchant.split("@")[0]

  // Remove common prefixes
  merchant = merchant.replace(/^(UPI\/|VPA\/)/i, "")

  // Remove trailing punctuation
  merchant = merchant.replace(/[.,;:!?\s]+$/, "")

  // Capitalize first letter of each word
  return merchant
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
    .trim()
}

/**
 * Infer category from merchant name using ML-like patterns
 */
function inferCategory(merchant: string): string {
  const merchantLower = merchant.toLowerCase()

  const categories: Record<string, RegExp> = {
    "Food & Beverage": /(swiggy|zomato|uber\s*eats|domino|pizza|mcdonald|kfc|subway|burger|starbucks|cafe|restaurant|food|dining)/i,
    Transportation: /(uber|ola|rapido|metro|irctc|bus|taxi|cab|fuel|petrol|diesel)/i,
    Shopping: /(amazon|flipkart|myntra|ajio|meesho|nykaa|fashion|shopping|store)/i,
    Groceries: /(bigbasket|grofers|dunzo|blinkit|zepto|jiomart|dmart|supermarket|grocery)/i,
    Entertainment: /(netflix|spotify|prime|hotstar|disney|youtube|bookmyshow|movie|ticket|subscription)/i,
    Utilities: /(electricity|water|gas|bill|recharge|broadband|wifi|internet|mobile)/i,
    Healthcare: /(pharma|medicine|doctor|hospital|clinic|apollo|medplus|1mg|healthcare)/i,
    Education: /(course|udemy|coursera|byju|unacademy|coaching|tuition|book|education)/i,
    "Personal Care": /(salon|spa|gym|fitness|beauty|grooming|healthcare)/i,
  }

  for (const [category, pattern] of Object.entries(categories)) {
    if (pattern.test(merchantLower)) {
      return category
    }
  }

  return "Other"
}

/**
 * Extract transaction ID from SMS
 */
function extractTransactionId(sms: string): string | null {
  const patterns = [
    /(?:ref|utr|trans|txn|transaction)[\s#:]*([A-Z0-9]{8,})/i,
    /(?:id|no)[\s#:]*([A-Z0-9]{8,})/i,
  ]

  for (const pattern of patterns) {
    const match = sms.match(pattern)
    if (match) return match[1]
  }

  return null
}

/**
 * Check if SMS is a transaction message
 */
export function isTransactionSMS(smsBody: string): boolean {
  const keywords = [
    "debited",
    "credited",
    "paid",
    "sent",
    "received",
    "UPI",
    "IMPS",
    "NEFT",
    "transaction",
    "A/c",
  ]

  const lowerBody = smsBody.toLowerCase()
  const hasKeyword = keywords.some((keyword) =>
    lowerBody.includes(keyword.toLowerCase())
  )
  const hasAmount = /Rs\.?\s?[\d,]+|INR\s?[\d,]+/.test(smsBody)

  return hasKeyword && hasAmount
}

/**
 * Get known bank phone numbers/sender IDs (Indian banks)
 */
export function getBankSenderIds(): string[] {
  return [
    // Banks
    "HDFCBK",
    "SBIINB",
    "ICICIB",
    "KOTAKB",
    "AXISBK",
    "PNBSMS",
    "BOISMS",
    "CBSSBI",
    // UPI Apps
    "PAYTM",
    "PHONEPE",
    "GPAY",
    "AMAZONP",
    "BHARTP",
    // Generic patterns
    "VM-",
    "VK-",
    "JD-",
  ]
}
