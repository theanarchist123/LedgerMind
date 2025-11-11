"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Receipt, 
  Upload, 
  FileText, 
  CreditCard, 
  Settings,
  Users
} from "lucide-react"
import { cn } from "@/lib/utils"

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/app/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Receipts",
    icon: Receipt,
    href: "/app/receipts",
    color: "text-violet-500",
  },
  {
    label: "Upload",
    icon: Upload,
    href: "/app/upload",
    color: "text-pink-700",
  },
  {
    label: "Reports",
    icon: FileText,
    href: "/app/reports",
    color: "text-orange-700",
  },
  {
    label: "Billing",
    icon: CreditCard,
    href: "/app/billing",
    color: "text-emerald-500",
  },
  {
    label: "Admin",
    icon: Users,
    href: "/admin",
    color: "text-red-500",
  },
]

/**
 * Sidebar component for app navigation
 */
export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-card border-r">
      <div className="px-3 py-2 flex-1">
        <Link href="/app/dashboard" className="flex items-center pl-3 mb-14">
          <div className="relative w-8 h-8 mr-4">
            <div className="absolute inset-0 bg-primary rounded-lg" />
          </div>
          <h1 className="text-xl font-bold">
            LedgerMind
          </h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                pathname === route.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 py-2">
        <Link
          href="/settings"
          className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition text-muted-foreground"
        >
          <div className="flex items-center flex-1">
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </div>
        </Link>
      </div>
    </div>
  )
}
