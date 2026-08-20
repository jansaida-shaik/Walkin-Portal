import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('userRole')?.value || 'unknown';
  const { pathname } = request.nextUrl;

  // Paths that do not require authentication
  const isPublicPath = pathname === '/login' || pathname === '/walkin-form';

  if (!token && !isPublicPath) {
    // Redirect to login if unauthenticated and trying to access a protected route
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (token && pathname === '/login') {
    // Redirect to dashboard if authenticated and trying to access login
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // RBAC Checks for Administrative Routes
  const isAdminOnly = pathname.startsWith('/settings') || 
                      pathname.startsWith('/reports') || 
                      pathname.startsWith('/webhooks') ||
                      pathname.startsWith('/counsellors');

  const isAdminRole = role === 'role_super_admin' || role === 'role_admin' || role === 'role_manager';

  if (token && isAdminOnly && !isAdminRole) {
    // Redirect non-admin users trying to access admin restricted areas
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
