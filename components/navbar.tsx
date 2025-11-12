"use client"

import { Bell, Moon, Sun } from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "@/components/theme-provider"
import { useSession, authClient } from "@/lib/auth-client"

/**
 * Navbar component with user menu and theme toggle
 */
export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { data: session } = useSession()
  const router = useRouter()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  // Default user if not logged in
  const displayUser = session?.user || {
    name: "Guest User",
    email: "guest@ledgermind.com",
    image: undefined,
  }

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="ml-auto flex items-center space-x-4">
          {/* Theme toggle */}
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch
              checked={theme === "dark"}
              onCheckedChange={toggleTheme}
            />
            <Moon className="h-4 w-4" />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src={displayUser.image || ""} alt={displayUser.name} />
                  <AvatarFallback>{getInitials(displayUser.name)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {displayUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem>
                Billing
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
