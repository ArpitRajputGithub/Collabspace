"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/providers/auth-provider'
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Settings, 
  Plus,
  Search,
  Bell,
  Sparkles,
  Home,
  Calendar,
  MessageSquare,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { CreateWorkspaceModal } from '@/components/modals/create-workspace-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  gradient?: string
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Projects',
    href: '/projects',
    icon: FolderKanban,
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    title: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    badge: 3,
    gradient: 'from-orange-500 to-red-500'
  },
  {
    title: 'Team',
    href: '/team',
    icon: Users,
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    gradient: 'from-gray-500 to-gray-600'
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { workspaces, isLoading } = useWorkspaces()

  return (
    <div className="w-72 flex flex-col bg-white/5 backdrop-blur-xl border-r border-white/10">
      {/* Logo Section */}
      <div className="p-6 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-lg">CollabSpace</div>
            <div className="text-xs text-gray-400">Team Workspace</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-6 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search workspace..."
            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
          Navigation
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 px-4 transition-all duration-200 group relative overflow-hidden",
                  isActive 
                    ? "bg-white/10 text-white shadow-lg" 
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-r opacity-20 rounded-lg",
                    item.gradient
                  )} />
                )}
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg mr-3 transition-all",
                  isActive 
                    ? `bg-gradient-to-r ${item.gradient} shadow-lg`
                    : "bg-white/5 group-hover:bg-white/10"
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-left font-medium">{item.title}</span>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-xs"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      <Separator className="bg-white/10 mx-4" />

      {/* Workspaces Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Workspaces
          </div>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-gray-400 hover:text-white">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-1">
          {isLoading ? (
            <div className="text-sm text-gray-400 px-3 py-2">Loading...</div>
          ) : workspaces.length === 0 ? (
            <div className="text-sm text-gray-400 px-3 py-2">No workspaces yet</div>
          ) : workspaces.map((workspace) => (
            <Link key={workspace.id} href={`/projects?workspace=${workspace.slug}`}>
              <Button
                variant="ghost"
                className="w-full justify-start h-10 px-3 text-gray-300 hover:text-white hover:bg-white/5 group"
              >
                <Avatar className="h-6 w-6 mr-3">
                  <AvatarImage src={workspace.avatarUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs">
                    {workspace.name?.charAt(0)?.toUpperCase() || 'W'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="text-sm font-medium truncate">{workspace.name}</div>
                </div>
                <div className="text-xs text-gray-500 group-hover:text-gray-400">
                  {workspace.memberCount || 0}
                </div>
              </Button>
            </Link>
          ))}
        </div>
        
        <CreateWorkspaceModal
          trigger={
            <Button 
              variant="ghost" 
              className="w-full justify-start h-10 px-3 text-gray-400 hover:text-white hover:bg-white/5 mt-2"
            >
              <div className="w-6 h-6 rounded-md mr-3 border border-dashed border-gray-500 flex items-center justify-center">
                <Plus className="h-3 w-3" />
              </div>
              <span className="text-sm">Add workspace</span>
            </Button>
          }
        />
      </div>

      <Separator className="bg-white/10 mx-4" />

      {/* User Section */}
      <div className="p-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarImage src={user?.avatarUrl || undefined} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-gray-400 truncate">
                {user?.email}
              </div>
            </div>
          </div>
          
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
