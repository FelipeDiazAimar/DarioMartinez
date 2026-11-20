import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, getSessionSecret, verifySessionToken } from '@/lib/admin-session';

function isProtectedAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function isProtectedAdminApi(pathname: string) {
  return pathname === '/api/admin' || pathname.startsWith('/api/admin/');
}

function resolveLoginRedirectTarget(nextParam: string | null) {
  if (!nextParam) return '/admin';

  const cleanTarget = nextParam.split('#')[0];
  return isProtectedAdminPath(cleanTarget) ? cleanTarget : '/admin';
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = await verifySessionToken(
    request.cookies.get(ADMIN_SESSION_COOKIE)?.value,
    getSessionSecret(),
  );

  if (isProtectedAdminApi(pathname)) {
    if (!authenticated) {
      return NextResponse.json({ success: false, message: 'No autorizado.' }, { status: 401 });
    }

    return NextResponse.next();
  }

  if (isProtectedAdminPath(pathname)) {
    if (!authenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin-login';
      loginUrl.search = '';
      loginUrl.searchParams.set('next', `${pathname}${search}`);

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  if (pathname === '/admin-login' && authenticated) {
    const destination = resolveLoginRedirectTarget(request.nextUrl.searchParams.get('next'));

    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/admin-login', '/api/admin', '/api/admin/:path*'],
};
