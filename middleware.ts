import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Initialize jobs on first request
let jobsInitialized = false;

export async function middleware(request: NextRequest) {
  // Initialize background jobs on first request
  if (!jobsInitialized) {
    try {
      await fetch(`${request.nextUrl.origin}/api/init`, {
        method: 'GET',
      });
      jobsInitialized = true;
    } catch (error) {
      console.error('Failed to initialize jobs:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/init (initialization endpoint)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/init|_next/static|_next/image|favicon.ico).*)',
  ],
};
