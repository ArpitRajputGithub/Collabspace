"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Workspace } from '@/lib/api-client'

interface InviteMemberModalProps {
  workspace: Workspace
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface InviteForm {
  email: string
  role: 'admin' | 'member' | 'guest'
}

export function InviteMemberModal({ workspace, open, onOpenChange }: InviteMemberModalProps) {
  const { inviteMember, isInviting } = useWorkspace(workspace.slug)
  const [role, setRole] = useState<'admin' | 'member' | 'guest'>('member')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<InviteForm>({
    defaultValues: {
      email: '',
      role: 'member',
    },
  })

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset()
      setRole('member')
    }
  }, [open, reset])

  const onSubmit = (data: InviteForm) => {
    inviteMember({
      email: data.email,
      role: role,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-white/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white">Invite Member</DialogTitle>
          <DialogDescription className="text-gray-400">
            Invite a user to join this workspace by their email address.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-white">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              placeholder="user@example.com"
              disabled={isInviting}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="role" className="text-white">Role</Label>
            <Select value={role} onValueChange={(value: 'admin' | 'member' | 'guest') => {
              setRole(value)
              setValue('role', value)
            }}>
              <SelectTrigger 
                id="role"
                disabled={isInviting}
                className="bg-white/5 border-white/20 text-white"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="member" className="text-white hover:bg-white/10">Member</SelectItem>
                <SelectItem value="admin" className="text-white hover:bg-white/10">Admin</SelectItem>
                <SelectItem value="guest" className="text-white hover:bg-white/10">Guest</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-400 mt-1">
              Members can view and participate. Admins can manage members and settings.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isInviting}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isInviting}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isInviting ? 'Inviting...' : 'Invite Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

