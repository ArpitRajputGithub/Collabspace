"use client"

import { useEffect } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import type { Workspace } from '@/lib/api-client'

interface EditWorkspaceModalProps {
  workspace: Workspace
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface WorkspaceForm {
  name: string
  description?: string
}

export function EditWorkspaceModal({ workspace, open, onOpenChange }: EditWorkspaceModalProps) {
  const { updateWorkspace, isUpdating } = useWorkspace(workspace.slug)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WorkspaceForm>({
    defaultValues: {
      name: workspace.name,
      description: workspace.description || '',
    },
  })

  // Reset form when modal opens/closes or workspace changes
  useEffect(() => {
    if (open) {
      reset({
        name: workspace.name,
        description: workspace.description || '',
      })
    }
  }, [open, workspace, reset])

  const onSubmit = (data: WorkspaceForm) => {
    updateWorkspace({
      name: data.name,
      description: data.description || undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-slate-900 border-white/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Workspace</DialogTitle>
          <DialogDescription className="text-gray-400">
            Update your workspace name and description.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-white">Workspace Name</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
              placeholder="Example: Design Team"
              disabled={isUpdating}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description (optional)</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="E.g., Team responsible for UI/UX designs"
              disabled={isUpdating}
              className="bg-white/5 border-white/20 text-white placeholder:text-gray-400 resize-none"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isUpdating}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {isUpdating ? 'Updating...' : 'Update Workspace'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

