"use client"

import Link from 'next/link'
import { motion } from 'framer-motion'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  showDashboardPreview?: boolean
}

/**
 * AuthLayout - Shared layout component for sign-in and sign-up pages
 * 
 * This creates a split-panel design:
 * - LEFT: Form content (light grey background)
 * - RIGHT: Branding panel with dashboard preview (navy blue)
 * 
 * The layout is responsive:
 * - Desktop: Two columns side by side
 * - Mobile: Single column (form only, branding panel hidden)
 */
export function AuthLayout({ 
  children, 
  title, 
  subtitle,
  showDashboardPreview = true 
}: AuthLayoutProps) {
  return (
    <div className="h-screen overflow-hidden flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* LEFT PANEL - Form Section (60%) */}
      <div 
        className="w-full lg:w-[60%] flex flex-col justify-between p-6 lg:p-12 overflow-auto scrollbar-hide"
        style={{ backgroundColor: '#F1EFEC' }} // Light grey from palette
      >
        {/* Logo at top */}
        <div>
          <Link href="/" className="inline-flex items-center gap-2">
            {/* Simple logo icon */}
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#123458' }}
            >
              <svg 
                className="w-6 h-6 text-white" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M13 3L4 14h7l-2 7 9-11h-7l2-7z" />
              </svg>
            </div>
          </Link>
        </div>

        {/* Main Form Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md mx-auto w-full"
        >
          {/* Title & Subtitle */}
          <div className="mb-8">
            <h1 
              className="text-3xl font-bold mb-2"
              style={{ color: '#030303', fontFamily: "'Chillax', sans-serif" }} // Chillax for headings
            >
              {title}
            </h1>
            <p style={{ color: '#666666' }}>
              {subtitle}
            </p>
          </div>

          {/* Form content passed as children */}
          {children}
        </motion.div>

        {/* Footer */}
        <p 
          className="text-sm text-center lg:text-left"
          style={{ color: '#666666' }}
        >
          © 2026 CollabSpace, All rights reserved
        </p>
      </div>

      {/* RIGHT PANEL - Branding Section (40%, hidden on mobile) */}
      <div 
        className="hidden lg:flex lg:w-[40%] flex-col justify-center items-center p-8 relative overflow-hidden"
        style={{ backgroundColor: '#123458' }} // Navy blue from palette
      >
        {/* Decorative background gradient overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 30% 70%, rgba(212, 201, 190, 0.3) 0%, transparent 50%)'
          }}
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 text-center"
        >
          {/* Tagline */}
          <h2 
            className="text-2xl font-bold text-white mb-3 leading-tight"
            style={{ fontFamily: "'Chillax', sans-serif" }} // Chillax for branding
          >
            The simplest way to<br />manage your workspace
          </h2>
          <p className="text-white/70 text-sm mb-8">
            Collaborate with your team in real-time
          </p>

          {/* Dashboard Preview Mockup */}
          {showDashboardPreview && (
            <div className="relative">
              {/* Main dashboard card */}
              <div 
                className="bg-white rounded-xl shadow-2xl p-4 text-left"
                style={{ minWidth: '220px', maxWidth: '280px' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-sm" style={{ color: '#030303' }}>Dashboard</span>
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                    <div className="w-5 h-5 rounded-full bg-gray-200"></div>
                  </div>
                </div>

                {/* Stats cards */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Projects</p>
                    <p className="text-lg font-bold" style={{ color: '#123458' }}>12</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500">Members</p>
                    <p className="text-lg font-bold" style={{ color: '#123458' }}>8</p>
                  </div>
                </div>

                {/* Team utilization bars */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#123458' }}></div>
                    <span className="text-xs flex-1" style={{ color: '#030303' }}>Marketing</span>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-3/4" style={{ backgroundColor: '#123458' }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D4C9BE' }}></div>
                    <span className="text-xs flex-1" style={{ color: '#030303' }}>Design</span>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-1/2" style={{ backgroundColor: '#D4C9BE' }}></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#123458' }}></div>
                    <span className="text-xs flex-1" style={{ color: '#030303' }}>Dev</span>
                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-5/6" style={{ backgroundColor: '#123458' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating decoration card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="absolute -right-4 -bottom-4 bg-white rounded-lg shadow-xl p-3"
              >
                <p className="text-xs text-gray-500">Tasks Done</p>
                <p className="text-base font-bold" style={{ color: '#123458' }}>+24%</p>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Brand logos at bottom */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-8 opacity-50">
          <span className="text-white text-sm">Trusted by teams at</span>
        </div>
      </div>
    </div>
  )
}
