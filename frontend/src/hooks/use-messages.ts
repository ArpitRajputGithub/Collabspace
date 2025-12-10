"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient, type Message } from '@/lib/api-client'
import { useSocket } from '@/providers/socket-provider'
import { useAuth } from '@/hooks/use-auth'

interface UseMessagesOptions {
    projectId: string
    limit?: number
}

export function useMessages({ projectId, limit = 50 }: UseMessagesOptions) {
    const queryClient = useQueryClient()
    const { socket, isConnected, joinProject, leaveProject } = useSocket()
    const { user } = useAuth()
    const [messages, setMessages] = useState<Message[]>([])
    const [isSending, setIsSending] = useState(false)
    const hasJoinedProject = useRef(false)

    // Fetch initial messages from API
    const messagesQuery = useQuery({
        queryKey: ['messages', projectId],
        queryFn: () => apiClient.getProjectMessages(projectId, { limit }),
        enabled: !!projectId && !!user,
        staleTime: 30 * 1000, // 30 seconds
    })

    // Update local state when query data changes
    useEffect(() => {
        if (messagesQuery.data) {
            setMessages(messagesQuery.data)
        }
    }, [messagesQuery.data])

    // Join project room for real-time updates
    useEffect(() => {
        if (isConnected && projectId && !hasJoinedProject.current) {
            joinProject(projectId)
            hasJoinedProject.current = true
        }

        return () => {
            if (hasJoinedProject.current && projectId) {
                leaveProject(projectId)
                hasJoinedProject.current = false
            }
        }
    }, [isConnected, projectId, joinProject, leaveProject])

    // Listen for real-time messages
    useEffect(() => {
        if (!socket || !isConnected) return

        const handleMessageReceived = ({ message, projectId: msgProjectId }: { message: Message; projectId: string }) => {
            if (msgProjectId === projectId) {
                setMessages(prev => [...prev, message])
            }
        }

        const handleMessageError = ({ error }: { error: string }) => {
            console.error('Message error:', error)
            setIsSending(false)
        }

        socket.on('message-received', handleMessageReceived)
        socket.on('message-error', handleMessageError)

        return () => {
            socket.off('message-received', handleMessageReceived)
            socket.off('message-error', handleMessageError)
        }
    }, [socket, isConnected, projectId])

    // Send message via socket
    const sendMessage = useCallback((content: string) => {
        if (!socket || !isConnected || !content.trim()) {
            console.warn('Cannot send message: socket not connected or empty content')
            return
        }

        setIsSending(true)
        socket.emit('message-sent', {
            projectId,
            content: content.trim()
        })

        // Reset sending state after a short delay (actual message comes via socket event)
        setTimeout(() => setIsSending(false), 500)
    }, [socket, isConnected, projectId])

    // Load more (older) messages
    const loadMore = useCallback(async () => {
        if (messages.length === 0) return

        const oldestMessage = messages[0]
        const olderMessages = await apiClient.getProjectMessages(projectId, {
            limit,
            before: oldestMessage.createdAt
        })

        setMessages(prev => [...olderMessages, ...prev])
    }, [messages, projectId, limit])

    return {
        messages,
        isLoading: messagesQuery.isLoading,
        isError: messagesQuery.isError,
        isSending,
        isConnected,
        sendMessage,
        loadMore,
        refetch: messagesQuery.refetch,
    }
}
