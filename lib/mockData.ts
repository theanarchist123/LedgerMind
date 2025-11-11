/**
 * Mock data types for LedgerMind
 */

export type ReceiptStatus = "completed" | "needs_review" | "processing" | "failed";
export type ReceiptCategory = "Food" | "Transport" | "Office" | "Entertainment" | "Utilities" | "Other";
export type UserRole = "user" | "admin";
export type PlanTier = "free" | "pro" | "business";

export interface Receipt {
  id: string;
  merchant: string;
  date: string;
  total: number;
  category: ReceiptCategory;
  status: ReceiptStatus;
  confidence?: number;
  imageUrl?: string;
  lineItems?: LineItem[];
  aiResults?: AIAnalysisResult;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface AIAnalysisResult {
  merchant: string;
  date: string;
  total: number;
  currency: string;
  items: string[];
  confidence: number;
  rawText: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  plan: PlanTier;
  createdAt: string;
}

export interface Analytics {
  totalSpent: number;
  receiptsProcessed: number;
  averageConfidence: number;
  categoriesCount: number;
  monthlyTrend: MonthlyData[];
  categoryBreakdown: CategoryData[];
}

export interface MonthlyData {
  month: string;
  amount: number;
  count: number;
}

export interface CategoryData {
  category: ReceiptCategory;
  amount: number;
  count: number;
  percentage: number;
}

export interface AdminLogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  status: "success" | "error" | "warning";
}

/**
 * Mock receipts data
 */
export const mockReceipts: Receipt[] = [
  {
    id: "r1",
    merchant: "BlueBottle Coffee",
    date: "2025-03-14",
    total: 6.75,
    category: "Food",
    status: "completed",
    confidence: 98,
    imageUrl: "/receipts/coffee.jpg",
  },
  {
    id: "r2",
    merchant: "City Parking",
    date: "2025-03-10",
    total: 12.0,
    category: "Transport",
    status: "needs_review",
    confidence: 85,
  },
  {
    id: "r3",
    merchant: "OfficeSupply Co.",
    date: "2025-02-22",
    total: 58.3,
    category: "Office",
    status: "completed",
    confidence: 96,
  },
  {
    id: "r4",
    merchant: "FastFood Express",
    date: "2025-03-05",
    total: 15.99,
    category: "Food",
    status: "completed",
    confidence: 92,
  },
  {
    id: "r5",
    merchant: "Metro Transit",
    date: "2025-03-01",
    total: 45.0,
    category: "Transport",
    status: "completed",
    confidence: 99,
  },
  {
    id: "r6",
    merchant: "Tech Conference 2025",
    date: "2025-02-15",
    total: 299.0,
    category: "Entertainment",
    status: "completed",
    confidence: 94,
  },
  {
    id: "r7",
    merchant: "Electric Company",
    date: "2025-02-01",
    total: 87.45,
    category: "Utilities",
    status: "completed",
    confidence: 97,
  },
  {
    id: "r8",
    merchant: "Corner Grocery",
    date: "2025-03-12",
    total: 42.18,
    category: "Food",
    status: "processing",
    confidence: 88,
  },
];

/**
 * Mock line items for detailed receipt view
 */
export const mockLineItems: Record<string, LineItem[]> = {
  r1: [
    { id: "l1", description: "Latte", quantity: 1, price: 5.5, total: 5.5 },
    { id: "l2", description: "Croissant", quantity: 1, price: 1.25, total: 1.25 },
  ],
  r3: [
    { id: "l3", description: "Paper Reams (5)", quantity: 5, price: 8.5, total: 42.5 },
    { id: "l4", description: "Stapler", quantity: 2, price: 7.9, total: 15.8 },
  ],
};

/**
 * Mock AI analysis results
 */
export const mockAIResults: Record<string, AIAnalysisResult> = {
  r1: {
    merchant: "BlueBottle Coffee",
    date: "2025-03-14",
    total: 6.75,
    currency: "USD",
    items: ["Latte", "Croissant"],
    confidence: 98,
    rawText: "BLUEBOTTLE COFFEE\n123 Main St\nCity, ST 12345\n\nLatte        $5.50\nCroissant    $1.25\n\nSubtotal     $6.75\nTax          $0.00\nTotal        $6.75\n\nThank you!",
  },
};

/**
 * Mock users data
 */
export const mockUsers: User[] = [
  {
    id: "u1",
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatars/john.jpg",
    role: "admin",
    plan: "business",
    createdAt: "2024-01-15",
  },
  {
    id: "u2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    plan: "pro",
    createdAt: "2024-06-20",
  },
  {
    id: "u3",
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "user",
    plan: "free",
    createdAt: "2024-11-01",
  },
];

/**
 * Mock analytics data
 */
export const mockAnalytics: Analytics = {
  totalSpent: 567.67,
  receiptsProcessed: 8,
  averageConfidence: 94,
  categoriesCount: 6,
  monthlyTrend: [
    { month: "Jan", amount: 125.5, count: 12 },
    { month: "Feb", amount: 443.75, count: 18 },
    { month: "Mar", amount: 82.42, count: 5 },
  ],
  categoryBreakdown: [
    { category: "Food", amount: 64.92, count: 3, percentage: 11.4 },
    { category: "Transport", amount: 57.0, count: 2, percentage: 10.0 },
    { category: "Office", amount: 58.3, count: 1, percentage: 10.3 },
    { category: "Entertainment", amount: 299.0, count: 1, percentage: 52.7 },
    { category: "Utilities", amount: 87.45, count: 1, percentage: 15.4 },
    { category: "Other", amount: 0, count: 0, percentage: 0 },
  ],
};

/**
 * Mock admin logs
 */
export const mockAdminLogs: AdminLogEntry[] = [
  {
    id: "log1",
    timestamp: "2025-03-14 10:23:15",
    user: "john@example.com",
    action: "Receipt uploaded",
    status: "success",
  },
  {
    id: "log2",
    timestamp: "2025-03-14 09:15:42",
    user: "jane@example.com",
    action: "Category updated",
    status: "success",
  },
  {
    id: "log3",
    timestamp: "2025-03-13 18:45:10",
    user: "bob@example.com",
    action: "Failed authentication",
    status: "error",
  },
  {
    id: "log4",
    timestamp: "2025-03-13 16:30:05",
    user: "john@example.com",
    action: "Bulk export initiated",
    status: "success",
  },
];

/**
 * Helper function to get receipt by ID
 */
export function getReceiptById(id: string): Receipt | undefined {
  return mockReceipts.find(receipt => receipt.id === id);
}

/**
 * Helper function to get line items for a receipt
 */
export function getLineItemsByReceiptId(receiptId: string): LineItem[] {
  return mockLineItems[receiptId] || [];
}

/**
 * Helper function to get AI results for a receipt
 */
export function getAIResultsByReceiptId(receiptId: string): AIAnalysisResult | undefined {
  return mockAIResults[receiptId];
}

/**
 * Mock current user
 */
export const mockCurrentUser: User = mockUsers[0];
