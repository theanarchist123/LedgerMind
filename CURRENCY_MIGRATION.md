# Currency Migration Guide

## Overview

Your Receipt Tracker now supports **automatic multi-currency detection and conversion to INR**. However, existing receipts in the database need to be migrated to include currency information.

This guide explains:
- What the migration does
- How to run it
- What to expect

---

## What Was Implemented

### ✅ New Features
1. **Currency Detection** (`lib/currency/detect.ts`)
   - Detects currency from: symbols (₹, $, €, etc.), OCR text (CGST/SGST for India, Sales Tax for USA), merchant patterns, geocoding
   - Uses 6 different detection signals for accuracy
   - Returns: currency code, confidence (0-1), detection method

2. **Currency Conversion** (`lib/currency/convert.ts`)
   - Converts any ISO currency → INR
   - Uses free exchangerate-api.com (no auth required)
   - 6-hour caching to avoid repeated API calls
   - Fallback rates for 18+ common currencies
   - Supports batch conversions

3. **Database Schema Updates**
   - New fields on each receipt:
     - `currency` - Original currency code (USD, EUR, INR, etc.)
     - `currencyConfidence` - Detection confidence (0-1)
     - `currencySignals` - Debug info on detection method
     - `totalINR` - Amount normalized to Indian Rupees
     - `fxRateToINR` - Exchange rate used

4. **Analytics Integration**
   - All analytics now use `totalINR` for consistent calculations
   - Spending DNA, mood analysis, carbon footprint, etc. use normalized amounts
   - Neural network trains on INR amounts

---

## The Problem: Mixed Currency Data

Your existing receipts fall into these categories:

```
Category 1: Receipts with explicit currency markers
├─ USD receipts (from US merchants, dollar signs)
└─ EUR receipts (from European merchants, € symbol)

Category 2: Ambiguous receipts
├─ Could be USD or INR (no currency symbol)
├─ Need pattern matching (CGST/SGST = India, Sales Tax = USA)
└─ Need merchant geocoding for confirmation

Category 3: Already INR
└─ Indian receipts (₹ symbol, GSTIN, Pvt. Ltd)
```

**Impact without migration:**
- Analytics sum USD + INR amounts (comparing $5 to ₹5 = wrong!)
- Neural network trains on mixed currencies (broken predictions)
- Spending DNA analysis meaningless (apples + oranges)

---

## How to Run the Migration

### Step 1: Backup Your Database (RECOMMENDED)

```bash
# Export all receipts before migration (just in case)
mongoexport \
  --uri "mongodb+srv://user:pass@cluster.mongodb.net/ledgermind" \
  --collection receipts \
  --out receipts_backup.json
```

### Step 2: Run the Migration Script

```bash
# From project root:
npx ts-node scripts/migrate-currencies.ts
```

Or add to `package.json`:
```json
{
  "scripts": {
    "migrate:currencies": "ts-node scripts/migrate-currencies.ts"
  }
}
```

Then:
```bash
npm run migrate:currencies
```

### Step 3: Review Migration Results

The script outputs:
```
🔄 Starting currency migration for existing receipts...
📋 Found 42 receipts to process

[1/42] Processing Starbucks Coffee...
  ✅ Updated: USD (95% confidence)
[2/42] Processing Reliance Mart...
  ✅ Updated: INR (100% confidence)
...

==============================================================
📊 MIGRATION SUMMARY
==============================================================
Total Processed:       42
Successfully Updated:  40 ✅
Already Migrated:      0 ℹ️
Update Failed:         2 ❌
Needs Review:          3 ⚠️

💱 Currencies Detected:
  INR: 28 receipts
  USD: 12 receipts
  EUR: 2 receipts

🔍 Detection Methods Used:
  symbol: 15 times
  ocr: 18 times
  merchant: 7 times
  geo: 2 times
==============================================================
```

---

## What Happens During Migration

### 1. **Detection Phase**
For each receipt without currency data:
- Check for currency symbols (₹, $, €, £, ¥, etc.)
- Scan OCR text for country-specific patterns:
  - India: CGST, SGST, GSTIN, Pvt. Ltd, +91
  - USA: Sales Tax, State Tax, LLC, Inc., Suite
  - EU: VAT, GmbH, AG
