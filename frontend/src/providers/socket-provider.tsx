"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useAuth } from '@/providers/auth-provider'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinProject: (projectId: string) => void
  leaveProject: (projectId: string) => void
  joinWorkspace: (workspaceId: string) => void
  leaveWorkspace: (workspaceId: string) => void
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinProject: () => {},
  leaveProject: () => {},
  joinWorkspace: () => {},
  leaveWorkspace: () => {},
})

export const useSocket = () => {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider')
  }
  return context
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Only connect to socket when authenticated
    if (!isAuthenticated || !token || !user) {
      console.log('Socket waiting for authentication:', { 
        isAuthenticated, 
        hasToken: !!token, 
        hasUser: !!user 
      })
      return
    }

    let socketInstance: Socket | null = null

    const connectSocket = async () => {
      try {
        console.log('Connecting to socket with JWT auth...')

        socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:9000', {
          auth: {
            token, // Send JWT token for authentication
          },
          transports: ['websocket', 'polling'],
          timeout: 15000,
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
        })

        socketInstance.on('connect', () => {
          console.log('Connected to CollabSpace server via JWT auth')
          console.log('Socket user:', user.firstName, user.lastName)
          setIsConnected(true)
        })

        socketInstance.on('disconnect', (reason) => {
          console.log('Disconnected from server:', reason)
          setIsConnected(false)
        })

        socketInstance.on('connect_error', (error) => {
          console.error('Socket connection error:', error.message)
          setIsConnected(false)
        })

        socketInstance.on('error', (error) => {
          console.error('Socket error:', error)
        })

        // Real-time event listeners
        socketInstance.on('user-joined-project', ({ user: joinedUser, projectId }) => {
          console.log(`${joinedUser.firstName} joined project ${projectId}`)
        })

        socketInstance.on('user-left-project', ({ user: leftUser, projectId }) => {
          console.log(`${leftUser.firstName} left project ${projectId}`)
        })

        socketInstance.on('user-online', ({ user: onlineUser, workspaceId }) => {
          console.log(`${onlineUser.firstName} is online in workspace ${workspaceId}`)
        })

        socketInstance.on('user-offline', ({ user: offlineUser, workspaceId }) => {
          console.log(`${offlineUser.firstName} went offline in workspace ${workspaceId}`)
        })

        socketInstance.on('task-updated', ({ taskId, task, updatedBy }) => {
          console.log(`Task ${taskId} updated by ${updatedBy.firstName}`)
        })

        socketInstance.on('message-received', ({ channelId, message, sender }) => {
          console.log(`New message in channel ${channelId} from ${sender.firstName}`)
        })

        setSocket(socketInstance)

      } catch (error) {
        console.error('Failed to initialize socket connection:', error)
      }
    }

    connectSocket()

    return () => {
      if (socketInstance) {
        console.log('Cleaning up socket connection')
        socketInstance.disconnect()
      }
      setSocket(null)
      setIsConnected(false)
    }
  }, [isAuthenticated, token, user])

  const joinProject = (projectId: string) => {
    if (socket && isConnected) {
      console.log(`Joining project: ${projectId}`)
      socket.emit('join-project', { projectId })
    } else {
      console.warn('Cannot join project: socket not connected')
    }
  }

  const leaveProject = (projectId: string) => {
    if (socket && isConnected) {
      console.log(`Leaving project: ${projectId}`)
      socket.emit('leave-project', { projectId })
    } else {
      console.warn('Cannot leave project: socket not connected')
    }
  }

  const joinWorkspace = (workspaceId: string) => {
    if (socket && isConnected) {
      console.log(`Joining workspace: ${workspaceId}`)
      socket.emit('join-workspace', { workspaceId })
    } else {
      console.warn('Cannot join workspace: socket not connected')
    }
  }

  const leaveWorkspace = (workspaceId: string) => {
    if (socket && isConnected) {
      console.log(`Leaving workspace: ${workspaceId}`)
      socket.emit('leave-workspace', { workspaceId })
    } else {
      console.warn('Cannot leave workspace: socket not connected')
    }
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinProject,
        leaveProject,
        joinWorkspace,
        leaveWorkspace,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
