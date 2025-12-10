"use client"

// Re-export from the auth provider for backward compatibility
// Components that were using the old use-auth hook will still work

import { useAuth as useAuthProvider } from '@/providers/auth-provider'
import { useQuery } from '@tanstack/react-query'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9000/api'

export function useAuth() {
  const auth = useAuthProvider()

  // Fetch backend profile after login
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!auth.token) throw new Error('No token')

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch profile')
      }

      const data = await response.json()
      return data.data
    },
    enabled: !!auth.token && auth.isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  })

  return {
    // User data from auth context
    user: auth.user,
    isLoaded: !auth.isLoading,

    // Backend connection status
    backendUser: profileQuery.data,
    isConnectedToBackend: auth.isAuthenticated,
    isConnecting: auth.isLoading,
    connectionError: null,

    // Profile data
    profile: profileQuery.data,
    isLoadingProfile: profileQuery.isLoading,

    // Actions
    retryConnection: auth.refreshToken,
    logout: auth.logout,

    // Combined loading state
    isReady: auth.isAuthenticated && !auth.isLoading,

    // Auth context methods
    login: auth.login,
    register: auth.register,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
  }
}
