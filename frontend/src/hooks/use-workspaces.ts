"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, type Workspace, type WorkspaceDetailResponse, type WorkspaceMember } from '@/lib/api-client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export function useWorkspaces() {
  const queryClient = useQueryClient()

  // Fetch workspaces from backend
  const workspacesQuery = useQuery({
    queryKey: ['workspaces'],
    queryFn: () => apiClient.getWorkspaces(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 3,
  })

  // Create workspace mutation
  const createWorkspaceMutation = useMutation({
    mutationFn: (data: {
      name: string
      description?: string
      slug: string
    }) => apiClient.createWorkspace(data),
    onSuccess: (newWorkspace) => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      toast.success('Workspace created!', {
        description: `${newWorkspace.name} is ready for collaboration.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to create workspace', {
        description: error.message,
      })
    },
  })

  return {
    // Data
    workspaces: workspacesQuery.data || [],
    
    // Loading states
    isLoading: workspacesQuery.isLoading,
    isError: workspacesQuery.isError,
    error: workspacesQuery.error,
    
    // Actions
    createWorkspace: createWorkspaceMutation.mutate,
    
    // Mutation states
    isCreating: createWorkspaceMutation.isPending,
    
    // Manual refresh
    refetch: workspacesQuery.refetch,
  }
}

export function useWorkspace(slug: string) {
  const queryClient = useQueryClient()
  const queryKey = ['workspace', slug]
  const { workspaces } = useWorkspaces()
  const { user } = useAuth()

  // Find workspace ID from already loaded workspaces
  const existingWorkspace = workspaces.find(ws => ws.slug === slug)

  // Fetch workspace details
  const workspaceQuery = useQuery({
    queryKey,
    queryFn: () => apiClient.getWorkspaceBySlug(slug, existingWorkspace?.id),
    enabled: !!slug && !!user, // Only fetch when we have a user (auth is ready)
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      // Don't retry if it's an auth error
      if (error?.message?.includes('Authentication') || error?.message?.includes('Unauthenticated')) {
        return false
      }
      return failureCount < 3
    },
  })

  // Update workspace mutation
  const updateWorkspaceMutation = useMutation({
    mutationFn: (data: { name?: string; description?: string }) => {
      const workspace = workspaceQuery.data?.data
      if (!workspace) throw new Error('Workspace not loaded')
      return apiClient.updateWorkspace(workspace.id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      toast.success('Workspace updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update workspace', {
        description: error.message,
      })
    },
  })

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: (data: { email: string; role?: 'admin' | 'member' | 'guest' }) => {
      const workspace = workspaceQuery.data?.data
      if (!workspace) throw new Error('Workspace not loaded')
      return apiClient.inviteMember(workspace.id, data)
    },
    onSuccess: (member) => {
      queryClient.invalidateQueries({ queryKey })
      toast.success('Member invited successfully', {
        description: `${member.firstName} ${member.lastName} has been added to the workspace.`,
      })
    },
    onError: (error: Error) => {
      toast.error('Failed to invite member', {
        description: error.message,
      })
    },
  })

  // Update member role mutation
  const updateMemberRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: 'admin' | 'member' | 'guest' }) => {
      const workspace = workspaceQuery.data?.data
      if (!workspace) throw new Error('Workspace not loaded')
      return apiClient.updateMemberRole(workspace.id, memberId, role)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast.success('Member role updated successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to update member role', {
        description: error.message,
      })
    },
  })

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => {
      const workspace = workspaceQuery.data?.data
      if (!workspace) throw new Error('Workspace not loaded')
      return apiClient.removeMember(workspace.id, memberId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      toast.success('Member removed successfully')
    },
    onError: (error: Error) => {
      toast.error('Failed to remove member', {
        description: error.message,
      })
    },
  })

  const workspace = workspaceQuery.data?.data
  const userRole = workspaceQuery.data?.userRole || 'member'

  // Check permissions
  const canManageMembers = userRole === 'owner' || userRole === 'admin'
  const canEditWorkspace = userRole === 'owner' || userRole === 'admin'
  const isOwner = userRole === 'owner'

  return {
    // Data
    workspace,
    userRole,
    
    // Loading states
    isLoading: workspaceQuery.isLoading,
    isError: workspaceQuery.isError,
    error: workspaceQuery.error,
    
    // Permissions
    canManageMembers,
    canEditWorkspace,
    isOwner,
    
    // Actions
    updateWorkspace: updateWorkspaceMutation.mutate,
    inviteMember: inviteMemberMutation.mutate,
    updateMemberRole: updateMemberRoleMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    
    // Mutation states
    isUpdating: updateWorkspaceMutation.isPending,
    isInviting: inviteMemberMutation.isPending,
    isUpdatingRole: updateMemberRoleMutation.isPending,
    isRemoving: removeMemberMutation.isPending,
    
    // Manual refresh
    refetch: workspaceQuery.refetch,
  }
}

