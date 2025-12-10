"use client"

import { motion } from 'framer-motion'
import { Plus, Users, Calendar, MessageSquare, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const quickActions = [
  {
    title: 'New Project',
    description: 'Start a new project',
    icon: Plus,
    color: 'bg-blue-500',
  },
  {
    title: 'Invite Team',
    description: 'Add team members',
    icon: Users,
    color: 'bg-green-500',
  },
  {
    title: 'Schedule Meeting',
    description: 'Plan a team sync',
    icon: Calendar,
    color: 'bg-purple-500',
  },
  {
    title: 'Send Message',
    description: 'Chat with team',
    icon: MessageSquare,
    color: 'bg-orange-500',
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Button
                variant="ghost"
                className="w-full justify-start h-auto p-3 hover:bg-accent/50"
              >
                <div className={`${action.color} p-2 rounded-md mr-3`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {action.description}
                  </div>
                </div>
              </Button>
            </motion.div>
          )
        })}
      </CardContent>
    </Card>
  )
}
