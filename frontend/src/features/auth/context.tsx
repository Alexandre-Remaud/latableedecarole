import { useState, useEffect, type ReactNode } from "react"
import type { User } from "./contract"
import { authApi } from "./api"
import { AuthContext } from "./context"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const userData = await authApi.getProfile()
      setUser({
        _id: userData._id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      } as User)
    } catch {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function login(email: string, password: string) {
    const response = await authApi.login({ email, password })
    setUser(response.user)
  }

  async function register(email: string, password: string, name: string) {
    const response = await authApi.register({ email, password, name })
    setUser(response.user)
  }

  async function logout() {
    await authApi.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout } as AuthContextType}>
      {children}
    </AuthContext.Provider>
  )
}
