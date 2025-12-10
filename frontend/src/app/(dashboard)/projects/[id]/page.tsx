"use client"

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Settings, Users, Plus, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { TaskCreateModal } from '@/components/modals/task-create-modal'
import { ProjectChat } from '@/components/collaboration/project-chat'
import { useTasks } from '@/hooks/use-tasks'

export default function ProjectBoardPage() {
  const { id } = useParams<{ id: string }>()
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [selectedStatusId, setSelectedStatusId] = useState('')
  const [chatOpen, setChatOpen] = useState(false)

  const {
    tasks,
    statuses,
    project,
    isLoading,
    isConnected,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    isCreating,
  } = useTasks(id)

  const handleTaskMove = (taskId: string, newStatusId: string, newPosition: number) => {
    moveTask({ taskId, statusId: newStatusId, position: newPosition })
  }

  const handleAddTask = (statusId: string) => {
    setSelectedStatusId(statusId)
    setCreateModalOpen(true)
  }

  const handleCreateTask = (data: any) => {
    createTask(data)
  }

  const handleEditTask = (task: any) => {
    console.log('Edit task:', task)
    // TODO: Implement task editing modal
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      deleteTask(taskId)
    }
  }

  const handleTaskClick = (task: any) => {
    console.log('Task clicked:', task)
    // TODO: Implement task detail modal
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading project board...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-6 border-b"
        >
          <div className="flex items-center space-x-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: project?.color || '#8b5cf6' }}
              />
              <div>
                <h1 className="text-xl font-bold">{project?.name || 'Project Board'}</h1>
                <p className="text-sm text-muted-foreground">
                  Real-time collaborative workspace
                </p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center space-x-1 text-green-600">
                  <Wifi className="h-4 w-4" />
                  <span className="text-xs">Connected</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-600">
                  <WifiOff className="h-4 w-4" />
                  <span className="text-xs">Disconnected</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {tasks.length} tasks
            </Badge>
            
            <Button variant="outline" size="sm">
              <Users className="mr-2 h-4 w-4" />
              Team
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            
            <Button 
              size="sm" 
              onClick={() => handleAddTask(statuses[0]?.id || '')}
              disabled={!statuses.length}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </motion.div>

        {/* Kanban Board */}
        <KanbanBoard
          tasks={tasks}
          statuses={statuses.map(s => ({
            id: s.id,
            name: s.name,
            slug: s.slug,
            color: s.color,
            position: s.position,
          }))}
          onTaskMove={handleTaskMove}
          onAddTask={handleAddTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onTaskClick={handleTaskClick}
        />
      </div>

      {/* Task Creation Modal */}
      <TaskCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        statusId={selectedStatusId}
        onSubmit={handleCreateTask}
        isLoading={isCreating}
      />

      {/* Project Chat */}
      <ProjectChat
        projectId={id}
        projectName={project?.name}
        isOpen={chatOpen}
        onToggle={() => setChatOpen(!chatOpen)}
      />
    </>
  )
}
