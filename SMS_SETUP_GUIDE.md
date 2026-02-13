# 📱 SMS Transaction Tracking via Capacitor - Setup Guide

## 🎯 Overview

This guide explains how to add SMS-based transaction tracking to LedgerMind using Capacitor. The app will:

1. ✅ Request SMS permissions from users after login (mobile only)
2. ✅ Read historical SMS messages (last 6 months)
3. ✅ Parse banking/UPI transaction SMS automatically
4. ✅ Sync transactions to your database
5. ✅ Update all analytics automatically (Carbon Tracker, Mood Analysis, etc.)

---

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Android Studio (for Android)
- Xcode 14+ (for iOS - limited functionality)
- Existing Next.js app (LedgerMind)

---

## 🚀 Installation Steps

### **Step 1: Install Capacitor**

```bash
# Install Capacitor CLI and core
npm install @capacitor/core @capacitor/cli

# Initialize Capacitor
npx cap init

# When prompted:
# App name: LedgerMind
# App ID: com.ledgermind.app
# Web asset directory: out (for Next.js static export)
```

### **Step 2: Add Platform Support**

```bash
# Add Android platform
npx cap add android

# Add iOS platform (optional)
npx cap add ios
```

### **Step 3: Update next.config.js for Static Export**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Enable static export for Capacitor
  images: {
    unoptimized: true  // Required for static export
  },
  // ... rest of your config
}

module.exports = nextConfig
```

### **Step 4: Update package.json scripts**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "export": "next build && npx cap sync",
    "android": "npx cap open android",
    "ios": "npx cap open ios",
    "sync": "npx cap sync"
  }
}
```

### **Step 5: Copy Android Native Plugin Files**

The following files have been created in your project:

```
android/
  └── app/
      └── src/
          └── main/
              ├── AndroidManifest.xml       ✅ Created
              └── java/
                  └── com/
                      └── ledgermind/
                          └── app/
                              ├── MainActivity.kt      ✅ Created
                              └── SMSReaderPlugin.kt   ✅ Created
```

### **Step 6: Build and Sync**

```bash
# Build Next.js app
npm run build

# Sync with native platforms
npx cap sync

# Open in Android Studio
npx cap open android
```

---

## 🔧 Testing on Android

### **Option A: Physical Device (Recommended)**

1. Enable Developer Mode on your Android phone
2. Enable USB Debugging
3. Connect via USB
4. In Android Studio, click Run (▶️)

### **Option B: Android Emulator**

1. In Android Studio: Tools → Device Manager
2. Create a new Virtual Device (Pixel 6 recommended)
3. Select Android 13+ system image
4. Click Run (▶️)

---

## 📝 How It Works

### **User Flow:**

```
1. User logs in → Redirected to /auth/permissions (mobile only)
                  ↓
2. App requests SMS permission → User grants access
                  ↓
3. App scans SMS inbox (last 6 months) → Finds ~200 transactions
                  ↓
4. Parser extracts: merchant, amount, date, category
                  ↓
5. POST /api/transactions/sms/sync → Saves to MongoDB
                  ↓
6. Redirect to dashboard → All analytics updated! 🎉
```

### **Ongoing Tracking:**

- **Option A:** Background service (requires additional setup)
- **Option B:** Sync on app open (simpler, implemented)
- **Option C:** Manual refresh button in Expense Tracker

---

## 📱 Supported SMS Formats

The parser supports these Indian banks/UPI apps:

| Provider | Example SMS Format |
|----------|-------------------|
| **SBI** | `Rs.250.00 debited from A/c XX1234 on 14-MAR-25 to UPI/BigBasket` |
| **HDFC** | `INR 450.00 debited from XX1234 on 14-MAR-25 UPI-Swiggy` |
| **ICICI** | `Rs 1200 debited from XX1234 for UPI/Amazon on 14-03-25` |
| **Paytm** | `Rs.300 paid to Uber via Paytm` |
| **PhonePe** | `You paid Rs.500 to Zomato via PhonePe` |
| **Google Pay** | `You sent Rs 250 to Swiggy` |

### **Add Your Bank:**

Edit `lib/sms/transaction-parser.ts`:

```typescript
const debitPatterns = {
  // ... existing patterns
  
  mybank: /YOUR_REGEX_HERE/i,
}
```

---

## 🔐 Privacy & Security

### **What the app reads:**
- ✅ Only SMS from banks/UPI apps
- ✅ Only transaction messages (debited/credited)
- ✅ Only from last 6 months

