# LedgerMind - Mock UI Prototype

A **production-grade mock UI prototype** for an AI-powered receipt tracking application. Built with Next.js 15, React 18, TypeScript, TailwindCSS, and shadcn/ui component library.

> **Note:** This is a **mock-only prototype** with no backend, AI processing, or API integration. All data is stored in-memory using mock JSON objects. This prototype is designed to be visually complete and production-ready, making it easy to integrate real backend services and AI processing later.

---

## ✨ Features

- 🎨 **100% shadcn/ui Components** - Every UI element uses shadcn/ui composition (no custom HTML reinvention)
- 🌓 **Dark Mode Support** - Complete theme system with light/dark modes
- 📱 **Fully Responsive** - Mobile-first design that works on all screen sizes
- 🎭 **Mock Data Driven** - Comprehensive mock data for realistic UI demonstration
- 🚀 **Next.js 15 App Router** - Modern React Server Components architecture
- 💎 **TypeScript First** - Full type safety across the entire application
- ♿ **Accessible** - Built on Radix UI primitives for WCAG compliance

---

## 📸 Screenshots

### Landing Page
- Hero section with call-to-action buttons
- Feature cards showcasing AI capabilities
- Clean, modern design

### Dashboard
- KPI cards showing spending metrics
- Interactive tabs (Overview, Trends, Categories)
- Recent receipts table with status badges

### Receipts Management
- Search and filter functionality
- Detailed table view with pagination
- Individual receipt detail pages with editable forms
- Line items management
- AI analysis results viewer

### File Upload
- Drag-and-drop interface
- Real-time progress tracking (simulated)
- Success confirmation dialogs
- Recent uploads history

### Reports
- Date range filtering
- Export options (PDF, CSV, Tax Reports)
- Report preview with summary statistics

### Billing
- Three-tier pricing plans (Free, Pro, Business)
- Usage meters with progress bars
- Upgrade confirmation dialogs

### Admin Panel
- User management table
- Receipt overview
- System activity logs

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Next.js | 15.0.3 |
| **UI Library** | React | 18.2.0 |
| **Language** | TypeScript | 5 |
| **Styling** | TailwindCSS | 3.4.14 |
| **Components** | shadcn/ui | Latest |
| **Primitives** | Radix UI | Latest |
| **Icons** | lucide-react | 0.454.0 |
| **Utilities** | class-variance-authority | 0.7.0 |
| | clsx | 2.1.1 |
| | tailwind-merge | 2.5.4 |
| **Date Handling** | date-fns | 3.6.0 |
| | react-day-picker | 8.10.1 |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Setup Steps

