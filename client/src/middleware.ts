import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('autopulse-auth-storage');;
  let isAuthenticated = false;

  if (authCookie) {
    try {
      const authData = JSON.parse(authCookie.value);
      if (authData.state?.accessToken) {
        isAuthenticated = true;
      }
    } catch (e) {
      console.error('Failed to parse auth cookie:', e);
    }
  }

  const { pathname } = request.nextUrl;

  const isAuthPage = pathname.startsWith('/signin') || pathname.startsWith('/signup');
  const isProtectedPage = pathname.startsWith('/dashboard');

  if (isAuthPage) {
    if (isAuthenticated) {
      // If logged in, redirect from auth pages to the dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else if (isProtectedPage) {
    if (!isAuthenticated) {
      // If not logged in, redirect from protected pages to signin
      return NextResponse.redirect(new URL('/signin', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*', '/signin', '/signup'],
}; 