### **What the app NEVER reads:**
- ❌ Personal messages
- ❌ OTPs or passwords
- ❌ Messages from contacts

### **How data is protected:**
- 🔒 Encrypted in transit (HTTPS)
- 🔒 Stored in MongoDB with user authentication
- 🔒 SMS permission can be revoked anytime
- 🔒 Source code is transparent (you can audit it)

---

## 🧪 Testing SMS Parsing

### **Test with sample SMS:**

1. Open Expense Tracker page
2. Click "Manual Sync" (if implemented)
3. Or test the parser directly:

```typescript
import { parseTransactionSMS } from '@/lib/sms/transaction-parser'

const testSMS = "Rs.450 debited from A/c XX1234 to UPI/Swiggy on 14-MAR-25"
const transaction = parseTransactionSMS(testSMS, new Date())

console.log(transaction)
// Output:
// {
//   merchant: "Swiggy",
//   amount: 450,
//   category: "Food & Beverage",
//   bank: "sbi",
//   type: "debit",
//   ...
// }
```

---

## 🐛 Troubleshooting

### **Permission denied error:**

```kotlin
// In SMSReaderPlugin.kt, check logs:
Logger.error(TAG, "Permission check failed")
```

**Fix:** Ensure `READ_SMS` is in AndroidManifest.xml

### **No transactions found:**

1. Check date range (default: 6 months)
2. Verify SMS format matches parser patterns
3. Add debug logs in `transaction-parser.ts`:

```typescript
console.log('Checking SMS:', smsBody)
console.log('Match result:', match)
```

### **Build errors:**

```bash
# Clean build
cd android
./gradlew clean

# Rebuild
cd ..
npm run build
npx cap sync
```

---

## 📊 What Gets Updated Automatically

When SMS transactions are imported, these pages auto-update:

- ✅ **Dashboard** - Total spending, transaction count
- ✅ **Expense Tracker** - Transaction log with filters
- ✅ **Carbon Tracker** - CO2 estimates from categories
- ✅ **Mood Analysis** - Spending patterns by time
- ✅ **Regret Predictor** - Risk analysis on purchases
- ✅ **Spending DNA** - Behavioral patterns
- ✅ **Neural Insights** - AI predictions
- ✅ **Reports** - Export includes SMS transactions

**No code changes needed!** Your analytics already use `totalINR` field.

---

## 🚀 Deployment

### **Development:**
```bash
npm run build && npx cap sync
npx cap open android
```

### **Production APK:**

1. In Android Studio: Build → Generate Signed Bundle / APK
2. Select APK
3. Create/select keystore
4. Build Release version
5. Output: `android/app/release/app-release.apk`

### **Google Play Store:**

1. Build → Generate Signed Bundle (AAB)
2. Upload to Google Play Console
3. Complete Store Listing
4. Submit for Review

---

## 📚 Next Steps

1. ✅ Test on physical Android device
2. ✅ Add more bank SMS patterns
3. ✅ Implement background SMS listener (optional)
4. ✅ Add manual refresh button
5. ✅ Create iOS version (limited - no SMS reading)

---

## 💡 Pro Tips

### **Improve Parsing Accuracy:**

- Collect sample SMS from your users
- Add patterns to `transaction-parser.ts`
- Test with real data

### **Performance Optimization:**

- Limit SMS scan to 3 months (faster)
- Batch insert transactions (currently done)
- Cache parsed transactions locally

### **Better UX:**

- Show progress during sync
- Add "Last synced: X minutes ago"
- Allow manual transaction editing

---

## 🆘 Need Help?

1. Check logs: `adb logcat | grep LedgerMind`
2. Test API endpoints with Postman
3. Verify database inserts in MongoDB Compass

---

## 📄 Files Created

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | Capacitor configuration |
| `lib/sms/sms-manager.ts` | SMS reading logic |
| `lib/sms/transaction-parser.ts` | Parse SMS into transactions |
| `lib/sms/sms-to-receipt.ts` | Convert to database format |
| `app/api/transactions/sms/route.ts` | Single transaction API |
| `app/api/transactions/sms/sync/route.ts` | Bulk sync API |
| `app/auth/permissions/page.tsx` | Onboarding/permissions page |
| `app/app/expense-tracker/page.tsx` | Transaction log page |
| `android/.../SMSReaderPlugin.kt` | Native Android plugin |
| `android/.../MainActivity.kt` | Plugin registration |
| `android/.../AndroidManifest.xml` | Permissions declaration |

---

**That's it! You now have SMS-based transaction tracking! 🎉**
