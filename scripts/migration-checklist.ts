#!/usr/bin/env node
/**
 * Quick Migration Checklist
 * Follow these steps to migrate existing receipts to multi-currency support
 */

import chalk from 'chalk'

console.log(`
${chalk.bold.cyan('═══════════════════════════════════════════════════════════')}
${chalk.bold.cyan('   Receipt Tracker - Currency Migration Checklist')}
${chalk.bold.cyan('═══════════════════════════════════════════════════════════')}

${chalk.yellow('BEFORE YOU START:')}
  ${chalk.gray('□')} Ensure MongoDB connection is working
  ${chalk.gray('□')} Backup your database (RECOMMENDED)
  ${chalk.gray('□')} Check you have internet for exchangerate-api.com

${chalk.blue('STEP 1: Backup Database (Optional but Recommended)')}
  Command:
  ${chalk.green('mongoexport --uri "mongodb+srv://user:pass@cluster.mongodb.net/ledgermind" \\')}
  ${chalk.green('  --collection receipts --out receipts_backup.json')}

${chalk.blue('STEP 2: Run Migration')}
  Command:
  ${chalk.green('npx ts-node scripts/migrate-currencies.ts')}

  Or if you added the script to package.json:
  ${chalk.green('npm run migrate:currencies')}

  Expected output:
  ${chalk.gray('🔄 Starting currency migration for existing receipts...')}
  ${chalk.gray('📋 Found 42 receipts to process')}
  ${chalk.gray('[1/42] Processing Starbucks Coffee...')}
  ${chalk.gray('  ✅ Updated: USD (95% confidence)')}
  ${chalk.gray('[2/42] Processing Reliance Mart...')}
  ${chalk.gray('  ✅ Updated: INR (100% confidence)')}
  ${chalk.gray('...')}

${chalk.blue('STEP 3: Review Results')}
  The script will show:
  ${chalk.gray('✅ Successfully Updated   - Receipts processed correctly')}
  ${chalk.gray('⚠️  Needs Review          - Low confidence detections')}
  ${chalk.gray('❌ Update Failed          - Receipts that couldn\'t be processed')}

  If ${chalk.yellow('⚠️  Needs Review')} > 0:
  ${chalk.cyan('  → Go to Receipts page in UI')}
  ${chalk.cyan('  → Find receipts with low confidence')}
  ${chalk.cyan('  → Verify and manually correct if needed')}

${chalk.blue('STEP 4: Verify Analytics')}
  ${chalk.cyan('→ Check Analytics page')}
  ${chalk.cyan('→ Verify Total Spent is in INR')}
  ${chalk.cyan('→ Category breakdown should make sense')}

${chalk.yellow('WHAT HAPPENS:')}
  Each receipt will be updated with:
  ${chalk.gray('  • currency           - Detected currency code (USD, EUR, INR, etc.)')}
  ${chalk.gray('  • currencyConfidence - Confidence 0-1 (0.95 = 95% confident)')}
  ${chalk.gray('  • currencySignals    - How it was detected (symbol, ocr, merchant, geo)')}
  ${chalk.gray('  • totalINR           - Amount converted to Indian Rupees')}
  ${chalk.gray('  • fxRateToINR        - Exchange rate used for conversion')}

${chalk.green('✨ RESULT:')}
  After migration:
  ${chalk.green('  ✅ All analytics use normalized INR amounts')}
  ${chalk.green('  ✅ Neural network trains on consistent currency')}
  ${chalk.green('  ✅ Original currency preserved for auditing')}
  ${chalk.green('  ✅ New receipts auto-detect on upload')}

${chalk.yellow('⚠️  COMMON ISSUES:')}

  Q: Script won't connect to MongoDB?
  A: Check MONGODB_URI and MONGODB_DB env vars are set
  
  Q: Some receipts show wrong currency?
  A: Detection used best guess. Manually correct in UI if needed.
     Look for receipts marked ⚠️ in the output.
  
  Q: Exchange rate API unreachable?
  A: Script uses fallback rates. All receipts still get processed.
  
  Q: How long does it take?
  A: ~2 seconds per receipt. 100 receipts = ~3-5 minutes.
     Script batches requests to avoid overwhelming the API.

${chalk.yellow('📚 For more details, see:')}
  ${chalk.cyan('  → CURRENCY_MIGRATION.md (comprehensive guide)')}
  ${chalk.cyan('  → scripts/migrate-currencies.ts (the script itself)')}

${chalk.bold.green('Ready? Run: npx ts-node scripts/migrate-currencies.ts')}
${chalk.bold.cyan('═══════════════════════════════════════════════════════════')}
`)
