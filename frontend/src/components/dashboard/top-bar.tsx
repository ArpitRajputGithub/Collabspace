"use client"

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { 
  Command, 
  Search, 
  Plus, 
  Bell, 
  Sun, 
  Moon,
  ChevronDown,
  Sparkles,
  Zap
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

const pathTitles: Record<string, { title: string; description: string; icon: React.ReactNode }> = {
  '/dashboard': { 
    title: 'Dashboard', 
    description: 'Overview of your team\'s progress',
    icon: <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
      <Sparkles className="h-3 w-3 text-white" />
    </div>
  },
  '/projects': { 
    title: 'Projects', 
    description: 'Manage your team projects and tasks',
    icon: <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
      <Zap className="h-3 w-3 text-white" />
    </div>
  },
}

export function TopBar() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()
  const [notifications] = useState(5)
  const [modalOpen, setModalOpen] = useState(false)

  const currentPage = pathTitles[pathname] || { 
    title: 'CollabSpace', 
    description: 'Team collaboration platform',
    icon: <Sparkles className="h-5 w-5 text-purple-400" />
  }

  return (
    <>
      <header className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex h-full items-center justify-between px-4 md:px-6 gap-4">
          {/* Page Title */}
          <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
            <div className="flex-shrink-0">{currentPage.icon}</div>
            <div className="min-w-0">
              <h1 className="text-base md:text-lg font-semibold text-white truncate">{currentPage.title}</h1>
              <p className="text-xs text-gray-400 hidden sm:block truncate">{currentPage.description}</p>
            </div>
          </div>

          {/* Center Search */}
          <div className="flex-1 max-w-2xl mx-2 md:mx-4 min-w-0">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-200" />
              <Input
                placeholder="Search projects, tasks, or teammates..."
                className="pl-10 pr-20 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] text-gray-400 opacity-100 hidden sm:inline-flex">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Create Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4 md:mr-2" />
                  <span className="hidden sm:inline">Create</span>
                  <ChevronDown className="h-3 w-3 opacity-50 ml-1.5 hidden sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800/95 backdrop-blur-xl border-white/20 shadow-xl">
                <DropdownMenuLabel className="text-white font-medium">Create new</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem 
                  className="text-gray-300 focus:bg-white/10 focus:text-white cursor-pointer transition-colors"
                  onSelect={(e) => {
                    e.preventDefault()
                    // Handle project creation
                  }}
                >
                  <div className="w-5 h-5 rounded-md bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-[10px] text-white font-medium">P</span>
                  </div>
                  <span>Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-gray-300 focus:bg-white/10 focus:text-white cursor-pointer transition-colors"
                  onSelect={(e) => {
                    e.preventDefault()
                    // Handle task creation
                  }}
                >
                  <div className="w-5 h-5 rounded-md bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-[10px] text-white font-medium">T</span>
                  </div>
                  <span>Task</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-gray-300 focus:bg-white/10 focus:text-white cursor-pointer transition-colors"
                  onSelect={(e) => {
                    e.preventDefault()
                    setModalOpen(true)
                  }}
                >
                  <div className="w-5 h-5 rounded-md bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mr-3 flex-shrink-0">
                    <span className="text-[10px] text-white font-medium">W</span>
                  </div>
                  <span>Workspace</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button 
              variant="outline" 
              size="sm" 
              className="relative bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Bell className="h-4 w-4" />
              {notifications > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full p-0 text-xs bg-gradient-to-r from-red-500 to-pink-500 border-0 flex items-center justify-center font-medium"
                >
                  {notifications}
                </Badge>
              )}
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] relative"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Command Menu Trigger */}
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:flex bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => {
                console.log('Command menu')
              }}
            >
              <Command className="h-4 w-4 mr-2" />
              <span className="text-xs">⌘K</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Modal moved outside dropdown */}
      <CreateWorkspaceModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  )
}
