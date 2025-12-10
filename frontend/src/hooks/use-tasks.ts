"use client"

import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { useSocket } from '@/providers/socket-provider'

interface Task {
  id: string
  title: string
  description?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate?: string
  labels: string[]
  statusId: string
  position: number
  assigneeId?: string
  assignee?: {
    id: string
    name: string
    avatar?: string
  }
  commentCount: number
  createdAt: string
  updatedAt: string
}

interface TaskUpdate {
  taskId: string
  changes: Partial<Task>
  updatedBy: string
}

interface TaskMove {
  taskId: string
  oldStatusId: string
  newStatusId: string
  newPosition: number
  movedBy: string
}

export function useTasks(projectId: string) {
  const [optimisticTasks, setOptimisticTasks] = useState<Task[]>([])
  const queryClient = useQueryClient()
  const { socket, isConnected } = useSocket()

  // Fetch tasks and statuses from API
  const boardQuery = useQuery({
    queryKey: ['project-board', projectId],
    queryFn: async () => {
      const data = await apiClient.getProjectBoard(projectId)
      // Extract tasks and statuses from board
      const allTasks = data.board.flatMap((column: any) => 
        column.tasks.map((task: any) => ({
          ...task,
          statusId: column.id, // Ensure statusId is set
        }))
      )
      setOptimisticTasks(allTasks)
      return { tasks: allTasks as Task[], statuses: data.board, project: data.project }
    },
    enabled: !!projectId,
  })

  // Join project room when connected
  useEffect(() => {
    if (socket && isConnected && projectId) {
      socket.emit('join-project', { projectId })
      
      return () => {
        socket.emit('leave-project', { projectId })
      }
    }
  }, [socket, isConnected, projectId])

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return

    // Task created
    socket.on('task-created', (data: { task: Task; createdBy: any }) => {
      setOptimisticTasks(prev => [...prev, data.task])
      toast.success(`${data.createdBy.firstName} created a new task`, {
        description: data.task.title
      })
    })

    // Task updated
    socket.on('task-updated', (data: TaskUpdate) => {
      setOptimisticTasks(prev => 
        prev.map(task => 
          task.id === data.taskId 
            ? { ...task, ...data.changes }
            : task
        )
      )
    })

    // Task moved
    socket.on('task-moved', (data: TaskMove) => {
      setOptimisticTasks(prev =>
        prev.map(task =>
          task.id === data.taskId
            ? { ...task, statusId: data.newStatusId, position: data.newPosition }
            : task
        )
      )
    })

    // Task deleted
    socket.on('task-deleted', (data: { taskId: string; deletedBy: any }) => {
      setOptimisticTasks(prev => prev.filter(task => task.id !== data.taskId))
      toast.info(`${data.deletedBy.firstName} deleted a task`)
    })

    return () => {
      socket.off('task-created')
      socket.off('task-updated')  
      socket.off('task-moved')
      socket.off('task-deleted')
    }
  }, [socket])

  // Create task mutation with optimistic updates
  const createTaskMutation = useMutation({
    mutationFn: async (data: {
      title: string
      description?: string
      statusId: string
      priority?: string
      assigneeId?: string
      labels?: string[]
      dueDate?: string
    }) => {
      return apiClient.createTask(projectId, data)
    },
    onMutate: async (newTask) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['project-board', projectId] })

      // Snapshot previous value
      const previousBoard = queryClient.getQueryData<{ tasks: Task[] }>(['project-board', projectId])

      // Optimistically update
      const optimisticTask: Task = {
        id: `temp-${Date.now()}`,
        title: newTask.title,
        description: newTask.description,
        priority: (newTask.priority as any) || 'medium',
        labels: newTask.labels || [],
        statusId: newTask.statusId,
        position: optimisticTasks.filter(t => t.statusId === newTask.statusId).length,
        assigneeId: newTask.assigneeId,
        commentCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      setOptimisticTasks(prev => [...prev, optimisticTask])

      return { previousBoard, optimisticTask }
    },
    onError: (err, newTask, context) => {
      // Revert optimistic update
      if (context?.optimisticTask) {
        setOptimisticTasks(prev => 
          prev.filter(task => task.id !== context.optimisticTask.id)
        )
      }
      toast.error('Failed to create task', {
        description: err.message
      })
    },
    onSuccess: (data, variables, context) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['project-board', projectId] })
      toast.success('Task created successfully!')
    },
  })

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: Partial<Task> }) => {
      return apiClient.updateTask(taskId, updates)
    },
    onMutate: async ({ taskId, updates }) => {
      // Optimistic update
      setOptimisticTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      )
    },
    onError: (err) => {
      toast.error('Failed to update task', {
        description: err.message
      })
      // Refetch to get correct state
      boardQuery.refetch()
    },
  })

  // Move task mutation
  const moveTaskMutation = useMutation({
    mutationFn: async ({ taskId, statusId, position }: { 
      taskId: string
      statusId: string
      position: number 
    }) => {
      return apiClient.moveTask(taskId, { statusId, position })
    },
    onMutate: async ({ taskId, statusId, position }) => {
      // Optimistic update
      setOptimisticTasks(prev =>
        prev.map(task =>
          task.id === taskId 
            ? { ...task, statusId, position }
            : task
        )
      )
    },
    onError: (err) => {
      toast.error('Failed to move task')
      boardQuery.refetch()
    },
  })

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      // Note: You'll need to add this to your apiClient
      return apiClient.deleteTask(taskId)
    },
    onMutate: async (taskId) => {
      // Optimistic update
      setOptimisticTasks(prev => prev.filter(task => task.id !== taskId))
    },
    onError: (err) => {
      toast.error('Failed to delete task')
      boardQuery.refetch()
    },
  })

  const boardData = boardQuery.data
  const statuses = boardData?.statuses || []

  return {
    tasks: optimisticTasks,
    statuses,
    project: boardData?.project,
    isLoading: boardQuery.isLoading,
    isConnected,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    moveTask: moveTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    refetch: boardQuery.refetch,
  }
}
