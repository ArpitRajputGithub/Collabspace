"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  avatarUrl?: string
  emailVerified: boolean
  isActive: boolean
  lastLoginAt?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshToken: () => Promise<boolean>
}

interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Load token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      apiClient.setToken(storedToken) // Sync token to api-client
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        console.error('Failed to parse stored user:', e)
        localStorage.removeItem('auth_user')
      }
    }
    setIsLoading(false)
  }, [])

  // Login function
  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' }
      }

      // Store token and user
      const { token: newToken, user: userData } = data.data
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      setToken(newToken)
      apiClient.setToken(newToken) // Sync token to api-client
      setUser(userData)

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }, [])

  // Register function
  const register = useCallback(async (registerData: RegisterData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' }
      }

      // Store token and user
      const { token: newToken, user: userData } = data.data
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('auth_user', JSON.stringify(userData))
      setToken(newToken)
      apiClient.setToken(newToken) // Sync token to api-client
      setUser(userData)

      return { success: true }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, error: 'Network error. Please try again.' }
    }
  }, [])

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
    router.push('/sign-in')
  }, [router])

  // Refresh token function
  const refreshToken = useCallback(async () => {
    try {
      const currentToken = localStorage.getItem('auth_token')
      if (!currentToken) return false

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: currentToken }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        logout()
        return false
      }

      const newToken = data.data.token
      localStorage.setItem('auth_token', newToken)
      setToken(newToken)
      return true
    } catch (error) {
      console.error('Token refresh error:', error)
      logout()
      return false
    }
  }, [logout])

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
