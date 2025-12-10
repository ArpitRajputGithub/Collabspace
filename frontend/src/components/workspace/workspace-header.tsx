"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Users, Calendar, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { EditWorkspaceModal } from '@/components/modals/edit-workspace-modal'
import type { Workspace } from '@/lib/api-client'

interface WorkspaceHeaderProps {
  workspace: Workspace
  userRole?: 'owner' | 'admin' | 'member' | 'guest'
  canEditWorkspace?: boolean
}

export function WorkspaceHeader({ workspace, userRole, canEditWorkspace = false }: WorkspaceHeaderProps) {
  const [editModalOpen, setEditModalOpen] = useState(false)

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'admin':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'member':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-800/30 to-gray-900/30 border border-gray-700/30 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]" />
        
        <CardContent className="relative p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-white">{workspace.name}</h1>
                <Badge className={`border-white/20 ${getRoleBadgeColor(userRole || 'member')}`}>
                  {userRole?.toUpperCase() || 'MEMBER'}
                </Badge>
              </div>
              {workspace.description && (
                <p className="text-gray-300 text-lg max-w-3xl">
                  {workspace.description}
                </p>
              )}
              {!workspace.description && (
                <p className="text-gray-400 text-sm italic">
                  No description provided
                </p>
              )}
            </div>

            {canEditWorkspace && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditModalOpen(true)}
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Members</p>
                <p className="text-2xl font-bold text-white">
                  {workspace.memberCount || workspace.members?.length || 0}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Created</p>
                <p className="text-lg font-semibold text-white">
                  {new Date(workspace.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Slug</p>
                <p className="text-lg font-semibold text-white font-mono">
                  {workspace.slug}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </motion.div>

      <EditWorkspaceModal 
        workspace={workspace} 
        open={editModalOpen} 
        onOpenChange={setEditModalOpen} 
      />
    </>
  )
}

