"use client"

import { useState, useRef, useEffect, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, MessageSquare, X, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useMessages } from '@/hooks/use-messages'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'

interface ProjectChatProps {
  projectId: string
  projectName?: string
  isOpen: boolean
  onToggle: () => void
}

export function ProjectChat({ projectId, projectName, isOpen, onToggle }: ProjectChatProps) {
  const { user } = useAuth()
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  
  const {
    messages,
    isLoading,
    isSending,
    isConnected,
    sendMessage,
  } = useMessages({ projectId })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isSending) {
      sendMessage(inputValue)
      setInputValue('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as FormEvent)
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={onToggle}
          size="lg"
          className={cn(
            "rounded-full h-14 w-14 shadow-lg",
            isOpen 
              ? "bg-gray-700 hover:bg-gray-600" 
              : "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500"
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageSquare className="h-6 w-6" />
          )}
        </Button>
        
        {/* Connection indicator */}
        <div className={cn(
          "absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-gray-900",
          isConnected ? "bg-green-500" : "bg-red-500"
        )} />
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-40 w-96 h-[500px] bg-gray-900/95 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 bg-gray-800/50">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-violet-400" />
                <div>
                  <h3 className="font-semibold text-white text-sm">
                    {projectName || 'Project Chat'}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    {isConnected ? (
                      <>
                        <Wifi className="h-3 w-3 text-green-400" />
                        <span className="text-green-400">Connected</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 text-red-400" />
                        <span className="text-red-400">Disconnected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageSquare className="h-12 w-12 text-gray-600 mb-3" />
                  <p className="text-gray-400 text-sm">No messages yet</p>
                  <p className="text-gray-500 text-xs">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.userId === user?.id
                  const showAvatar = index === 0 || messages[index - 1]?.userId !== message.userId
                  
                  return (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "flex gap-2",
                        isOwn ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      {showAvatar ? (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={message.userInfo.avatarUrl} />
                          <AvatarFallback className="bg-violet-600 text-white text-xs">
                            {message.userInfo.firstName?.[0]}{message.userInfo.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8 flex-shrink-0" />
                      )}
                      
                      <div className={cn(
                        "max-w-[75%] space-y-1",
                        isOwn ? "items-end" : "items-start"
                      )}>
                        {showAvatar && (
                          <div className={cn(
                            "flex items-center gap-2 text-xs",
                            isOwn ? "flex-row-reverse" : "flex-row"
                          )}>
                            <span className="font-medium text-gray-300">
                              {message.userInfo.firstName} {message.userInfo.lastName}
                            </span>
                            <span className="text-gray-500">
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        )}
                        <div className={cn(
                          "rounded-2xl px-4 py-2 text-sm",
                          isOwn 
                            ? "bg-violet-600 text-white rounded-tr-none" 
                            : "bg-gray-800 text-gray-100 rounded-tl-none"
                        )}>
                          {message.content}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700/50 bg-gray-800/50">
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  disabled={!isConnected || isSending}
                  rows={1}
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none min-h-[42px] max-h-[120px]"
                  style={{ height: 'auto' }}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!inputValue.trim() || !isConnected || isSending}
                  className="h-[42px] w-[42px] rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
