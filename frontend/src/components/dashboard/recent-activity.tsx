"use client"

import { motion } from 'framer-motion'
import { Clock, GitCommit, MessageSquare, UserPlus, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRecentActivity } from '@/hooks/use-activity'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'

// Icon mapping for different activity types
const getActivityIcon = (type: string) => {
  switch (type) {
    case 'task':
      return GitCommit
    case 'comment':
      return MessageSquare
    case 'member':
      return UserPlus
    case 'project':
      return FileText
    default:
      return GitCommit
  }
}

// Color mapping for different activity types
const getActivityColor = (type: string) => {
  switch (type) {
    case 'task':
      return 'text-green-500'
    case 'comment':
      return 'text-blue-500'
    case 'member':
      return 'text-purple-500'
    case 'project':
      return 'text-orange-500'
    default:
      return 'text-gray-500'
  }
}

export function RecentActivity() {
  const { activities, isLoading, isError } = useRecentActivity(10)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start space-x-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Failed to load activities</p>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No recent activity yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Badge variant="secondary" className="text-xs">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type)
          const colorClass = getActivityColor(activity.type)
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-start space-x-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={activity.user.avatar} />
                <AvatarFallback className="text-xs">
                  {activity.user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-4 w-4 ${colorClass}`} />
                  <p className="text-sm">
                    <span className="font-medium">{activity.user.name}</span>
                    <span className="text-muted-foreground"> {activity.action} </span>
                    <span className="font-medium">{activity.target}</span>
                  </p>
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1 h-3 w-3" />
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </div>
              </div>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}
