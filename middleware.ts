import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Pass through all requests - i18n is handled at the component level
  return NextResponse.next();
}

export const config = {
  // Match all pathnames except for
  // - API routes
  // - Static files
  // - _next
  // - favicon.ico
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
