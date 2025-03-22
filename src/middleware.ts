
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createMiddlewareClient({ req, res });

    // Refresh the session to extend the user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    // Add any path-specific middleware logic here
    const path = req.nextUrl.pathname;

    // No need to verify auth for public paths or if we have a session
    if (session || isPublicPath(path)) {
      return res;
    }
    
    // If we're not on a public path and don't have a session, redirect to login
    const redirectUrl = new URL('/auth/login', req.url);
    redirectUrl.searchParams.set('redirectedFrom', path);
    
    return NextResponse.redirect(redirectUrl);
    
  } catch (error) {
    console.error('Middleware error:', error);
    // Return the original response if something goes wrong
    return NextResponse.next();
  }
}

// Helper function to check if a path is public
function isPublicPath(path: string): boolean {
  const PUBLIC_PATHS = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/reset-password',
    '/auth/new-password',
  ];
  
  return PUBLIC_PATHS.some(publicPath => path === publicPath) || 
         path.startsWith('/_next') || 
         path.startsWith('/static') ||
         path.startsWith('/api/auth');
}

// Only run this middleware on routes that need authentication
export const config = {
  matcher: [
    // Exclude files with extensions, api routes, and static files
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
