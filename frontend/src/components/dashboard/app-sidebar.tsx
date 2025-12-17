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
  Home,
  Calendar,
  MessageSquare,
  LogOut,
  ChevronRight
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
}

const navItems: NavItem[] = [
  { title: 'Home', href: '/dashboard', icon: Home },
  { title: 'Projects', href: '/projects', icon: FolderKanban },
  { title: 'Tasks', href: '/tasks', icon: LayoutDashboard },
  { title: 'Calendar', href: '/calendar', icon: Calendar },
  { title: 'Messages', href: '/messages', icon: MessageSquare, badge: 3 },
  { title: 'Team', href: '/team', icon: Users },
  { title: 'Settings', href: '/settings', icon: Settings },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { workspaces, isLoading } = useWorkspaces()

  return (
    <div className="w-64 flex flex-col bg-card border-r border-border">
      {/* Logo Section */}
      <div className="p-5 pb-4">
        <div className="flex items-center gap-3">
          <div 
            className="flex h-9 w-9 items-center justify-center rounded-lg"
            style={{ backgroundColor: '#123458' }}
          >
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
            </svg>
          </div>
          <div>
            <div 
              className="font-bold text-foreground"
              style={{ fontFamily: "'Chillax', sans-serif" }}
            >
              CollabSpace
            </div>
            <div className="text-xs text-muted-foreground">Team Workspace</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-9 h-9 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
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
                  "w-full justify-start h-10 px-3 transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4 mr-3" />
                <span className="flex-1 text-left text-sm font-medium">{item.title}</span>
                {item.badge && (
                  <Badge 
                    variant="secondary" 
                    className="ml-auto bg-primary text-primary-foreground text-xs h-5 px-1.5"
                  >
                    {item.badge}
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>

      <Separator className="mx-4 bg-border" />

      {/* Recent Projects Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Recent Projects
          </div>
        </div>
        
        <div className="space-y-1">
          {isLoading ? (
            <div className="text-sm text-muted-foreground px-3 py-2">Loading...</div>
          ) : workspaces.length === 0 ? (
            <div className="text-sm text-muted-foreground px-3 py-2">No workspaces yet</div>
          ) : workspaces.slice(0, 3).map((workspace) => (
            <Link key={workspace.id} href={`/projects?workspace=${workspace.slug}`}>
              <Button
                variant="ghost"
                className="w-full justify-start h-9 px-3 text-foreground hover:bg-muted group"
              >
                <div 
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: '#123458' }}
                />
                <span className="flex-1 text-left text-sm truncate">{workspace.name}</span>
                <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </Link>
          ))}
        </div>
        
        <CreateWorkspaceModal
          trigger={
            <Button 
              variant="ghost" 
              className="w-full justify-start h-9 px-3 text-muted-foreground hover:text-foreground hover:bg-muted mt-1"
            >
              <Plus className="h-4 w-4 mr-3" />
              <span className="text-sm">Add workspace</span>
            </Button>
          }
        />
      </div>

      <Separator className="mx-4 bg-border" />

      {/* User Section */}
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start h-auto p-2 hover:bg-muted"
            >
              <Avatar className="h-8 w-8 mr-3">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback 
                  className="text-white text-sm"
                  style={{ backgroundColor: '#123458' }}
                >
                  {user?.firstName?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
              </div>
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
            <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
