"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '@/providers/socket-provider'

interface TypingUser {
  id: string
  name: string
  avatar?: string
}

interface TypingIndicatorProps {
  taskId: string
}

export function TypingIndicator({ taskId }: TypingIndicatorProps) {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([])
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    socket.on('user-typing-comment', (data: { taskId: string; user: TypingUser; isTyping: boolean }) => {
      if (data.taskId !== taskId) return

      setTypingUsers(prev => {
        if (data.isTyping) {
          return prev.find(u => u.id === data.user.id) 
            ? prev 
            : [...prev, data.user]
        } else {
          return prev.filter(u => u.id !== data.user.id)
        }
      })
    })

    return () => {
      socket.off('user-typing-comment')
    }
  }, [socket, taskId])

  if (typingUsers.length === 0) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="flex items-center space-x-2 text-xs text-muted-foreground py-2"
      >
        <div className="flex items-center space-x-1">
          {typingUsers.slice(0, 3).map((user) => (
            <div key={user.id} className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce ml-0.5" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-primary rounded-full animate-bounce ml-0.5" style={{ animationDelay: '300ms' }} />
            </div>
          ))}
        </div>
        <span>
          {typingUsers.length === 1 
            ? `${typingUsers[0].name} is typing...`
            : typingUsers.length === 2
            ? `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`
            : `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing...`
          }
        </span>
      </motion.div>
    </AnimatePresence>
  )
}
