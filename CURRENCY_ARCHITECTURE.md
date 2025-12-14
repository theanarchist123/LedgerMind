# Currency System Architecture & Data Flow

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     RECEIPT UPLOAD FLOW                         │
└─────────────────────────────────────────────────────────────────┘

User uploads receipt
       ↓
       ├─→ OCR Extraction (lib/rag/ocr.ts)
       │   └─→ Raw text: "Starbucks, $25.99"
       │
       ├─→ AI Parsing (lib/rag/ai.ts)
       │   └─→ Structured: { merchant: "Starbucks", total: 25.99 }
       │
       ├─→ 🆕 CURRENCY DETECTION (lib/currency/detect.ts)
       │   ├─→ Check symbols: $ → USD ✅
       │   ├─→ Check OCR patterns
       │   ├─→ Check merchant patterns
       │   ├─→ Try geocoding
       │   └─→ Return: { currency: "USD", confidence: 0.95, signals: [...] }
       │
       ├─→ 🆕 CURRENCY CONVERSION (lib/currency/convert.ts)
       │   ├─→ If currency ≠ INR:
       │   │   ├─→ Get exchange rate (API or fallback)
       │   │   └─→ Calculate: 25.99 USD × 83.5 = ₹2,169.87
       │   └─→ Return: { inr: 2169.87, rate: 83.5, from: "USD" }
       │
       ├─→ Receipt Storage (lib/rag/pipeline.ts)
       │   └─→ Save to MongoDB with:
       │       ├─ total: 25.99 (original)
       │       ├─ currency: "USD"
       │       ├─ currencyConfidence: 0.95
       │       ├─ currencySignals: ["symbol:$", ...]
       │       ├─ totalINR: 2169.87 (normalized)
       │       └─ fxRateToINR: 83.5
       │
       └─→ Analytics Updated (all use totalINR)
           ├─ Total spent
           ├─ Category breakdown
           ├─ Monthly trends
           ├─ Neural network training
           ├─ Spending DNA
           ├─ Mood analysis
           ├─ Carbon footprint
           └─ Regret prediction

═══════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│              EXISTING RECEIPTS MIGRATION FLOW                   │
└─────────────────────────────────────────────────────────────────┘

Database has mixed currencies
       ↓
       ├─→ Find all receipts without currency field
       │   └─→ Found 42 receipts
       │
       ├─→ For each receipt:
       │   ├─→ RUN DETECTION (same as new receipts)
       │   │   └─→ Detect currency with confidence
       │   │
       │   ├─→ IF confidence < 60%
       │   │   └─→ Mark for manual review
       │   │
       │   ├─→ RUN CONVERSION (same as new receipts)
       │   │   └─→ Convert to INR
       │   │
       │   └─→ UPDATE MongoDB
       │       └─→ Add currency fields to document
       │
       └─→ MIGRATION COMPLETE
           ├─→ Display results
           ├─→ Show detection methods
           ├─→ Show low-confidence items
           └─→ Analytics now use normalized INR

═══════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│          CURRENCY DETECTION - DECISION TREE                     │
└─────────────────────────────────────────────────────────────────┘

Receipt arrives
       ↓
   Has symbol? ($, €, £, ₹, ¥, ₽, ฿, ₩, ₪, ₦, etc.)
   ├─ YES → Confidence: 100% ✅
   │   └─ Return: { currency: "USD", confidence: 1.0, signals: ["symbol:$"] }
   │
   └─ NO → Check OCR text patterns
       ├─ Found CGST/SGST/GSTIN → INR, confidence: 95% ✅
       ├─ Found Sales Tax/State Tax → USD, confidence: 90% ✅
       ├─ Found VAT/GmbH/AG → EUR, confidence: 90% ✅
       └─ Not found → Check merchant patterns
           ├─ Merchant = "..Pvt. Ltd" → INR, confidence: 85% ✅
           ├─ Merchant = "..LLC/Inc." → USD, confidence: 85% ✅
           └─ Generic → Geolocate merchant
               ├─ API call: Nominatim
               ├─ Got location: "Mumbai, India" → INR, confidence: 75% ✅
               ├─ Got location: "New York, USA" → USD, confidence: 75% ✅
               └─ No location/failed → Default: INR, confidence: 50%

