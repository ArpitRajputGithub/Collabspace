"use client"

import { Suspense } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { WorkspaceGrid } from '@/components/dashboard/workspace-grid'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { useAuth } from '@/hooks/use-auth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function DashboardPage() {
  const { isLoaded, isConnecting } = useAuth()

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <DashboardHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Your Workspaces</h2>
              {isConnecting && (
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <LoadingSpinner size="sm" />
                  <span>Connecting to backend...</span>
                </div>
              )}
            </div>
            
            <Suspense fallback={
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 bg-white/5 border border-white/20 rounded-xl animate-pulse" />
                ))}
              </div>
            }>
              <WorkspaceGrid />
            </Suspense>
          </div>
        </div>
        
        <div className="space-y-6">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
