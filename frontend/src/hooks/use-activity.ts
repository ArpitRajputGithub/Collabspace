"use client"

import { useQuery } from '@tanstack/react-query'
import { apiClient, type Activity } from '@/lib/api-client'

export function useRecentActivity(limit: number = 20) {
    const activityQuery = useQuery({
        queryKey: ['activity', 'recent', limit],
        queryFn: () => apiClient.getRecentActivity(limit),
        staleTime: 30 * 1000, // 30 seconds - activities are frequently updated
        retry: 3,
    })

    return {
        // Data
        activities: activityQuery.data || [],

        // Loading states
        isLoading: activityQuery.isLoading,
        isError: activityQuery.isError,
        error: activityQuery.error,

        // Manual refresh
        refetch: activityQuery.refetch,
    }
}

export function useWorkspaceActivity(workspaceId: string, limit: number = 50) {
    const activityQuery = useQuery({
        queryKey: ['activity', 'workspace', workspaceId, limit],
        queryFn: () => apiClient.getWorkspaceActivity(workspaceId, limit),
        enabled: !!workspaceId, // Only fetch when we have a workspace ID
        staleTime: 30 * 1000, // 30 seconds
        retry: 3,
    })

    return {
        // Data
        activities: activityQuery.data || [],

        // Loading states
        isLoading: activityQuery.isLoading,
        isError: activityQuery.isError,
        error: activityQuery.error,

        // Manual refresh
        refetch: activityQuery.refetch,
    }
}
