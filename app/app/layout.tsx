import { Sidebar } from "@/components/sidebar"
import { Navbar } from "@/components/navbar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AuthGuard } from "@/components/auth-guard"

/**
 * Shared layout for all app pages (/app/*)
 * Includes sidebar, navbar, and scrollable content area
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="h-screen flex">
        {/* Sidebar */}
        <div className="hidden md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-50">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 md:pl-72">
          <Navbar />
          <ScrollArea className="flex-1">
            <main className="flex-1 p-8 pt-6">
              {children}
            </main>
          </ScrollArea>
        </div>
      </div>
    </AuthGuard>
  )
}
