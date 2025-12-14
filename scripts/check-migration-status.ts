#!/usr/bin/env node
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

/**
 * Check Migration Status
 * Shows how many receipts have been migrated with currency data
 * 
 * Run: npx ts-node scripts/check-migration-status.ts
 */

async function checkStatus() {
  // Dynamic import after dotenv is configured
  const { default: clientPromise } = await import("@/lib/mongodb");
  
  try {
    console.log("\n🔍 Checking currency migration status...\n")
    
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_DB || "ledgermind")
    const receiptsCollection = db.collection("receipts")

    // Count total receipts
    const totalReceipts = await receiptsCollection.countDocuments()
    
    // Count migrated receipts (have currency field)
    const migratedReceipts = await receiptsCollection.countDocuments({
      currency: { $exists: true }
    })
    
    // Count high-confidence migrations
    const highConfidence = await receiptsCollection.countDocuments({
      currencyConfidence: { $gte: 0.7 }
    })
    
    // Count low-confidence migrations (need review)
    const lowConfidence = await receiptsCollection.countDocuments({
      currency: { $exists: true },
      $expr: { $lt: ["$currencyConfidence", 0.7] }
    })

    // Count by currency
    const byCurrency = await receiptsCollection
      .aggregate([
        { $match: { currency: { $exists: true } } },
        { $group: { _id: "$currency", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
      .toArray()

    // Count conversions (receipts with totalINR different from total)
    const convertedReceipts = await receiptsCollection.countDocuments({
      currency: { $ne: "INR" },
      totalINR: { $exists: true }
    })

    // Calculate total converted amounts
    const conversionStats = await receiptsCollection
      .aggregate([
        { $match: { currency: { $exists: true }, totalINR: { $exists: true } } },
        {
          $group: {
            _id: "$currency",
            totalOriginal: { $sum: "$total" },
            totalINR: { $sum: "$totalINR" },
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ])
      .toArray()

    // Print status
    console.log("═".repeat(60))
    console.log("📊 MIGRATION STATUS")
    console.log("═".repeat(60))
    
    console.log(`\n📈 Overall Progress:`)
    const migrationPercent = totalReceipts > 0 ? Math.round((migratedReceipts / totalReceipts) * 100) : 0
    console.log(`  Total Receipts:        ${totalReceipts}`)
    console.log(`  Migrated:              ${migratedReceipts} (${migrationPercent}%)`)
    console.log(`  Pending:               ${totalReceipts - migratedReceipts}`)
    
    console.log(`\n✅ Quality Metrics:`)
    console.log(`  High Confidence (≥70%):  ${highConfidence}`)
    console.log(`  Low Confidence (<70%):   ${lowConfidence}`)
    if (lowConfidence > 0) {
      console.log(`  ⚠️  Action: Review ${lowConfidence} receipts manually`)
    }

    console.log(`\n💱 Currencies Detected:`)
    if (byCurrency.length === 0) {
      console.log(`  (No migrated receipts yet)`)
    } else {
      for (const item of byCurrency) {
        const pct = Math.round((item.count / migratedReceipts) * 100)
        console.log(`  ${item._id}: ${item.count} receipts (${pct}%)`)
      }
    }

    console.log(`\n💰 Currency Conversions:`)
    console.log(`  Receipts Converted to INR: ${convertedReceipts}`)
    if (conversionStats.length > 0) {
      for (const stat of conversionStats) {
        if (stat._id !== "INR") {
          const avgRate = stat.totalINR / stat.totalOriginal
          console.log(`\n  ${stat._id} → INR Conversions:`)
          console.log(`    Count:          ${stat.count}`)
          console.log(`    Total ${stat._id}:    ${stat.totalOriginal.toFixed(2)}`)
          console.log(`    Total INR:      ₹${stat.totalINR.toFixed(2)}`)
          console.log(`    Avg Rate:       1 ${stat._id} = ₹${avgRate.toFixed(2)}`)
        }
      }
    }

    console.log("\n" + "═".repeat(60))

    // Show next steps
    if (migratedReceipts < totalReceipts) {
      console.log("\n🚀 Next Step:")
      console.log(`   Run: ${"\x1b[32mnpx ts-node scripts/migrate-currencies.ts\x1b[0m"}`)
      console.log(`   To migrate ${totalReceipts - migratedReceipts} remaining receipts\n`)
    } else {
      console.log("\n✨ All receipts are migrated and have currency data!\n")
    }

    if (lowConfidence > 0) {
      console.log("📋 Manual Review Needed:")
      console.log(`   ${lowConfidence} receipts have low confidence currency detection`)
      console.log(`   Go to Receipts page and verify the currency for these items\n`)
    }

  } catch (error) {
    console.error("❌ Error checking status:", error)
    process.exit(1)
  }
}

checkStatus()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
