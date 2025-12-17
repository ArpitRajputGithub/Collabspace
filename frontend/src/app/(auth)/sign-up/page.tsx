"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, Check } from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'
import { toast } from 'sonner'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { SocialLoginButtons } from '@/components/auth/SocialLoginButtons'

/**
 * SignUpPage - Registration form with matching split-panel design
 * 
 * Uses the same AuthLayout and styling as sign-in for consistency.
 * Form fields: First Name, Last Name, Email, Password, Confirm Password
 */
export default function SignUpPage() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!firstName || !lastName || !email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (!allRequirementsMet) {
      toast.error('Password does not meet all requirements')
      return
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms & Privacy')
      return
    }

    setIsLoading(true)
    
    const result = await register({ firstName, lastName, email, password })
    
    if (result.success) {
      // Set cookie for middleware to read
      document.cookie = `auth_token=${localStorage.getItem('auth_token')}; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
      toast.success('Account created successfully!')
      router.push('/dashboard')
    } else {
      toast.error(result.error || 'Registration failed')
    }
    
    setIsLoading(false)
  }

  // Password validation helpers
  const passwordRequirements = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One lowercase letter', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One number', test: (p: string) => /\d/.test(p) },
    { label: 'One special character (@$#!%*?&)', test: (p: string) => /[@$#!%*?&]/.test(p) },
  ]

  const allRequirementsMet = passwordRequirements.every(req => req.test(password))

  // Reusable input style
  const inputStyle = {
    borderColor: '#D4C9BE',
    backgroundColor: 'white',
    color: '#030303'
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join CollabSpace and start collaborating with your team"
    >
      {/* Social Login Buttons */}
      <SocialLoginButtons />

      {/* Divider */}
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

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Name Row - Two columns */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label 
              htmlFor="firstName" 
              className="block text-sm font-medium"
              style={{ color: '#030303' }}
            >
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2.5 rounded-lg border-2 outline-none transition-all duration-200 focus:ring-2"
              style={inputStyle}
            />
          </div>
          <div className="space-y-1">
            <label 
              htmlFor="lastName" 
              className="block text-sm font-medium"
              style={{ color: '#030303' }}
            >
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2.5 rounded-lg border-2 outline-none transition-all duration-200 focus:ring-2"
              style={inputStyle}
            />
          </div>
        </div>

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
            style={inputStyle}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <label 
            htmlFor="password" 
            className="block text-sm font-medium"
            style={{ color: '#030303' }}
          >
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2.5 pr-10 rounded-lg border-2 outline-none transition-all duration-200 focus:ring-2"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: '#666666' }}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          
          {/* Password Requirements Checklist */}
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              {passwordRequirements.map((req, index) => {
                const isMet = req.test(password)
                return (
                  <div 
                    key={index} 
                    className="flex items-center gap-2 text-xs"
                  >
                    <div 
                      className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isMet ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    >
                      {isMet && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span style={{ color: isMet ? '#22c55e' : '#666666' }}>
                      {req.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1">
          <label 
            htmlFor="confirmPassword" 
            className="block text-sm font-medium"
            style={{ color: '#030303' }}
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2.5 rounded-lg border-2 outline-none transition-all duration-200 focus:ring-2"
            style={inputStyle}
          />
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
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Sign In Link */}
      <p className="text-center mt-4" style={{ color: '#666666' }}>
        Already have an account?{' '}
        <Link 
          href="/sign-in" 
          className="font-medium hover:underline"
          style={{ color: '#123458' }}
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
