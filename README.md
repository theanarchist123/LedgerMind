<div align="center">
  
# 🧾 LedgerMind

### AI-Powered Receipt Tracking & Expense Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)

**Transform your receipts into actionable insights with cutting-edge AI technology**

[🚀 Live Demo](https://your-app.vercel.app) • [📖 Documentation](#-features) • [💬 Community](#-contributing)

</div>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 🤖 **AI-Powered Processing**
- **Intelligent OCR** - Extract text from receipts using Tesseract
- **Smart Categorization** - Auto-classify expenses with ML
- **Natural Language Queries** - Ask questions about your spending
- **Confidence Scoring** - Transparency in AI predictions

</td>
<td width="50%">

### 📊 **Advanced Analytics**
- **Real-time Dashboards** - Interactive spending visualizations
- **Trend Analysis** - Track patterns over time
- **Category Breakdowns** - Detailed expense distribution
- **Custom Reports** - Export to PDF/CSV/Tax formats

</td>
</tr>
<tr>
<td width="50%">

### 💎 **Premium UX**
- **Dark Mode** - Beautiful light & dark themes
- **Responsive Design** - Flawless on all devices
- **Drag & Drop** - Intuitive file uploads
- **Real-time Updates** - Live processing feedback

</td>
<td width="50%">

### 🔐 **Enterprise Security**
- **Better Auth** - Secure authentication system
- **MongoDB Atlas** - Encrypted data storage
- **API Route Protection** - Secure endpoints
- **Data Privacy** - Your data stays yours

</td>
</tr>
</table>

---

## 🎯 Quick Start

### Prerequisites

```bash
Node.js 18+ 
MongoDB Atlas account (free tier works)
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ledgermind.git
cd ledgermind
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Configure your `.env.local`:
```env
# MongoDB
MONGODB_URI="your_mongodb_connection_string"
MONGODB_DB="ledgermind"

# Better Auth Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
BETTER_AUTH_SECRET="your_secret_key"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# AI Configuration
GOOGLE_API_KEY="your_gemini_api_key"
LLM_PROVIDER="gemini"
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

---

## 🚀 Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/ledgermind)

### Manual Deployment

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/ledgermind.git
git push -u origin main
```

2. **Import to Vercel**
- Visit [vercel.com/new](https://vercel.com/new)
- Import your GitHub repository
- Configure environment variables
- Deploy!

3. **Set Environment Variables in Vercel**
- Go to Project Settings → Environment Variables
- Add all variables from `.env.local`
- Redeploy the project

---

## 📁 Project Structure

```
ledgermind/
├── 📱 app/                      # Next.js App Router
│   ├── (app)/                   # Protected routes
│   │   ├── dashboard/           # Analytics & KPIs
│   │   ├── receipts/            # Receipt management
│   │   ├── upload/              # File upload interface
│   │   ├── reports/             # Export & reporting
│   │   └── billing/             # Subscription plans
│   ├── api/                     # Backend API routes
│   │   ├── auth/                # Authentication
│   │   ├── receipts/            # Receipt CRUD
│   │   ├── analytics/           # Data aggregation
│   │   └── rag/                 # AI query system
│   ├── auth/                    # Login/Signup pages
│   ├── admin/                   # Admin panel
│   └── layout.tsx               # Root layout
├── 🎨 components/               # React components
│   ├── ui/                      # shadcn/ui primitives
│   ├── chat-widget.tsx          # AI chat interface
│   ├── navbar.tsx               # Top navigation
│   └── sidebar.tsx              # Side navigation
├── 📚 lib/                      # Utilities & services
│   ├── rag/                     # AI & ML modules
│   │   ├── ocr.ts               # Receipt text extraction
│   │   ├── ai.ts                # LLM integration
│   │   ├── auto-categorizer.ts  # ML categorization
│   │   ├── nl-query.ts          # Natural language search
│   │   └── spending-insights.ts # Analytics engine
│   ├── mongodb.ts               # Database client
│   ├── better-auth.ts           # Auth configuration
│   └── export-utils.ts          # PDF/CSV exports
└── 🔧 config files              # Configuration
```

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** Next.js 15 (App Router)
- **UI Library:** React 18
- **Styling:** TailwindCSS + shadcn/ui
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React

### **Backend**
- **Runtime:** Node.js
- **Database:** MongoDB Atlas
- **Authentication:** Better Auth
- **AI/ML:** Google Gemini AI
- **OCR:** Tesseract.js
- **PDF Generation:** jsPDF

### **DevOps**
- **Hosting:** Vercel
- **Version Control:** Git
- **Package Manager:** npm
- **Language:** TypeScript

---

## 🎨 Screenshots

<div align="center">

### Dashboard
![Dashboard](https://via.placeholder.com/800x450/1a1a1a/10b981?text=Dashboard+Analytics)

### Receipt Management
![Receipts](https://via.placeholder.com/800x450/1a1a1a/10b981?text=Receipt+Management)

### AI Chat Assistant
![Chat](https://via.placeholder.com/800x450/1a1a1a/10b981?text=AI+Chat+Assistant)

### Reports & Analytics
![Reports](https://via.placeholder.com/800x450/1a1a1a/10b981?text=Reports+%26+Analytics)

</div>

---

## 🔥 Key Features Deep Dive

### 🤖 AI-Powered Receipt Processing

**OCR Text Extraction**
- Tesseract.js for client-side processing
- Server-side fallback for complex receipts
- Multi-language support

**Smart Categorization**
- ML-based category prediction
- Confidence scoring (0-100%)
- Learning from user corrections
- Heuristic fallback system

**Natural Language Queries**
```
"How much did I spend on food last month?"
"Show me all Uber receipts"
"What's my biggest expense this year?"
```

### 📊 Advanced Analytics

**Real-time Insights**
- Total spending trends
- Category breakdowns
- Merchant analysis
- Monthly comparisons

**AI-Generated Insights**
- Spending pattern detection
- Budget recommendations
- Anomaly detection
- Predictive analytics

### 📄 Export & Reporting

**Multiple Formats**
- **PDF Reports:** Professional formatted documents
- **CSV Exports:** Raw data for Excel/Sheets
- **Tax Reports:** Categorized for filing

**Customizable Filters**
- Date range selection
- Category filtering
- Merchant filtering
- Confidence thresholds

---

## 🔐 Security & Privacy

- ✅ **Encrypted Connections:** All data transmitted over HTTPS
- ✅ **Secure Authentication:** Better Auth with session management
- ✅ **MongoDB Atlas:** Enterprise-grade database security
- ✅ **API Protection:** Route protection with middleware
- ✅ **Data Privacy:** No third-party data sharing
- ✅ **Local Processing:** OCR runs client-side when possible

---

## 📖 API Documentation

### Receipt Upload
```typescript
POST /api/receipts/upload
Content-Type: multipart/form-data

// Response
{
  "success": true,
  "receipt": {
    "id": "receipt_123",
    "merchant": "Whole Foods",
    "total": 45.99,
    "category": "Groceries",
    "confidence": 95
  }
}
```

### Natural Language Query
```typescript
POST /api/rag/chat
{
  "userId": "user_123",
  "query": "How much did I spend on food?"
}

// Response
{
  "answer": "You spent $324.50 on food last month...",
  "receipts": [...],
  "confidence": 0.92
}
```

---

## 🎯 Roadmap

- [x] **Phase 1:** Core receipt processing
- [x] **Phase 2:** AI categorization & insights
- [x] **Phase 3:** Natural language queries
- [x] **Phase 4:** Export & reporting
- [ ] **Phase 5:** Mobile app (React Native)
- [ ] **Phase 6:** Team collaboration features
- [ ] **Phase 7:** Budget tracking & alerts
- [ ] **Phase 8:** Integration with accounting software

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write clean, commented code
- Use Prettier for formatting
- Test your changes thoroughly
- Update documentation as needed

---

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- **Description:** What happened?
- **Steps to Reproduce:** How can we replicate it?
- **Expected Behavior:** What should happen?
- **Screenshots:** If applicable
- **Environment:** Browser, OS, Node version

---

## 💬 Community & Support

- 💬 **Discord:** [Join our community](https://discord.gg/ledgermind)
- 🐦 **Twitter:** [@LedgerMind](https://twitter.com/ledgermind)
- 📧 **Email:** support@ledgermind.app
- 📚 **Docs:** [docs.ledgermind.app](https://docs.ledgermind.app)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with amazing open-source technologies:

- [Next.js](https://nextjs.org/) - The React Framework
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [MongoDB](https://www.mongodb.com/) - Database platform
- [Vercel](https://vercel.com/) - Deployment platform
- [Google AI](https://ai.google.dev/) - Gemini AI models
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR engine

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/ledgermind&type=Date)](https://star-history.com/#yourusername/ledgermind&Date)

---

<div align="center">

### Made with ❤️ by the LedgerMind Team

**[Website](https://ledgermind.app)** • **[Documentation](https://docs.ledgermind.app)** • **[Blog](https://blog.ledgermind.app)**

</div>
