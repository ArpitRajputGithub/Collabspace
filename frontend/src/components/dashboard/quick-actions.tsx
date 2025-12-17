"use client"

import { motion } from 'framer-motion'
import { FolderPlus, Users, ListPlus, Settings } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const quickActions = [
  {
    title: 'New Project',
    description: 'Start a new project',
    icon: FolderPlus,
  },
  {
    title: 'Invite Team',
    description: 'Add team members',
    icon: Users,
  },
  {
    title: 'Create Task',
    description: 'Add a new task',
    icon: ListPlus,
  },
  {
    title: 'Settings',
    description: 'Manage preferences',
    icon: Settings,
  },
]

export function QuickActions() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-foreground">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {quickActions.map((action, index) => {
          const Icon = action.icon
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Button
                variant="ghost"
                className="w-full justify-start h-auto py-2.5 px-3 hover:bg-muted"
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                  style={{ backgroundColor: '#123458' }}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-foreground">{action.title}</div>
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
