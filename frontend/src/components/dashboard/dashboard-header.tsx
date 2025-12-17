"use client"

import { motion } from 'framer-motion'
import { FolderKanban, Users, Calendar, TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'

export function DashboardHeader() {
  const { user, isConnectedToBackend } = useAuth()
  const { workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces()
  const { stats, isLoading: isLoadingStats } = useDashboardStats()

  // Calculate real stats from data
  const statCards = [
    {
      title: 'Active Projects',
      value: isLoadingWorkspaces ? '...' : workspaces.length.toString(),
      subtitle: '+4 from last month',
      icon: FolderKanban,
    },
    {
      title: 'Active Tasks',
      value: isLoadingStats ? '...' : stats.activeTodayCount.toString(),
      subtitle: '+20% from last month',
      icon: Calendar,
    },
    {
      title: 'Team Members',
      value: isLoadingWorkspaces ? '...' : workspaces.reduce((acc, w) => acc + w.members.length, 0).toString(),
      subtitle: 'Across all workspaces',
      icon: Users,
    },
    {
      title: 'Completion Rate',
      value: isLoadingStats ? '...' : '45%',
      subtitle: '+4% improvement',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 
          className="text-2xl font-bold text-foreground"
          style={{ fontFamily: "'Chillax', sans-serif" }}
        >
          Welcome back, {user?.firstName || 'there'}.
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your projects today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
            >
              <Card className="bg-card border-border hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div>
                    <p 
                      className="text-3xl font-bold text-foreground"
                      style={{ fontFamily: "'Chillax', sans-serif" }}
                    >
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.subtitle}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
