"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSocket } from '@/providers/socket-provider'

interface CursorPosition {
  x: number
  y: number
  user: {
    id: string
    name: string
    color: string
  }
}

interface LiveCursorsProps {
  projectId: string
}

export function LiveCursors({ projectId }: LiveCursorsProps) {
  const [cursors, setCursors] = useState<Record<string, CursorPosition>>({})
  const { socket, isConnected } = useSocket()

  useEffect(() => {
    if (!socket || !isConnected) return

    let throttleTimeout: NodeJS.Timeout

    const handleMouseMove = (e: MouseEvent) => {
      if (throttleTimeout) return

      throttleTimeout = setTimeout(() => {
        socket.emit('cursor-position', {
          projectId,
          x: e.clientX,
          y: e.clientY,
        })
        throttleTimeout = null as any
      }, 50) // Throttle to 20 FPS
    }

    document.addEventListener('mousemove', handleMouseMove)

    // Listen for other users' cursors
    socket.on('cursor-updated', (data: CursorPosition & { userId: string }) => {
      setCursors(prev => ({
        ...prev,
        [data.userId]: {
          x: data.x,
          y: data.y,
          user: data.user,
        }
      }))
    })

    socket.on('user-left-project', (data: { userId: string }) => {
      setCursors(prev => {
        const newCursors = { ...prev }
        delete newCursors[data.userId]
        return newCursors
      })
    })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      socket.off('cursor-updated')
      socket.off('user-left-project')
      if (throttleTimeout) clearTimeout(throttleTimeout)
    }
  }, [socket, isConnected, projectId])

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <AnimatePresence>
        {Object.entries(cursors).map(([userId, cursor]) => (
          <motion.div
            key={userId}
            className="absolute pointer-events-none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              x: cursor.x - 12,
              y: cursor.y - 12,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          >
            {/* Cursor SVG */}
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill={cursor.user.color}
              className="drop-shadow-sm"
            >
              <path d="M5.65376 12.3673H8.33437L11.4867 19.4718C11.8734 20.4784 13.1482 20.8517 13.9765 20.1437L15.8329 18.5089C16.6612 17.8009 16.9659 16.5661 16.5792 15.5595L14.2024 9.88762H16.8830C17.9329 9.88762 18.7433 8.84261 18.5125 7.8237L17.3424 2.83733C17.1674 2.04766 16.4705 1.43296 15.6504 1.43296H5.65376C4.26815 1.43296 3.24901 2.78472 3.60769 4.12281L5.65376 12.3673Z"/>
            </svg>
            
            {/* User name label */}
            <div 
              className="absolute top-6 left-0 px-2 py-1 text-xs text-white rounded shadow-lg whitespace-nowrap"
              style={{ backgroundColor: cursor.user.color }}
            >
              {cursor.user.name}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