1. **Clone or navigate to the project directory:**
   ```bash
   cd d:\cold\receipt_tracker
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```
   
   > **Note:** The `--legacy-peer-deps` flag is required due to peer dependency conflicts between Next.js 15 and some Radix UI packages.

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
receipt_tracker/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Authenticated app routes
│   │   ├── dashboard/            # Dashboard page
│   │   ├── receipts/             # Receipts list & detail pages
│   │   │   └── [id]/             # Dynamic receipt detail route
│   │   ├── upload/               # File upload page
│   │   ├── reports/              # Reports page
│   │   ├── billing/              # Billing & plans page
│   │   └── layout.tsx            # App layout with sidebar + navbar
│   ├── auth/
│   │   └── login/                # Login page
│   ├── admin/                    # Admin panel
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles with CSS variables
├── components/
│   ├── ui/                       # shadcn/ui components (15+ components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── badge.tsx
│   │   ├── separator.tsx
│   │   ├── tabs.tsx
│   │   ├── avatar.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── dialog.tsx
│   │   ├── progress.tsx
│   │   ├── scroll-area.tsx
│   │   ├── switch.tsx
│   │   └── skeleton.tsx
│   ├── sidebar.tsx               # Navigation sidebar
│   ├── navbar.tsx                # Top navigation bar
│   └── theme-provider.tsx        # Dark mode provider
├── lib/
│   ├── mockData.ts               # Mock data (receipts, users, analytics)
│   └── utils.ts                  # Utility functions (cn helper)
├── public/                       # Static assets
├── components.json               # shadcn/ui configuration
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
└── package.json                  # Project dependencies
```

---

## 🎯 Available Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero and features |
| `/auth/login` | Login page with OAuth options |
| `/app/dashboard` | Main dashboard with KPIs and recent receipts |
| `/app/receipts` | Receipts list with search and filters |
| `/app/receipts/[id]` | Individual receipt detail view |
| `/app/upload` | File upload page with drag-and-drop |
| `/app/reports` | Reports page with export options |
| `/app/billing` | Billing and subscription plans |
| `/admin` | Admin panel (users, receipts, logs) |

---

## 🧩 Components Library

### UI Components (shadcn/ui)
All components are built using shadcn/ui and Radix UI primitives:

- **Button** - Primary, secondary, outline, ghost variants
- **Card** - Container with header, content, footer sections
- **Table** - Data tables with headers and rows
- **Input** - Form text inputs with labels
- **Badge** - Status indicators and tags
- **Tabs** - Tabbed interfaces
- **Dialog** - Modal dialogs
- **Dropdown Menu** - Context menus
- **Avatar** - User profile images
- **Progress** - Progress bars
- **Scroll Area** - Scrollable containers
- **Switch** - Toggle switches
- **Skeleton** - Loading placeholders
- **Separator** - Visual dividers

### Layout Components
- **Sidebar** - Navigation menu with icons
- **Navbar** - Top bar with notifications and user menu
- **ThemeProvider** - Dark mode context provider

---

## 📊 Mock Data

The application uses comprehensive mock data defined in `lib/mockData.ts`:

### Data Types
```typescript
- Receipt: 10 sample receipts with line items and AI results
- User: 5 sample users with different roles
- Analytics: Dashboard KPI metrics
- Reports: Mock report data for exports
```

### Key Features
- TypeScript interfaces for type safety
- Realistic sample data
- Consistent data relationships
- Easy to extend or replace with real API calls

---

## 🎨 Theming

### Dark Mode
The application includes a complete dark mode implementation:
- Theme toggle in navbar
- System preference detection
- CSS variables for light/dark themes
- Smooth transitions between modes

### Customization
All theme colors are defined in `tailwind.config.js` and `app/globals.css` using CSS variables. You can easily customize:
- Primary colors
- Background colors
- Border colors
- Text colors
- Radius values

---

## 🚦 Development Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## 🔮 Future Integration Points

This mock prototype is designed for easy backend integration:

### 1. **API Integration**
Replace mock data imports with API calls:
```typescript
// Before (Mock)
import { mockReceipts } from "@/lib/mockData"

// After (Real API)
const receipts = await fetch('/api/receipts').then(r => r.json())
```

### 2. **AI Processing**
Add real AI receipt scanning:
- Connect to OCR services (Google Vision, AWS Textract)
- Implement receipt parsing algorithms
- Add confidence scoring
- Store extracted data

### 3. **Authentication**
Implement real auth:
- Add NextAuth.js or similar
- Integrate OAuth providers
- Protect routes with middleware
- Add user session management

### 4. **Database**
Connect to a database:
- PostgreSQL with Prisma ORM
- MongoDB with Mongoose
- Supabase for full-stack solution
- Firebase for real-time features

### 5. **File Storage**
Implement file uploads:
- AWS S3 for receipt images
- Cloudinary for image optimization
- Azure Blob Storage
- Direct upload endpoints

### 6. **Payment Processing**
Add billing functionality:
- Stripe integration for subscriptions
- PayPal support
- Usage tracking
- Invoice generation

---

## 🎓 Learning Resources

### Key Concepts Used
- **Next.js App Router** - File-based routing with layouts
- **React Server Components** - Server-side rendering
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS
- **Radix UI** - Accessible component primitives
- **Component Composition** - Building complex UIs from simple parts

### Recommended Reading
- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

---

## 🤝 Contributing

This is a prototype project, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📝 License

MIT License - feel free to use this project as a foundation for your own applications.

---

## 🙏 Acknowledgments

- **shadcn/ui** - For the excellent component library
- **Radix UI** - For accessible primitives
- **Vercel** - For Next.js framework
- **TailwindCSS** - For utility-first styling

---

## 📧 Contact

For questions or feedback about this prototype, please open an issue in the repository.

---

**Built with ❤️ using Next.js, TypeScript, and shadcn/ui**
