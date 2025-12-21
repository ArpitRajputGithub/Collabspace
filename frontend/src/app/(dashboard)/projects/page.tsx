"use client"

import { useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Plus, FolderKanban, Users, Calendar, MoreHorizontal, Building2, ArrowLeft, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useProjects } from '@/hooks/use-projects'
import { useWorkspace, useWorkspaces } from '@/hooks/use-workspaces'
import { CreateProjectModal } from '@/components/modals/create-project-modal'

function ProjectsContent() {
  const searchParams = useSearchParams()
  const workspaceSlug = searchParams.get('workspace') || ''
  const [createModalOpen, setCreateModalOpen] = useState(false)
  
  // Get all workspaces for selection
  const { workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces()
  
  // Get workspace to get workspaceId
  const { workspace, isLoading: isLoadingWorkspace } = useWorkspace(workspaceSlug)
  const workspaceId = workspace?.id || ''
  
  // Get projects for this workspace
  const { projects, isLoading, isError } = useProjects(workspaceId)
  
  // Check if workspace is ready
  const isWorkspaceReady = !!workspaceId && !isLoadingWorkspace

  // Show workspace selection when no workspace is selected
  if (!workspaceSlug) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Select a workspace to view projects
          </p>
        </div>

        {/* Workspace Selection Grid */}
        {isLoadingWorkspaces ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="rounded-full border border-dashed border-muted-foreground/25 p-6 mb-4 mx-auto w-fit">
                <Building2 className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <h3 className="text-lg font-medium mb-2">No workspaces available</h3>
              <p className="text-muted-foreground mb-4">
                You don't have access to any workspaces yet. Create a workspace to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((ws, index) => (
              <motion.div
                key={ws.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/projects?workspace=${ws.slug}`}>
                  <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={ws.avatarUrl} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                              {ws.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="group-hover:text-primary transition-colors">
                              {ws.name}
                            </CardTitle>
                            <CardDescription className="line-clamp-2 mt-1">
                              {ws.description || 'No description'}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {ws.role}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{ws.memberCount || 0} members</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FolderKanban className="h-4 w-4" />
                          <span>View projects</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Show loading while workspace or projects are loading
  if (isLoadingWorkspace || (isLoading && workspaceId)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">
            {isLoadingWorkspace ? 'Loading workspace...' : 'Loading projects...'}
          </p>
        </div>
      </div>
    )
  }

  // Show error if workspace failed to load
  if (!workspace && workspaceSlug) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-destructive">Workspace not found</p>
          <p className="text-muted-foreground text-sm">
            The workspace "{workspaceSlug}" could not be found or you don't have access.
          </p>
          <Link href="/projects">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workspaces
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Show error if projects failed to load (but workspace is valid)
  if (isError && workspaceId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <p className="text-destructive">Failed to load projects</p>
          <p className="text-muted-foreground text-sm">
            There was an error loading projects for this workspace.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your team's projects and track progress
          </p>
        </div>
        
        <CreateProjectModal
          workspaceId={workspaceId}
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          trigger={
            <Button disabled={!isWorkspaceReady || isLoading}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          }
        />
      </div>

      {/* Project Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <CreateProjectModal
              workspaceId={workspaceId}
              open={createModalOpen}
              onOpenChange={setCreateModalOpen}
              trigger={
                <Button disabled={!isWorkspaceReady || isLoading}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first project
                </Button>
              }
            />
          </div>
        ) : (
          projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/projects/${project.id}`}>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: project.color }}
                      />
                      <div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {project.description || 'No description'}
                        </CardDescription>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    {project.taskCount !== undefined && project.completedTasks !== undefined && project.taskCount > 0 && (
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {Math.round((project.completedTasks / project.taskCount) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full transition-all duration-300 rounded-full"
                            style={{ 
                              width: `${(project.completedTasks / project.taskCount) * 100}%`,
                              backgroundColor: project.color || '#8b5cf6'
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <FolderKanban className="h-3 w-3" />
                          <span>{project.taskCount || 0} tasks</span>
                        </div>
                      </div>
                      
                      {project.endDate && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(project.endDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))
        )}
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <ProjectsContent />
    </Suspense>
  )
}
