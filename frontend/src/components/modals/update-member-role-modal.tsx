"use client"

import { useState, useEffect } from 'react'
import { useWorkspace } from '@/hooks/use-workspaces'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Workspace, WorkspaceMember } from '@/lib/api-client'

interface UpdateMemberRoleModalProps {
  workspace: Workspace
  member: WorkspaceMember
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UpdateMemberRoleModal({ workspace, member, open, onOpenChange }: UpdateMemberRoleModalProps) {
  const { updateMemberRole, isUpdatingRole } = useWorkspace(workspace.slug)
  const [role, setRole] = useState<'admin' | 'member' | 'guest'>(member.role as 'admin' | 'member' | 'guest')

  // Reset role when member changes
  useEffect(() => {
    if (open && member) {
      setRole(member.role as 'admin' | 'member' | 'guest')
    }
  }, [open, member])

  const handleSubmit = () => {
    if (role !== member.role) {
      updateMemberRole({
        memberId: member.id,
        role: role,
      })
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-white/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white">Update Member Role</DialogTitle>
          <DialogDescription className="text-gray-400">
            Change the role for {member.firstName} {member.lastName}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-white">Current Role</Label>
            <p className="text-sm text-gray-400 mt-1 capitalize">{member.role}</p>
          </div>

          <div>
            <Label htmlFor="role" className="text-white">New Role</Label>
            <Select 
              value={role} 
              onValueChange={(value: 'admin' | 'member' | 'guest') => setRole(value)}
              disabled={member.role === 'owner' || isUpdatingRole}
            >
              <SelectTrigger 
                id="role"
                className="bg-white/5 border-white/20 text-white"
                disabled={member.role === 'owner' || isUpdatingRole}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                {member.role !== 'owner' && (
                  <>
                    <SelectItem value="member" className="text-white hover:bg-white/10">Member</SelectItem>
                    <SelectItem value="admin" className="text-white hover:bg-white/10">Admin</SelectItem>
                    <SelectItem value="guest" className="text-white hover:bg-white/10">Guest</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            {member.role === 'owner' && (
              <p className="text-xs text-yellow-400 mt-1">
                Cannot change the role of workspace owner.
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Members can view and participate. Admins can manage members and settings.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isUpdatingRole}
            className="bg-white/5 border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isUpdatingRole || member.role === 'owner' || role === member.role}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isUpdatingRole ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

