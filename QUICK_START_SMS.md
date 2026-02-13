# 🚀 Quick Start: SMS Transaction Tracking

## ⚡ Fast Setup (10 minutes)

### **prerequisites**
```bash
✅ Node.js 18+
✅ Android Studio installed
✅ Android phone with USB debugging
```

---

## 📱 Step 1: Install Dependencies

```bash
npm install
```

This installs:
- `@capacitor/core`, `@capacitor/cli`
- `@capacitor/android`, `@capacitor/ios`

---

## 🔧 Step 2: Initialize Capacitor

```bash
npx cap init
```

When prompted:
- **App name:** `LedgerMind`
- **App ID:** `com.ledgermind.app`
- **Web directory:** `out`

---

## 📦 Step 3: Add Android Platform

```bash
npx cap add android
```

---

## 🏗️ Step 4: Build for Mobile

**On Windows:**
```bash
.\scripts\build-mobile.bat
```

**On Mac/Linux:**
```bash
chmod +x scripts/build-mobile.sh
./scripts/build-mobile.sh
```

This will:
1. Build Next.js static export
2. Sync with Capacitor
3. Prepare Android project

---

## 📱 Step 5: Open in Android Studio

```bash
npm run android
```

Or manually:
```bash
npx cap open android
```

---

## ▶️ Step 6: Run on Device

### **Connect Android Phone:**
1. Enable **Developer Options**:
   - Settings → About Phone → Tap "Build Number" 7 times
2. Enable **USB Debugging**:
   - Settings → Developer Options → USB Debugging
3. Connect phone via USB
4. Trust computer when prompted

### **In Android Studio:**
1. Wait for Gradle sync to complete
2. Select your device from dropdown (top toolbar)
3. Click **Run** ▶️ button
4. App installs and launches on phone

---

## ✅ Step 7: Test SMS Sync

1. **Login** to the app
2. You'll see **"Welcome to LedgerMind!"** permissions page
3. Click **"Grant SMS Access"**
4. Android will ask for permission → **Allow**
5. Click **"Sync Transaction History"**
6. Watch progress bar as transactions are imported
7. Click **"Continue to Dashboard"**
8. See your transactions! 🎉

---

## 🔍 Verify It Works

### **Check Expense Tracker:**
1. Open sidebar → Click **"Expense Tracker"**
2. You should see transactions with 💬 SMS badge
3. Try filters: "SMS/UPI" only, categories, search

### **Check Dashboard:**
1. Total spending includes SMS transactions
2. Category breakdown shows SMS data

### **Check Other Tabs:**
All analytics auto-update:
- Carbon Tracker
- Mood Analysis
- Regret Predictor
- Spending DNA
- Neural Insights

---

## 🎯 What Happens Behind the Scenes

```
📱 Mobile App (Capacitor)
    ↓
🔌 SMSReaderPlugin.kt (Android native)
    ↓
📨 Read SMS inbox (last 6 months)
    ↓
🧠 Parse banking/UPI messages (transaction-parser.ts)
    ↓
🌐 POST /api/transactions/sms/sync
    ↓
💾 Save to MongoDB as ReceiptDoc
    ↓
📊 All analytics auto-update (use totalINR field)
```

---

## 📁 Key Files

| File | What It Does |
|------|-------------|
| `lib/sms/transaction-parser.ts` | Parse SMS → structured transaction |
| `android/.../SMSReaderPlugin.kt` | Read SMS from Android |
| `app/auth/permissions/page.tsx` | Onboarding UI |
| `app/app/expense-tracker/page.tsx` | Transaction log UI |
| `app/api/transactions/sms/sync/route.ts` | Bulk import API |

---

## 🐛 Troubleshooting

### **Build fails:**
```bash
cd android
.\gradlew clean
cd ..
npm run build
npx cap sync
```

### **Permission denied in app:**
- Check `AndroidManifest.xml` includes `READ_SMS`
- Verify plugin registered in `MainActivity.kt`

### **No transactions found:**
- Check phone has transaction SMS (last 6 months)
- Verify SMS format matches parser patterns
- Add debug logs in `transaction-parser.ts`

### **Can't open Android Studio:**
- Install from: https://developer.android.com/studio
- Install Android SDK 33+

---

## 📚 Documentation

- **Setup Guide:** [`SMS_SETUP_GUIDE.md`](./SMS_SETUP_GUIDE.md)
- **Implementation:** [`SMS_IMPLEMENTATION_SUMMARY.md`](./SMS_IMPLEMENTATION_SUMMARY.md)
- **Capacitor Docs:** https://capacitorjs.com/docs

---

## 🎊 That's It!

You now have:
✅ Mobile app with SMS transaction tracking  
✅ Auto-sync of historical transactions  
✅ Real-time analytics updates  
✅ Complete expense tracking system  

**Time to test:** ~10-15 minutes  
**Effort:** Minimal (mostly automated)  
**Result:** Fully-functional expense tracker! 🚀

---

## 🚀 Next Steps

1. **Test on your phone** - See real transactions
2. **Add more bank patterns** - Support your bank
3. **Customize categories** - Match your spending
4. **Build production APK** - Share with friends
5. **Publish to Play Store** - Make it public!

---

**Questions?** Check the setup guide or implementation summary!