═══════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│          CURRENCY CONVERSION - EXCHANGE RATES                   │
└─────────────────────────────────────────────────────────────────┘

Convert USD to INR
       ↓
   Try API: exchangerate-api.com
   ├─ SUCCESS → Get live rate
   │   ├─ 1 USD = 83.5 INR
   │   ├─ Cache for 6 hours
   │   └─ Return rate ✅
   │
   └─ FAILED → Use fallback rates
       ├─ Timeout? Use cache if available
       ├─ Cache expired? Use hardcoded fallback
       └─ Return fallback rate ✅
           ├─ USD: 83.5
           ├─ EUR: 91.0
           ├─ GBP: 106.0
           ├─ JPY: 0.56
           ├─ CAD: 61.0
           ├─ AUD: 55.0
           ├─ CHF: 94.0
           ├─ SGD: 62.0
           ├─ HKD: 10.7
           ├─ MYR: 17.8
           ├─ THB: 2.35
           ├─ PKR: 0.3
           ├─ BDT: 0.79
           ├─ LKR: 0.25
           ├─ AED: 22.7
           ├─ SAR: 22.3
           ├─ MXN: 4.8
           └─ BRL: 16.8

═══════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│              ANALYTICS - BEFORE & AFTER                         │
└─────────────────────────────────────────────────────────────────┘

BEFORE MIGRATION:
═══════════════════
Receipts in DB:
  1. Starbucks: $25 (no currency marker)
  2. Reliance:  ₹500 (has ₹)
  3. Nike:      $120 (no currency marker)

Analytics calculation:
  totalSpent = 25 + 500 + 120 = 645 ❌
  (Comparing dollars and rupees!)

Neural network training:
  inputs: [25, 500, 120, ...] ❌
  (What does 25 vs 500 mean?)


AFTER MIGRATION:
════════════════
Receipts in DB:
  1. Starbucks: total=25, totalINR=2087.50 (currency: USD)
  2. Reliance:  total=500, totalINR=500 (currency: INR)
  3. Nike:      total=120, totalINR=10020 (currency: USD)

Analytics calculation:
  totalSpent = 2087.50 + 500 + 10020 = 12607.50 ✅
  (All in INR!)

Neural network training:
  inputs: [2087.50, 500, 10020, ...] ✅
  (Clear spending patterns!)

═══════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│              DATABASE SCHEMA CHANGES                            │
└─────────────────────────────────────────────────────────────────┘

BEFORE (Old receipts):
{
  _id: ObjectId(...),
  userId: "user123",
  merchant: "Starbucks",
  total: 25,
  date: "2024-12-13",
  category: "Coffee",
  status: "completed"
}

AFTER (Migrated receipt):
{
  _id: ObjectId(...),
  userId: "user123",
  merchant: "Starbucks",
  total: 25,                          ← Original amount preserved
  currency: "USD",                    ← 🆕 Detected currency
  currencyConfidence: 0.95,           ← 🆕 Confidence 0-1
  currencySignals: [                  ← 🆕 How it was detected
    "symbol:$",
    "ocr:us-patterns",
    "merchant:us-LLC"
  ],
  totalINR: 2087.50,                  ← 🆕 Normalized to INR
  fxRateToINR: 83.5,                  ← 🆕 Exchange rate used
  date: "2024-12-13",
  category: "Coffee",
  status: "completed"
}

═══════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│              FILE STRUCTURE                                     │
└─────────────────────────────────────────────────────────────────┘

