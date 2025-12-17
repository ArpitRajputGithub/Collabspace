"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { 
  Search, 
  Plus, 
  Bell, 
  Sun, 
  Moon,
  ChevronDown,
  FolderPlus,
  ListPlus,
  Users
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { CreateWorkspaceModal } from '@/components/modals/create-workspace-modal'

const pathTitles: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': { 
    title: 'Dashboard', 
    subtitle: "Here's what's happening with your projects today."
  },
  '/projects': { 
    title: 'Projects', 
    subtitle: 'Manage your team projects and tasks'
  },
  '/tasks': { 
    title: 'Tasks', 
    subtitle: 'Track and manage your tasks'
  },
  '/calendar': { 
    title: 'Calendar', 
    subtitle: 'View your schedule and deadlines'
  },
  '/messages': { 
    title: 'Messages', 
    subtitle: 'Chat with your team'
  },
  '/team': { 
    title: 'Team', 
    subtitle: 'Manage team members'
  },
  '/settings': { 
    title: 'Settings', 
    subtitle: 'Manage your account settings'
  },
}

export function TopBar() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [notifications] = useState(5)
  const [modalOpen, setModalOpen] = useState(false)

  const currentPage = pathTitles[pathname] || { 
    title: 'CollabSpace', 
    subtitle: 'Team collaboration platform'
  }

  return (
    <>
      <header className="h-16 border-b border-border bg-card sticky top-0 z-50">
        <div className="flex h-full items-center justify-between px-6 gap-4">
          {/* Search Bar - Centered */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects, tasks or team members"
                className="pl-10 h-10 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Create Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create
                  <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Create new</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault()
                    // Handle project creation
                  }}
                >
                  <FolderPlus className="h-4 w-4 mr-2" />
                  Project
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault()
                    // Handle task creation
                  }}
                >
                  <ListPlus className="h-4 w-4 mr-2" />
                  Task
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault()
                    setModalOpen(true)
                  }}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Workspace
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button 
              variant="outline" 
              size="icon"
              className="relative h-9 w-9 border-border"
            >
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 text-[10px] bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 border-border"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Modal moved outside dropdown */}
      <CreateWorkspaceModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
