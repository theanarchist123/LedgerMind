#!/usr/bin/env node
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

/**
 * Migration Script: Detect and Convert Currencies for Existing Receipts
 * 
 * Run this once to retroactively process all existing receipts:
 * npx ts-node scripts/migrate-currencies.ts
 * 
 * This will:
 * 1. Find all receipts without currency data
 * 2. Detect currency using OCR, merchant, and patterns
 * 3. Convert to INR if needed
 * 4. Update MongoDB with currency fields
 */

import type { ReceiptDoc } from "@/lib/rag/types"

interface MigrationStats {
  totalProcessed: number
  alreadyMigrated: number
  needsReview: number
  conversionErrors: number
  updateSuccess: number
  updateFailed: number
  byDetectionMethod: Record<string, number>
  byCurrency: Record<string, number>
}

async function migrateReceipts() {
  // Dynamic imports after dotenv is configured
  const { default: clientPromise } = await import("@/lib/mongodb");
  const { detectCurrency } = await import("@/lib/currency/detect");
  const { convertToINR } = await import("@/lib/currency/convert");
  
  try {
    console.log("🔄 Starting currency migration for existing receipts...")
    
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || "ledgermind")
    const receiptsCollection = db.collection<ReceiptDoc>("receipts")

    const stats: MigrationStats = {
      totalProcessed: 0,
      alreadyMigrated: 0,
      needsReview: 0,
      conversionErrors: 0,
      updateSuccess: 0,
      updateFailed: 0,
      byDetectionMethod: {},
      byCurrency: {}
    }

    // Find receipts without currency data
    const receiptsToMigrate = await receiptsCollection
      .find({
        $or: [
          { currency: { $exists: false } },
          { totalINR: { $exists: false } }
        ]
      })
      .toArray()

    console.log(`📋 Found ${receiptsToMigrate.length} receipts to process\n`)

    if (receiptsToMigrate.length === 0) {
      console.log("✅ All receipts already have currency data!")
      return
    }

    // Process in batches to avoid overwhelming the API
    const BATCH_SIZE = 10
    for (let i = 0; i < receiptsToMigrate.length; i += BATCH_SIZE) {
      const batch = receiptsToMigrate.slice(i, i + BATCH_SIZE)
      
      for (const receipt of batch) {
        stats.totalProcessed++
        
        try {
          // Skip if already migrated
          if (receipt.currency && receipt.totalINR !== undefined) {
            stats.alreadyMigrated++
            continue
          }

          console.log(`[${stats.totalProcessed}/${receiptsToMigrate.length}] Processing ${receipt.merchant}...`)

          // Detect currency
          // Some databases may not store OCR text; safely probe common fields
          const ocrText = (receipt as any)?.rawOCR
            ?? (receipt as any)?.ocrText
            ?? (receipt as any)?.ocr
            ?? ""

          const detection = await detectCurrency({
            merchant: receipt.merchant || "Unknown",
            ocrText,
            ipCountry: null
          })

          // Track detection method
          if (detection.signals && detection.signals.length > 0) {
            const method = detection.signals[0].split(":")[0] // Extract method from signal
            stats.byDetectionMethod[method] = (stats.byDetectionMethod[method] || 0) + 1
          }

          // Track currency
          stats.byCurrency[detection.currency] = (stats.byCurrency[detection.currency] || 0) + 1

          // Convert to INR if needed
          let totalINR = receipt.total || 0
          let fxRateToINR = 1
          
          if (detection.currency !== "INR" && receipt.total) {
            try {
              const conversion = await convertToINR(receipt.total, detection.currency)
              totalINR = conversion.inr
              fxRateToINR = conversion.rate
            } catch (error) {
              console.warn(`  ⚠️  Conversion failed for ${detection.currency}, using fallback`)
              stats.conversionErrors++
              // Still update with detected currency but original amount
              // Frontend will show original total with confidence low
            }
          }

          // Prepare update
          const updateData = {
            currency: detection.currency,
            currencyConfidence: detection.confidence,
            currencySignals: detection.signals,
            totalINR,
            fxRateToINR
          }

          // Mark if low confidence
          if (detection.confidence < 0.6) {
            console.log(`  ⚠️  Low confidence detection (${Math.round(detection.confidence * 100)}%)`)
            stats.needsReview++
          }

          // Update MongoDB
          const result = await receiptsCollection.updateOne(
            { _id: receipt._id },
            { $set: updateData }
          )

          if (result.modifiedCount > 0) {
            stats.updateSuccess++
            console.log(`  ✅ Updated: ${detection.currency} (${Math.round(detection.confidence * 100)}% confidence)`)
          } else if (result.matchedCount > 0) {
            stats.alreadyMigrated++
            console.log(`  ℹ️  Already migrated`)
          } else {
            stats.updateFailed++
            console.log(`  ❌ Failed to update`)
          }

        } catch (error) {
          stats.updateFailed++
          console.error(`  ❌ Error processing ${receipt.merchant}:`, error instanceof Error ? error.message : error)
        }
      }

      // Rate limiting - wait between batches to avoid API throttling
      if (i + BATCH_SIZE < receiptsToMigrate.length) {
        console.log(`\n⏸️  Processed batch ${Math.floor(i / BATCH_SIZE) + 1}, waiting before next batch...\n`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }

    // Print summary
    console.log("\n" + "=".repeat(60))
    console.log("📊 MIGRATION SUMMARY")
    console.log("=".repeat(60))
    console.log(`Total Processed:       ${stats.totalProcessed}`)
    console.log(`Successfully Updated:  ${stats.updateSuccess} ✅`)
    console.log(`Already Migrated:      ${stats.alreadyMigrated} ℹ️`)
    console.log(`Update Failed:         ${stats.updateFailed} ❌`)
    console.log(`Needs Review:          ${stats.needsReview} ⚠️`)
    console.log(`Conversion Errors:     ${stats.conversionErrors}`)
    console.log("\n💱 Currencies Detected:")
    for (const [currency, count] of Object.entries(stats.byCurrency).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${currency}: ${count} receipts`)
    }
    console.log("\n🔍 Detection Methods Used:")
    for (const [method, count] of Object.entries(stats.byDetectionMethod).sort((a, b) => b[1] - a[1])) {
      console.log(`  ${method}: ${count} times`)
    }
    console.log("=".repeat(60))

    if (stats.needsReview > 0) {
      console.log(`\n⚠️  ${stats.needsReview} receipts have low confidence currency detection.`)
      console.log("   Please review these manually in the UI to ensure accuracy.\n")
    }

    if (stats.updateSuccess === receiptsToMigrate.length - stats.alreadyMigrated) {
      console.log("\n✨ Migration completed successfully!")
    } else {
      console.log("\n⚠️  Some receipts failed to migrate. Please check the logs above.")
    }

  } catch (error) {
    console.error("❌ Migration failed:", error)
    process.exit(1)
  }
}

// Run migration
migrateReceipts()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
