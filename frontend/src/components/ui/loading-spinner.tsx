import { Loader2, LucideProps } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps extends LucideProps {
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingSpinner({ size = 'md', className, ...props }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
  }

  return (
    <Loader2 
      className={cn('animate-spin text-gray-400', sizeClasses[size], className)} 
      {...props}
    />
  )
}

// Alternative with different icon
export function SpinnerDots({ size = 'md', className, ...props }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12',
  }

  return (
    <div className={cn('animate-spin', sizeClasses[size], className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="w-full h-full"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-400">Loading CollabSpace...</p>
      </div>
    </div>
  )
}
