"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, FolderKanban, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { Skeleton } from '@/components/ui/skeleton'

export function WorkspaceGrid() {
  const { workspaces, isLoading } = useWorkspaces()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Existing Workspaces */}
        {workspaces.map((workspace, index) => (
          <motion.div
            key={workspace.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: (index + 1) * 0.1 }}
          >
            <Link href={`/workspace/${workspace.slug}`}>
              <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={workspace.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {workspace.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="group-hover:text-primary transition-colors">
                          {workspace.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {workspace.description || 'No description provided'}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {workspace.role}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{workspace.memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FolderKanban className="h-4 w-4" />
                        <span>{workspace.projectCount || 0} projects</span>
                      </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        Active {new Date(workspace.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Progress Bar - Use real task progress from backend */}
                    {workspace.taskProgress !== undefined && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Team Progress</span>
                          <span className="text-muted-foreground">{workspace.taskProgress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full transition-all duration-300"
                            style={{ width: `${workspace.taskProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {workspaces.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="max-w-md mx-auto">
            <div className="rounded-full border border-dashed border-muted-foreground/25 p-6 mb-4 mx-auto w-fit">
              <FolderKanban className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium mb-2">No workspaces yet</h3>
            <p className="text-muted-foreground">
              You don't have any workspaces yet. Use the Create button in the top bar to get started.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