lib/currency/
├── detect.ts                    ← Currency detection (6 signals)
│   ├─ detectCurrency()
│   ├─ lookupMerchantCountry()
│   ├─ detectCurrencySymbol()
│   ├─ Regex patterns for each currency
│   └─ 60+ country-to-currency mapping
│
└── convert.ts                   ← Conversion & caching
    ├─ convertToINR()
    ├─ convertManyToINR()
    ├─ getExchangeRate()
    ├─ clearExchangeRateCache()
    ├─ getCachedRates()
    ├─ formatCurrency()
    ├─ In-memory cache with TTL
    └─ Fallback rates for 18+ currencies

scripts/
├── migrate-currencies.ts         ← Run once to migrate all
│   ├─ Find unmigrated receipts
│   ├─ Detect + convert each
│   ├─ Update MongoDB
│   └─ Display detailed results
│
├── check-migration-status.ts    ← Check progress anytime
│   ├─ Count migrated receipts
│   ├─ Show by currency
│   ├─ Show by confidence
│   └─ Display conversion stats
│
└── migration-checklist.ts       ← Quick reference guide
    └─ Display as formatted checklist

════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│              EXECUTION TIMELINE                                 │
└─────────────────────────────────────────────────────────────────┘

NOW (Token completion):
├─ ✅ Created detect.ts (280 lines) - Full currency detection
├─ ✅ Created convert.ts (200 lines) - Conversion with caching
├─ ✅ Updated pipeline.ts - Integrate detection + conversion
├─ ✅ Updated types.ts - Add currency fields to ReceiptDoc
├─ ✅ Updated 5 analytics modules - Use totalINR for calculations
├─ ✅ Updated neural predictor - Use totalINR for training
├─ ✅ Updated receipts API - Return currency data
├─ ✅ Created migration script - Retroactively process existing
├─ ✅ Created status checker - Monitor migration progress
└─ ✅ Created documentation - Complete guides

NEXT (User action):
├─ Run: npx ts-node scripts/migrate-currencies.ts
├─ Wait: ~2-5 minutes (batching 42 receipts)
├─ Review: Check status with check-migration-status.ts
├─ Verify: Fix any low-confidence detections
└─ Enjoy: Analytics now in consistent INR!

ONGOING (After migration):
├─ New receipts: Auto-detected + converted
├─ Old receipts: Already have currency data
├─ Analytics: Always use totalINR
├─ Neural network: Trains on normalized amounts
└─ User: See currency conversions in UI

═══════════════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────────────────────┐
│              QUICK REFERENCE                                    │
└─────────────────────────────────────────────────────────────────┘

Detection Confidence Levels:
  100%  → Currency symbol found ($ € £ ₹ ¥ etc.)
  95%+  → OCR text patterns matched (CGST/SGST/VAT)
  85-90% → Merchant name patterns matched
  70-80% → Merchant geocoding successful
  50-60% → Low confidence (needs review)
  ~0%   → Fallback default (should be rare)

Common Thresholds:
  Frugality detection: <2500 INR (~$30)
  Impulse buying: >4165 INR (~$50)
  Large purchase: >8350 INR (~$100)
  Carbon calc: scaled by 1/83.5 for INR

Cache Strategy:
  TTL: 6 hours per currency pair
  Format: "USD→INR" → { rate: 83.5, timestamp }
  Fallback: Always available

Error Handling:
  API timeout → Use fallback rates (still works!)
  Low confidence → Mark for review (user can fix)
  Geocoding fails → Try other signals
  No signals → Default to INR (conservative)

