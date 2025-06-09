import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // TODO: Implement proper authentication check
  // For now, we'll just check if there's a mock token
  const isAuthenticated = request.cookies.has('auth-token');
  
  // Protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  // Public routes when already authenticated
  if (isAuthenticated) {
    if (request.nextUrl.pathname === '/signin' || request.nextUrl.pathname === '/signup') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup'],
}; 