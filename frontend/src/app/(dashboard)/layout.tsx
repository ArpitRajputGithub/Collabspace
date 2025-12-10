import { AppSidebar } from '@/components/dashboard/app-sidebar'
import { TopBar } from '@/components/dashboard/top-bar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-gray-900">
      {/* Subtle Background Effects - Dark Theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-gray-800 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative flex min-h-screen">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <TopBar />
          <main className="flex-1">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
