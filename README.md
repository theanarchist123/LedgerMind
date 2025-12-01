<div align="center">

# 🧾 LedgerMind

<img src="https://img.shields.io/badge/AI_Powered-Receipt_Tracking-10b981?style=for-the-badge&labelColor=000" alt="AI Powered"/>

### Stop drowning in paper receipts. Let AI do the heavy lifting.

<br/>

[<img src="https://img.shields.io/badge/▶_Live_Demo-10b981?style=for-the-badge" alt="Demo"/>](https://ledger-mind-30.vercel.app)
&nbsp;&nbsp;
[<img src="https://img.shields.io/badge/📦_Get_Started-blue?style=for-the-badge" alt="Start"/>](#-quick-start)
&nbsp;&nbsp;
[<img src="https://img.shields.io/badge/⭐_Star_Repo-gray?style=for-the-badge" alt="Star"/>](https://github.com/theanarchist123/LedgerMind)

<br/>

<img src="https://skillicons.dev/icons?i=nextjs,typescript,tailwind,mongodb,vercel" alt="Tech Stack" />

</div>

---

## ⚡ What is LedgerMind?

**LedgerMind** is an AI-powered expense tracker that turns your messy receipts into organized, actionable financial data.

```
📸 Upload Receipt → 🤖 AI Extracts Data → 📊 Get Insights → 💰 Save Money
```

No more manual data entry. No more lost receipts. No more guessing where your money went.

---

## ✨ Features

<table>
<tr>
<td align="center" width="33%">

### 🤖 AI-Powered OCR

Upload any receipt — blurry, crumpled, handwritten. Our AI extracts merchant name, date, items, and total with **95%+ accuracy**.

</td>
<td align="center" width="33%">

### 🏷️ Smart Categorization

Machine learning automatically sorts your expenses into categories. Food, transport, utilities — it learns your spending patterns.

</td>
<td align="center" width="33%">

### 💬 Ask Your Data

*"How much did I spend on coffee last month?"*  
Natural language queries powered by Google Gemini AI.

</td>
</tr>
<tr>
<td align="center" width="33%">

### 📊 Beautiful Dashboards

Real-time charts showing spending trends, category breakdowns, and monthly comparisons. Know exactly where your money goes.

</td>
<td align="center" width="33%">

### 📄 Export Anything

Generate PDF reports, CSV exports, or tax-ready documents. Perfect for freelancers, small businesses, or anyone who needs receipts organized.

</td>
<td align="center" width="33%">

### 🔐 Bank-Level Security

OAuth + email authentication via Better Auth. Your data is encrypted and stored securely in MongoDB Atlas. We never share your info.

</td>
</tr>
</table>

---

## 🎬 How It Works

| Step | What Happens |
|:---:|:---|
| **1️⃣** | **Upload** — Drag & drop or snap a photo of your receipt |
| **2️⃣** | **Extract** — AI reads the receipt and pulls out key data |
| **3️⃣** | **Categorize** — ML automatically tags the expense category |
| **4️⃣** | **Analyze** — View insights, trends, and spending patterns |
| **5️⃣** | **Export** — Download reports for taxes or budgeting |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works!)
- Google API key for Gemini AI

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/theanarchist123/LedgerMind.git
cd LedgerMind

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local
```

### Configure `.env.local`

```env
MONGODB_URI="mongodb+srv://your-connection-string"
MONGODB_DB="ledgermind"
BETTER_AUTH_SECRET="your-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GOOGLE_API_KEY="your-gemini-api-key"
```

### Run

```bash
npm run dev
# Open http://localhost:3000
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|:---|:---|
| **Frontend** | Next.js 15, React 18, TailwindCSS, shadcn/ui, Recharts |
| **Backend** | Node.js, MongoDB Atlas, Better Auth |
| **AI/ML** | Google Gemini AI, Tesseract.js OCR |
| **Deploy** | Vercel (serverless) |

---

## 📁 Project Structure

```
ledgermind/
├── app/                    # Next.js App Router
│   ├── app/                # Protected dashboard routes
│   ├── api/                # Backend API endpoints
│   └── auth/               # Login/Signup pages
├── components/             # React components + shadcn/ui
├── lib/                    # Utilities & services
│   └── rag/                # AI/ML modules (OCR, categorization, insights)
└── public/                 # Static assets
```

---

## 🗺️ Roadmap

- [x] Receipt OCR & data extraction
- [x] AI auto-categorization
- [x] Natural language queries
- [x] PDF/CSV export
- [ ] 📱 Mobile app (React Native)
- [ ] 👥 Team collaboration
- [ ] 💳 Bank account integration
- [ ] 🔔 Budget alerts

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first.

```bash
# Fork → Clone → Branch → Code → Push → PR
git checkout -b feature/awesome-feature
git commit -m "Add awesome feature"
git push origin feature/awesome-feature
```

---

## 📄 License

MIT © [theanarchist123](LICENSE)

---

<div align="center">

### 🌟 If this helped you, give it a star!

**[🌐 Live Demo](https://ledger-mind-30.vercel.app)** · **[🐛 Report Bug](https://github.com/theanarchist123/LedgerMind/issues)** · **[💡 Request Feature](https://github.com/theanarchist123/LedgerMind/issues)**

<br/>

Made with 💚 by **theanarchist123**

<img src="https://img.shields.io/github/stars/theanarchist123/LedgerMind?style=social" alt="Stars"/>

</div>
