"use client"

import { useQuery } from '@tanstack/react-query'
import { apiClient, type DashboardStats } from '@/lib/api-client'
import { useAuth } from '@/hooks/use-auth'

export function useDashboardStats() {
    const { user } = useAuth()

    const statsQuery = useQuery({
        queryKey: ['dashboard', 'stats'],
        queryFn: () => apiClient.getDashboardStats(),
        enabled: !!user, // Only fetch when user is authenticated
        staleTime: 60 * 1000, // 1 minute - dashboard stats don't change too frequently
        retry: 3,
    })

    return {
        // Data
        stats: statsQuery.data || {
            activeTodayCount: 0,
            weeklyActionsCount: 0,
            totalAssignedTasks: 0,
            completedTasks: 0,
            completionRate: 0,
        },

        // Loading states
        isLoading: statsQuery.isLoading,
        isError: statsQuery.isError,
        error: statsQuery.error,

        // Manual refresh
        refetch: statsQuery.refetch,
    }
}
