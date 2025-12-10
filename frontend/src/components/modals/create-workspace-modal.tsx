"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface NewWorkspaceForm {
  name: string
  slug: string
  description?: string
}

interface CreateWorkspaceModalProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function CreateWorkspaceModal({ 
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange,
  trigger 
}: CreateWorkspaceModalProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const { createWorkspace, isCreating } = useWorkspaces()
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewWorkspaceForm>({
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  })

  // Helper to generate slug from name if user wants
  const generateSlug = (name: string) =>
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start
      .replace(/-+$/, '') // Trim - from end

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = (data: NewWorkspaceForm) => {
    if (!data.slug) {
      data.slug = generateSlug(data.name)
    }

    createWorkspace(data)
    setOpen(false)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg bg-slate-900 border-white/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Enter a name, slug, and optional description for your new workspace.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              {...register('name', { required: true, minLength: 2 })}
              placeholder="Example: Design Team"
              disabled={isCreating}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">Name is required (min 2 chars)</p>}
          </div>

          <div>
            <Label htmlFor="slug">Slug (unique identifier)</Label>
            <Input
              id="slug"
              {...register('slug', { minLength: 2 })}
              placeholder="Example: design-team"
              disabled={isCreating}
            />
            {errors.slug && <p className="text-red-400 text-xs mt-1">Slug must be at least 2 characters</p>}
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Input id="description" {...register('description')} placeholder="E.g., Team responsible for UI/UX designs" disabled={isCreating} />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isCreating} className="w-full">
              {isCreating ? 'Creating...' : 'Create Workspace'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
