import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/workspace',
  '/projects',
  '/team',
  '/settings',
  '/calendar',
  '/messages',
]

// Routes that should redirect to dashboard if user is authenticated
const authRoutes = ['/sign-in', '/sign-up']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check for auth token in cookies (for server-side) or we'll let client handle it
  const token = request.cookies.get('auth_token')?.value

  // For protected routes, if no token exists, redirect to sign-in
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // If it's a protected route and no token, redirect to sign-in
  // Note: The actual auth check happens client-side. This is a basic guard.
  // For a more secure implementation, you'd verify the JWT here.
  if (isProtectedRoute && !token) {
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(signInUrl)
  }

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
