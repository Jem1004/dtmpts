import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export function middleware(request: NextRequest) {
  // Check if the request is for admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip middleware for login page
    if (request.nextUrl.pathname === '/admin') {
      return NextResponse.next();
    }

    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    try {
      // Verify token
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch (error) {
      // Redirect to login if token is invalid
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // Check if the request is for admin API routes
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    // Skip middleware for login API
    if (request.nextUrl.pathname === '/api/admin/login') {
      return NextResponse.next();
    }

    // Get token from Authorization header or cookies
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      // Verify token
      jwt.verify(token, process.env.JWT_SECRET!);
      return NextResponse.next();
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};