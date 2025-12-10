"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, MoreVertical, Crown, Shield, User, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InviteMemberModal } from '@/components/modals/invite-member-modal'
import { UpdateMemberRoleModal } from '@/components/modals/update-member-role-modal'
import { useWorkspace } from '@/hooks/use-workspaces'
import type { Workspace, WorkspaceMember } from '@/lib/api-client'

interface WorkspaceMembersProps {
  workspace: Workspace
}

export function WorkspaceMembers({ workspace }: WorkspaceMembersProps) {
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [updateRoleModalOpen, setUpdateRoleModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<WorkspaceMember | null>(null)

  const { 
    canManageMembers, 
    removeMember, 
    isRemoving 
  } = useWorkspace(workspace.slug)

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3 w-3" />
      case 'admin':
        return <Shield className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

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

  const handleUpdateRole = (member: WorkspaceMember) => {
    setSelectedMember(member)
    setUpdateRoleModalOpen(true)
  }

  const handleRemoveMember = async (member: WorkspaceMember) => {
    if (window.confirm(`Are you sure you want to remove ${member.firstName} ${member.lastName} from this workspace?`)) {
      removeMember(member.id)
    }
  }

  const members = workspace.members || []

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="bg-white/5 backdrop-blur-xl border-white/20">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-white">Members</CardTitle>
                <p className="text-sm text-gray-400">
                  {members.length} {members.length === 1 ? 'member' : 'members'}
                </p>
              </div>
            </div>
            {canManageMembers && (
              <Button
                size="sm"
                onClick={() => setInviteModalOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No members yet</p>
                {canManageMembers && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setInviteModalOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Invite First Member
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                          {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-white">
                            {member.firstName} {member.lastName}
                          </p>
                          <Badge className={`text-xs ${getRoleBadgeColor(member.role)}`}>
                            <span className="mr-1">{getRoleIcon(member.role)}</span>
                            {member.role.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        {member.joinedAt && (
                          <p className="text-xs text-gray-500 mt-1">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {canManageMembers && member.role !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-slate-800/95 backdrop-blur-xl border-white/20">
                          <DropdownMenuItem
                            className="text-gray-300 focus:bg-white/10 focus:text-white cursor-pointer"
                            onClick={() => handleUpdateRole(member)}
                          >
                            Update Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-white/20" />
                          <DropdownMenuItem
                            className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
                            onClick={() => handleRemoveMember(member)}
                            disabled={isRemoving}
                          >
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <InviteMemberModal 
        workspace={workspace}
        open={inviteModalOpen} 
        onOpenChange={setInviteModalOpen} 
      />

      {selectedMember && (
        <UpdateMemberRoleModal
          workspace={workspace}
          member={selectedMember}
          open={updateRoleModalOpen}
          onOpenChange={setUpdateRoleModalOpen}
        />
      )}
    </>
  )
}

