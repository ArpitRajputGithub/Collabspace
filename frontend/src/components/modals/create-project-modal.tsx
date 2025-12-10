"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useProjects } from '@/hooks/use-projects'
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
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Palette } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface NewProjectForm {
  name: string
  description?: string
  color?: string
  startDate?: Date
  endDate?: Date
}

interface CreateProjectModalProps {
  workspaceId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

const PROJECT_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
]

export function CreateProjectModal({ 
  workspaceId,
  open: controlledOpen, 
  onOpenChange: controlledOnOpenChange,
  trigger 
}: CreateProjectModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const { createProject, isCreating } = useProjects(workspaceId)
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setOpen = controlledOnOpenChange || setInternalOpen

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<NewProjectForm>({
    defaultValues: {
      name: '',
      description: '',
      color: PROJECT_COLORS[0],
      startDate: undefined,
      endDate: undefined,
    },
  })

  const selectedColor = watch('color')
  const startDate = watch('startDate')
  const endDate = watch('endDate')

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const onSubmit = (data: NewProjectForm) => {
    if (!workspaceId) {
      console.error('Cannot create project: workspaceId is missing')
      return
    }
    
    createProject({
      name: data.name,
      description: data.description || undefined,
      color: data.color || PROJECT_COLORS[0],
      startDate: data.startDate ? format(data.startDate, 'yyyy-MM-dd') : undefined,
      endDate: data.endDate ? format(data.endDate, 'yyyy-MM-dd') : undefined,
    })
    setOpen(false)
    reset()
  }

  // Disable if workspaceId is not available
  const isDisabled = !workspaceId || isCreating

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild disabled={!workspaceId}>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-lg bg-slate-900 border-white/20 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Enter the details for your new project. You can add more details later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Project name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
              placeholder="Example: Website Redesign"
              disabled={isCreating}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              {...register('description', { maxLength: { value: 1000, message: 'Description cannot exceed 1000 characters' } })}
              placeholder="Brief description of the project..."
              disabled={isCreating}
              rows={3}
            />
            {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <Label>Project Color</Label>
            <div className="flex gap-2 mt-2">
              {PROJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  disabled={isCreating}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 transition-all",
                    selectedColor === color ? "border-white scale-110" : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                    disabled={isCreating}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => setValue('startDate', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                    disabled={isCreating}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => setValue('endDate', date)}
                    initialFocus
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {!workspaceId && (
            <div className="text-sm text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded p-3">
              Workspace not loaded. Please wait...
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isDisabled}>
              Cancel
            </Button>
            <Button type="submit" disabled={isDisabled}>
              {isCreating ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

