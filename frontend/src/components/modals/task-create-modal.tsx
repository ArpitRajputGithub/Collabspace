"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarIcon, Plus, X } from 'lucide-react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  assigneeId: z.string().optional(),
  dueDate: z.date().optional(),
  estimatedHours: z.number().min(0).max(999).optional(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface TaskCreateModalProps {
  isOpen: boolean
  onClose: () => void
  statusId: string
  onSubmit: (data: TaskFormValues & { statusId: string; labels: string[] }) => void
  isLoading?: boolean
}

const priorityOptions = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
]

export function TaskCreateModal({
  isOpen,
  onClose,
  statusId,
  onSubmit,
  isLoading = false,
}: TaskCreateModalProps) {
  const [labels, setLabels] = useState<string[]>([])
  const [labelInput, setLabelInput] = useState('')

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      assigneeId: '',
    },
  })

  const handleSubmit = (data: TaskFormValues) => {
    onSubmit({ ...data, statusId, labels })
    form.reset()
    setLabels([])
    setLabelInput('')
    onClose()
  }

  const addLabel = () => {
    if (labelInput.trim() && !labels.includes(labelInput.trim())) {
      setLabels(prev => [...prev, labelInput.trim()])
      setLabelInput('')
    }
  }

  const removeLabel = (label: string) => {
    setLabels(prev => prev.filter(l => l !== label))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addLabel()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to your project board
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what needs to be done..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                              <span>{priority.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date */}
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Labels */}
            <div className="space-y-3">
              <FormLabel>Labels</FormLabel>
              
              {/* Label Input */}
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a label..."
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLabel}
                  disabled={!labelInput.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Labels */}
              {labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {labels.map((label) => (
                    <Badge key={label} variant="secondary" className="px-2 py-1">
                      {label}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0"
                        onClick={() => removeLabel(label)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Estimated Hours */}
            <FormField
              control={form.control}
              name="estimatedHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Hours</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