═══════════════════════════════════════════════════════════════════
```

## 📊 Migration Decision Tree

```
Start migration
       ↓
   Do you have a backup? 
   ├─ YES → Proceed ✅
   └─ NO → Make one (1 minute)
       
       ↓
   Run: npx ts-node scripts/migrate-currencies.ts
   
       ├─ SUCCEEDS → Display results
       │   └─ Review ⚠️  low-confidence items
       │
       └─ FAILS → Check:
           ├─ Is MongoDB connected?
           ├─ Are env vars set? (MONGODB_URI, MONGODB_DB)
           ├─ Do you have internet? (for exchangerate-api)
           └─ Check logs for error details
           
       ↓
   Check status: npx ts-node scripts/check-migration-status.ts
   
       ├─ 100% migrated → You're done! 🎉
       ├─ 50-99% → Run migration again
       └─ <50% → Something went wrong
   
       ↓
   Fix low-confidence items?
   ├─ YES → Go to Receipts page, verify currency manually
   └─ NO → That's OK, use defaults (less accurate but safe)
   
       ↓
   COMPLETE ✨
   ├─ Analytics now work correctly
   ├─ Neural network trains on normalized amounts
   └─ New uploads auto-detect currency
```

---

## 🔄 Data Flow Examples

### Example 1: USD Receipt
```
INPUT:
  OCR: "Starbucks Coffee, Seattle, WA, USA"
       "Subtotal: $22.50"
       "Tax: $2.50"
       "TOTAL: $25.00"

DETECTION:
  Signal 1: Symbol "$" found → USD
  Signal 2: OCR text contains "USA", "Seattle"
  Signal 3: Merchant "Starbucks" pattern (coffee shop, usually USA)
  Result: currency="USD", confidence=0.97

CONVERSION:
  Amount: 25.00 USD
  Rate: 83.5 INR/USD
  Result: 25.00 × 83.5 = 2087.50 INR

STORED:
  {
    merchant: "Starbucks Coffee",
    total: 25.00,
    currency: "USD",
    currencyConfidence: 0.97,
    currencySignals: ["symbol:$", "ocr:USA", "merchant:us-starbucks"],
    totalINR: 2087.50,
    fxRateToINR: 83.5
  }
```

### Example 2: INR Receipt with GSTIN
```
INPUT:
  OCR: "Reliance Mart, Mumbai"
       "GSTIN: 27AABCT1234H1Z0"
       "Food Items: ₹ 350"
       "Groceries: ₹ 150"
       "TOTAL: ₹ 500"

DETECTION:
  Signal 1: Symbol "₹" found → INR (100% confidence)
  Signal 2: GSTIN detected → India
  Result: currency="INR", confidence=1.0

CONVERSION:
  Amount: 500 INR
  Rate: 1.0 INR/INR (no conversion needed)
  Result: 500 × 1.0 = 500 INR

STORED:
  {
    merchant: "Reliance Mart",
    total: 500,
    currency: "INR",
    currencyConfidence: 1.0,
    currencySignals: ["symbol:₹", "ocr:GSTIN"],
    totalINR: 500,
    fxRateToINR: 1.0
  }
```

### Example 3: Ambiguous Receipt
```
INPUT:
  OCR: "Store #123"
       "Item 1: 50"
       "Item 2: 30"
       "TOTAL: 80"
  (No currency symbol, no tax info, generic merchant)

DETECTION:
  Signal 1: No symbol → Try next
  Signal 2: No OCR patterns → Try next
  Signal 3: Merchant "Store #123" too generic → Try next
  Signal 4: Geolocate "Store #123"
    → Could be anywhere
    → Default to INR (user is in India)
  Result: currency="INR", confidence=0.5

CONVERSION:
  Amount: 80 INR
  Rate: 1.0 (staying in INR)
  Result: 80 INR

STORED:
  {
    merchant: "Store #123",
    total: 80,
    currency: "INR",
    currencyConfidence: 0.5,  ← LOW! Needs review
    currencySignals: ["default:INR"],
    totalINR: 80,
    fxRateToINR: 1.0
  }

ACTION:
  ⚠️  User should verify:
      "Is Store #123 in India or abroad?"
      "Is '80' in rupees or another currency?"
  → Can manually correct in UI if needed
```

---

This completes the **entire currency system** implementation! 🎉
