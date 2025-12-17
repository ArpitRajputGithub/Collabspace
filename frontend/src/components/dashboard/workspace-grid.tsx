"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, FolderKanban, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { Skeleton } from '@/components/ui/skeleton'

export function WorkspaceGrid() {
  const { workspaces, isLoading } = useWorkspaces()

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (workspaces.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-card border-border border-dashed">
          <CardContent className="py-12 text-center">
            <div 
              className="w-12 h-12 rounded-lg mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: '#F1EFEC' }}
            >
              <FolderKanban className="h-6 w-6" style={{ color: '#123458' }} />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">No workspaces yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Create your first workspace to start collaborating with your team.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {workspaces.map((workspace, index) => (
        <motion.div
          key={workspace.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Link href={`/workspace/${workspace.slug}`}>
            <Card className="bg-card border-border hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={workspace.avatarUrl} />
                      <AvatarFallback 
                        className="text-white font-medium"
                        style={{ backgroundColor: '#123458' }}
                      >
                        {workspace.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {workspace.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {workspace.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {workspace.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      <span>{workspace.memberCount} members</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FolderKanban className="h-3.5 w-3.5" />
                      <span>{workspace.projectCount || 0} projects</span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

