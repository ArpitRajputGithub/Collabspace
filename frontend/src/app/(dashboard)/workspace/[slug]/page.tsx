"use client"

import { use } from 'react'
import { useWorkspace } from '@/hooks/use-workspaces'
import { WorkspaceHeader } from '@/components/workspace/workspace-header'
import { WorkspaceMembers } from '@/components/workspace/workspace-members'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

export default function WorkspacePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const { workspace, isLoading, error, userRole, canEditWorkspace } = useWorkspace(resolvedParams.slug)

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error || !workspace) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8">
          <h2 className="text-xl font-semibold mb-2">Workspace not found</h2>
          <p className="text-muted-foreground">
            {error?.message || 'The workspace you are looking for does not exist or you do not have access to it.'}
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <WorkspaceHeader 
        workspace={workspace} 
        userRole={userRole}
        canEditWorkspace={canEditWorkspace}
      />
      <WorkspaceMembers workspace={workspace} />
    </div>
  )
}

