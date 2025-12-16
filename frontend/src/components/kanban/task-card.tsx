"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Calendar, 
  MessageSquare, 
  User, 
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  labels: string[]
  statusId: string
  position: number
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  commentCount: number
  createdAt: string
}

interface TaskCardProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
  onClick?: (task: Task) => void
}

const priorityColors = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500', 
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
}

const priorityLabels = {
  low: 'Low',
  medium: 'Medium',
  high: 'High', 
  urgent: 'Urgent',
}

export function TaskCard({ task, onEdit, onDelete, onClick }: TaskCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className={cn(
        "touch-none",
        isDragging && "opacity-50 rotate-2 scale-105"
      )}
    >
      <Card 
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-md border-l-4",
          priorityColors[task.priority],
          isOverdue && "border-red-500 bg-red-50 dark:bg-red-950"
        )}
        onClick={() => onClick?.(task)}
      >
        <CardContent className="p-4">
          {/* Task Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 
                className="font-medium text-sm line-clamp-2 mb-1"
                {...listeners}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>
            
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.(task)
                    setIsMenuOpen(false)
                  }}
                >
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.(task.id)
                    setIsMenuOpen(false)
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-3 w-3" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.labels.slice(0, 3).map((label) => (
                <Badge 
                  key={label} 
                  variant="secondary" 
                  className="text-xs px-1.5 py-0.5"
                >
                  {label}
                </Badge>
              ))}
              {task.labels.length > 3 && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  +{task.labels.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Task Footer */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-2">
              {/* Priority */}
              <div className="flex items-center space-x-1">
                <div 
                  className={cn(
                    "w-2 h-2 rounded-full",
                    priorityColors[task.priority]
                  )}
                />
                <span>{priorityLabels[task.priority]}</span>
              </div>

              {/* Comments */}
              {task.commentCount > 0 && (
                <div className="flex items-center space-x-1">
                  <MessageSquare className="h-3 w-3" />
                  <span>{task.commentCount}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Due Date */}
              {task.dueDate && (
                <div 
                  className={cn(
                    "flex items-center space-x-1",
                    isOverdue && "text-red-600"
                  )}
                >
                  {isOverdue && <AlertCircle className="h-3 w-3" />}
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}

              {/* Assignee */}
              {task.assignee && (
                <Avatar className="h-5 w-5">
                  <AvatarImage src={task.assignee.avatar} />
                  <AvatarFallback className="text-xs">
                    {task.assignee.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
