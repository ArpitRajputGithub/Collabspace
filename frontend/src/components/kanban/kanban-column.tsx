"use client"

import { useMemo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TaskCard } from './task-card'
import { cn } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  labels: string[]
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  commentCount: number
  createdAt: string
}

interface TaskStatus {
  id: string
  name: string
  slug: string
  color: string
  position: number
}

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  onAddTask?: (statusId: string) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  onTaskClick?: (task: Task) => void
}

export function KanbanColumn({
  status,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onTaskClick,
}: KanbanColumnProps) {
  const taskIds = useMemo(() => tasks.map(task => task.id), [tasks])

  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
    data: {
      type: 'Column',
      status,
    },
  })

  return (
    <Card 
      className={cn(
        "flex flex-col min-h-[500px] w-80 flex-shrink-0 transition-all duration-200",
        isOver && "ring-2 ring-primary ring-opacity-50 shadow-lg"
      )}
    >
      {/* Column Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: status.color }}
            />
            <h3 className="font-semibold text-sm">{status.name}</h3>
            <Badge variant="secondary" className="text-xs">
              {tasks.length}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
            onClick={() => onAddTask?.(status.id)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>

      {/* Column Content */}
      <CardContent 
        ref={setNodeRef}
        className={cn(
          "flex-1 p-3 space-y-3 min-h-0",
          isOver && "bg-accent/20"
        )}
      >
        <SortableContext 
          items={taskIds} 
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                style={{ backgroundColor: `${status.color}20` }}
              >
                <div 
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: status.color }}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                No tasks in {status.name.toLowerCase()}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddTask?.(status.id)}
                className="text-xs"
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Task
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onClick={onTaskClick}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </CardContent>
    </Card>
  )
}
