import { NextRequest, NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth',
  '/api/v1/auth/login',
  '/api/v1/auth/register',
];

// Define API routes that don't require authentication
const publicApiRoutes = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow all static files and Next.js internal routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.') // Static files (css, js, images, etc.)
  ) {
    return NextResponse.next();
  }

  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route));

  // Allow public routes
  if (isPublicRoute || isPublicApiRoute) {
    return NextResponse.next();
  }

  // For API routes, check for Bearer token
  if (pathname.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication required', message: 'No valid token provided' },
        { status: 401 }
      );
    }

    // Let the API route handle token validation
    return NextResponse.next();
  }

  // For page routes, check for auth token in cookies or redirect to auth
  const token = request.cookies.get('auth_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    // Redirect to auth page
    const authUrl = new URL('/auth', request.url);
    authUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(authUrl);
  }

  // If token exists, let the page handle token validation
  // The client-side auth hook will verify the token
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
