"use client"

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable'
import { motion } from 'framer-motion'
import { KanbanColumn } from './kanban-column'
import { TaskCard } from './task-card'

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

interface TaskStatus {
  id: string
  name: string
  slug: string
  color: string
  position: number
}

interface KanbanBoardProps {
  tasks: Task[]
  statuses: TaskStatus[]
  onTaskMove?: (taskId: string, newStatusId: string, newPosition: number) => void
  onAddTask?: (statusId: string) => void
  onEditTask?: (task: Task) => void
  onDeleteTask?: (taskId: string) => void
  onTaskClick?: (task: Task) => void
}

export function KanbanBoard({
  tasks,
  statuses,
  onTaskMove,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onTaskClick,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = statuses.reduce((acc, status) => {
      acc[status.id] = tasks
        .filter(task => task.statusId === status.id)
        .sort((a, b) => a.position - b.position)
      return acc
    }, {} as Record<string, Task[]>)
    
    return grouped
  }, [tasks, statuses])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) return

    const activeId = active.id
    const overId = over.id

    // If dropping on the same item, do nothing
    if (activeId === overId) return

    const isActiveATask = active.data.current?.type === 'Task'
    const isOverATask = over.data.current?.type === 'Task'
    const isOverAColumn = over.data.current?.type === 'Column'

    if (!isActiveATask) return

    // Dropping a task over another task
    if (isActiveATask && isOverATask) {
      const activeTask = active.data.current?.task as Task
      const overTask = over.data.current?.task as Task

      if (activeTask.statusId !== overTask.statusId) {
        const newPosition = overTask.position
        onTaskMove?.(activeTask.id, overTask.statusId, newPosition)
      }
    }

    // Dropping a task over a column
    if (isActiveATask && isOverAColumn) {
      const activeTask = active.data.current?.task as Task
      const overStatus = over.data.current?.status as TaskStatus

      if (activeTask.statusId !== overStatus.id) {
        const tasksInNewStatus = tasksByStatus[overStatus.id] || []
        const newPosition = tasksInNewStatus.length
        onTaskMove?.(activeTask.id, overStatus.id, newPosition)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveTask(null)
      return
    }

    const activeId = active.id
    const overId = over.id

    // Handle sorting within the same column
    if (active.data.current?.type === 'Task' && over.data.current?.type === 'Task') {
      const activeTask = active.data.current.task as Task
      const overTask = over.data.current.task as Task

      if (activeTask.statusId === overTask.statusId) {
        const statusTasks = tasksByStatus[activeTask.statusId] || []
        const activeIndex = statusTasks.findIndex(task => task.id === activeTask.id)
        const overIndex = statusTasks.findIndex(task => task.id === overTask.id)

        if (activeIndex !== overIndex) {
          onTaskMove?.(activeTask.id, activeTask.statusId, overIndex)
        }
      }
    }

    setActiveTask(null)
  }

  const statusIds = statuses.map(status => status.id)

  return (
    <div className="flex-1 overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Board Container */}
        <div className="flex gap-6 p-6 h-full overflow-x-auto">
          <SortableContext 
            items={statusIds} 
            strategy={horizontalListSortingStrategy}
          >
            {statuses
              .sort((a, b) => a.position - b.position)
              .map((status) => (
                <motion.div
                  key={status.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: status.position * 0.1 }}
                >
                  <KanbanColumn
                    status={status}
                    tasks={tasksByStatus[status.id] || []}
                    onAddTask={onAddTask}
                    onEditTask={onEditTask}
                    onDeleteTask={onDeleteTask}
                    onTaskClick={onTaskClick}
                  />
                </motion.div>
              ))}
          </SortableContext>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 opacity-90">
              <TaskCard 
                task={activeTask} 
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