- Check merchant name patterns (Pvt. Ltd → INR, LLC → USD)
- Use free Nominatim API to geolocate merchant
- Default to INR (you're in India)
- Return: currency code + confidence score (0-1)

### 2. **Conversion Phase**
If currency ≠ INR:
- Call exchangerate-api.com for current rate
- Calculate: `amount_inr = amount * exchange_rate`
- If API fails, use fallback rate
- Store conversion rate for auditing

### 3. **Database Update**
For each processed receipt:
```javascript
{
  _id: ObjectId(...),
  merchant: "Starbucks",
  total: 25.00,  // Original amount
  currency: "USD",
  currencyConfidence: 0.95,
  currencySignals: ["symbol:$", "merchant:us-LLC"],
  totalINR: 2087.50,  // Normalized to INR
  fxRateToINR: 83.5,  // Exchange rate used
  // ... other fields
}
```

---

## Expected Results

### Currency Detection Accuracy

| Currency | Detection Method | Confidence |
|----------|------------------|-----------|
| INR | Symbol (₹) | 100% |
| INR | GSTIN/CGST in OCR | 95%+ |
| USD | Symbol ($) | 100% |
| USD | Merchant pattern (LLC, Inc.) | 85-90% |
| USD | OCR patterns (Sales Tax) | 80-85% |
| EUR | Symbol (€) | 100% |
| EUR | Merchant pattern (GmbH, AG) | 85-90% |
| Other | Nominatim geocoding | 70-75% |
| Fallback | Default to INR | 50% |

### Detection Failures
- **Low confidence < 60%**: Marked as "needs review" in output
- **API errors**: Uses fallback exchange rates
- **Ambiguous receipts**: Still updated with best guess + low confidence

### Manual Review
After migration, check receipts marked "⚠️ Needs Review":

1. Go to Receipts page
2. Look for receipts with < 60% currency confidence
3. Verify merchant name / OCR text
4. Manually correct if needed

---

## Troubleshooting

### Script Won't Run
```bash
# Check Node/npm versions
node --version
npm --version

# Ensure dependencies are installed
npm install

# Check env vars
echo $MONGODB_DB
echo $MONGODB_URI
```

### Some Receipts Show Wrong Currency
Possible causes:
1. Merchant name is ambiguous (e.g., "Store" could be anywhere)
2. OCR extraction was incomplete
3. Receipt lacks currency indicators

**Solution:** Manually edit receipts with low confidence in the UI

### Exchange Rate API Unreachable
The script handles this automatically:
1. Tries free exchangerate-api.com
2. Falls back to hardcoded rates if API fails
3. All receipts still get processed

### Conversion Seems Wrong
Check the stored values:
```javascript
// MongoDB query to verify
db.receipts.findOne({ merchant: "Your Merchant" })
```

Should show:
```javascript
{
  total: 25,
  currency: "USD",
  totalINR: 2087.50,
  fxRateToINR: 83.5,
  currencyConfidence: 0.95
}
```

If `totalINR` is way off, check the detection method in `currencySignals`

---

## Post-Migration

### ✅ What Works Now
- ✅ All analytics use normalized INR amounts
- ✅ Neural network trains on consistent currency
- ✅ Spending DNA analysis is meaningful
- ✅ New receipts auto-detect currency on upload
- ✅ You can see original currency + conversion in receipt details

### 📊 Analytics Are Updated
```
Before migration:
  Total Spent: $5 + ₹500 = $505 ❌ (nonsense!)

After migration:
  Total Spent: ₹417.50 + ₹500 = ₹917.50 ✅ (correct!)
```

### 🔄 Ongoing Currency Handling
- **New uploads:** Auto-detected + stored
- **Mixed currency analysis:** All normalized to INR
- **Original values preserved:** `total` field still shows original amount
- **Conversion visible:** UI can show "USD 25 → ₹ 2,087.50"

---

## Running a Test First

Want to test without modifying production data?

```bash
# Export a single receipt and test locally
db.receipts.findOne({ merchant: "Test Merchant" })

# Manually run detection on it
const { detectCurrency } = require('./lib/currency/detect');
const detection = await detectCurrency({
  merchant: "Test Merchant",
  ocrText: "Receipt text here",
  ipCountry: null
});
console.log(detection);
```

---

## Questions?

- **"What if I have a receipt from a trip to Europe?"**
  - Detection will find EUR symbol or VAT pattern → converts to INR
  - Original amount preserved in `total` field

- **"Can I change detected currency manually?"**
  - Yes! Go to receipt detail page → edit currency field (coming soon)
  - Or manually update MongoDB for now

- **"What happens to old analytics if I don't run migration?"**
  - They'll still work but use fallback to `total` field
  - Sums will be mixed USD+INR (incorrect for analysis)

---

## Summary

| Before Migration | After Migration |
|---|---|
| Mixed currencies in analytics | All normalized to INR |
| Neural network confused | Trains on consistent currency |
| No currency tracking | Full audit trail with rates |
| Wrong spending totals | Accurate financial overview |
| Can't compare USD vs INR | Everything comparable in INR |

Run the migration now to unlock the full power of the multi-currency system! 🚀
