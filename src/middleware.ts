import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh the session if it exists
  await supabase.auth.getSession();

  return res;
}

// Only run this middleware on routes that need authentication
export const config = {
  matcher: [
    // Exclude files with extensions, api routes, and static files
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}; 