"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, type Project, type ProjectDetailResponse } from '@/lib/api-client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export function useProjects(workspaceId: string) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Fetch projects from backend
  const projectsQuery = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => apiClient.getWorkspaceProjects(workspaceId),
    enabled: !!workspaceId && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  })

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      color?: string
      startDate?: string
      endDate?: string
    }) => apiClient.createProject(workspaceId, data),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] })
      toast.success('Project created!', {
        description: `${newProject.name} is ready.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to create project', {
        description: error.message,
      })
    },
  })

  return {
    // Data
    projects: projectsQuery.data || [],
    
    // Loading states
    isLoading: projectsQuery.isLoading,
    isError: projectsQuery.isError,
    error: projectsQuery.error,
    
    // Actions
    createProject: createProjectMutation.mutate,
    
    // Mutation states
    isCreating: createProjectMutation.isPending,
    
    // Manual refresh
    refetch: projectsQuery.refetch,
  }
}

export function useProject(projectId: string) {
  const queryClient = useQueryClient()
  const queryKey = ['project', projectId]
  const { user } = useAuth()

  // Fetch project details
  const projectQuery = useQuery({
    queryKey,
    queryFn: () => apiClient.getProject(projectId),
    enabled: !!projectId && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      if (error?.message?.includes('Authentication') || error?.message?.includes('Unauthenticated')) {
        return false
      }
      return failureCount < 3
    },
  })

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: (data: {
      name?: string
      description?: string
      color?: string
      status?: string
    }) => apiClient.updateProject(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update project', {
        description: error.message,
      })
    },
  })

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: () => apiClient.deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to delete project', {
        description: error.message,
      })
    },
  })

  const project = projectQuery.data?.project
  const statistics = projectQuery.data?.statistics
  const taskStatuses = projectQuery.data?.taskStatuses || []

  return {
    // Data
    project,
    statistics,
    taskStatuses,
    
    // Loading states
    isLoading: projectQuery.isLoading,
    isError: projectQuery.isError,
    error: projectQuery.error,
    
    // Actions
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    
    // Mutation states
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
    
    // Manual refresh
    refetch: projectQuery.refetch,
  }
}







