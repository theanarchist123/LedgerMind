"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users database
const MOCK_USERS = [
  {
    id: "user-1",
    name: "John Doe",
    email: "demo@ledgermind.com",
    password: "demo123",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    id: "user-2",
    name: "Admin User",
    email: "admin@ledgermind.com",
    password: "admin123",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Check for stored user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("ledgermind-user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        localStorage.removeItem("ledgermind-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Find matching user
    const matchedUser = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    )

    if (matchedUser) {
      const userData = {
        id: matchedUser.id,
        name: matchedUser.name,
        email: matchedUser.email,
        avatar: matchedUser.avatar,
      }
      setUser(userData)
      localStorage.setItem("ledgermind-user", JSON.stringify(userData))
      return true
    }

    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("ledgermind-user")
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
