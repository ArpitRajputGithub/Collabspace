import type { Metadata } from 'next'
import { Inter, Montserrat, Forum } from 'next/font/google'
import { ThemeProvider } from '@/providers/theme-provider'
import { QueryProvider } from '@/providers/query-provider'
import { SocketProvider } from '@/providers/socket-provider'
import { AuthProvider } from '@/providers/auth-provider'

import { Toaster } from '@/components/ui/sonner'
import './globals.css'


const inter = Inter({ subsets: ['latin'], weight: ['500','600','700'], variable: '--font-inter' })
const montserrat = Montserrat({ subsets: ['latin'], weight: ['400','500','600','700'], variable: '--font-montserrat', display: 'swap' })
const forum = Forum({ weight: '400', subsets: ['latin'], variable: '--font-forum', display: 'swap' })

export const metadata: Metadata = {
  title: 'CollabSpace - Team Collaboration Platform',
  description: 'Modern team collaboration with real-time messaging, project management, and more.',
  keywords: ['collaboration', 'team', 'project management', 'real-time', 'workspace'],
  authors: [{ name: 'Your Name' }],
  creator: 'CollabSpace Team',
  publisher: 'CollabSpace',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${montserrat.className} ${inter.variable} ${forum.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              <SocketProvider>
                <div className="relative flex min-h-screen flex-col bg-background">
                  {children}
                </div>
                <Toaster />
              </SocketProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
