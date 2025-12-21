"use client"

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'

function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)
    
    const result = await login(email, password)
    
    if (result.success) {
      // Set cookie for middleware to read
      document.cookie = `auth_token=${localStorage.getItem('auth_token')}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
      toast.success('Welcome back!')
      router.push(redirectTo)
    } else {
      toast.error(result.error || 'Login failed')
    }
    
    setIsLoading(false)
  }

  return (
    <AuthLayout
      title="Get Started Now"
      subtitle="Enter your credentials to access your account"
    >
      {/* Social Login Buttons */}
      <SocialLoginButtons />

      {/* Divider - "or" separator */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div 
            className="w-full border-t"
            style={{ borderColor: '#D4C9BE' }}
          />
        </div>
        <div className="relative flex justify-center text-sm">
          <span 
            className="px-4"
            style={{ backgroundColor: '#F1EFEC', color: '#666666' }}
          >
            or
          </span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1">
          <label 
            htmlFor="email" 
            className="block text-sm font-medium"
            style={{ color: '#030303' }}
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2.5 rounded-lg border-2 outline-none transition-all duration-200 focus:ring-2"
            style={{ 
              borderColor: '#D4C9BE',
              backgroundColor: 'white',
              color: '#030303'
            }}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium"
              style={{ color: '#030303' }}
            >
              Password
            </label>
            <Link 
              href="/forgot-password" 
              className="text-sm font-medium hover:underline"
              style={{ color: '#123458' }}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="min 8 chars"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2.5 pr-10 rounded-lg border-2 outline-none transition-all duration-200 focus:ring-2"
              style={{ 
                borderColor: '#D4C9BE',
                backgroundColor: 'white',
                color: '#030303'
              }}
            />
            {/* Password visibility toggle button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: '#666666' }}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Terms & Privacy Checkbox */}
        <div className="flex items-center gap-2">
          <input
            id="terms"
            type="checkbox"
            checked={agreedToTerms}
            onChange={(e) => setAgreedToTerms(e.target.checked)}
            className="w-4 h-4 rounded border-2 cursor-pointer"
            style={{ 
              borderColor: '#D4C9BE',
              accentColor: '#123458'
            }}
          />
          <label 
            htmlFor="terms" 
            className="text-sm cursor-pointer"
            style={{ color: '#666666' }}
          >
            I agree to the{' '}
            <Link href="/terms" className="underline font-medium" style={{ color: '#123458' }}>
              Terms & Privacy
            </Link>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 rounded-full font-semibold text-white transition-all duration-200 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: '#123458' }}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>

      {/* Sign Up Link */}
      <p className="text-center mt-4" style={{ color: '#666666' }}>
        Don't have an account?{' '}
        <Link 
          href="/sign-up" 
          className="font-medium hover:underline"
          style={{ color: '#123458' }}
        >
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <SignInForm />
    </Suspense>
  )
}
