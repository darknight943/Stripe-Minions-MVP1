
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const mockUserRole = 'user'; // This can be 'admin' or 'user' for testing

  if (request.nextUrl.pathname === '/dashboard') {
    if (mockUserRole === 'admin') {
      return NextResponse.next();
    } else {
      // Redirect to the home page if not an admin
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Continue to the next middleware or the requested page
  return NextResponse.next();
}

// Configure the middleware to run only on specific paths
export const config = {
  matcher: ['/dashboard'],
};
