"use client"

import { motion } from 'framer-motion'
import { Calendar, Clock, TrendingUp, Users, Sparkles, Zap, Target, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { useWorkspaces } from '@/hooks/use-workspaces'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'

export function DashboardHeader() {
  const { user, backendUser, isConnectedToBackend } = useAuth()
  const { workspaces, isLoading: isLoadingWorkspaces } = useWorkspaces()
  const { stats, isLoading: isLoadingStats } = useDashboardStats()

  // Calculate real stats from data
  const statCards = [
    {
      title: 'Your Workspaces',
      value: isLoadingWorkspaces ? '...' : workspaces.length.toString(),
      change: isConnectedToBackend ? 'Connected' : 'Offline',
      changeType: isConnectedToBackend ? 'positive' as const : 'negative' as const,
      icon: Target,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Total Members',
      value: isLoadingWorkspaces ? '...' : workspaces.reduce((acc, w) => acc + w.members.length, 0).toString(),
      change: 'Across workspaces',
      changeType: 'positive' as const,
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Active Today',
      value: isLoadingStats ? '...' : stats.activeTodayCount.toString(),
      change: 'Tasks & updates',
      changeType: 'positive' as const,
      icon: Calendar,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      title: 'This Week',
      value: isLoadingStats ? '...' : stats.weeklyActionsCount.toString(),
      change: 'Actions completed',
      changeType: 'positive' as const,
      icon: Activity,
      gradient: 'from-green-500 to-emerald-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-800/30 to-gray-900/30 border border-gray-700/30 backdrop-blur-xl"
      >
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:50px_50px]" />
        
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Badge className={`border-white/20 ${
                  isConnectedToBackend 
                    ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                }`}>
                  <Sparkles className="mr-1 h-3 w-3" />
                  {isConnectedToBackend ? 'Connected' : 'Offline Mode'}
                </Badge>
              </div>
              <h2 className="text-3xl font-bold text-white">
                Welcome back, {user?.firstName || 'there'}! 👋
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl">
                {isConnectedToBackend ? (
                  <>You have <span className="text-white font-semibold">{workspaces.length} workspaces</span> ready for collaboration.</>
                ) : (
                  <>Working in offline mode. Connect to sync your data.</>
                )}
              </p>
            </div>
            
            <div className="hidden lg:flex items-center space-x-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  {new Date().toLocaleDateString('en-US', { day: 'numeric' })}
                </div>
                <div className="text-sm text-gray-300">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short' 
                  })}
                </div>
              </div>
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid with Real Data */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat: any, index: number) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="relative overflow-hidden bg-white/5 backdrop-blur-xl border-white/20 hover:bg-white/10 transition-all duration-300 group">
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <p className="text-sm font-medium text-gray-300">
                          {stat.title}
                        </p>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-3xl font-bold text-white">
                          {stat.value}
                        </p>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                            className={
                              stat.changeType === 'positive' 
                                ? "bg-green-500/20 text-green-300 border-green-500/30 text-xs px-2 py-1" 
                                : "bg-red-500/20 text-red-300 border-red-500/30 text-xs px-2 py-1"
                            }
                          >
                            {stat.change}
                          </Badge>
                        </div>
                      </div>
                    </div>
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
