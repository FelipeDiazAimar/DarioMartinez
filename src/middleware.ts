import { NextRequest, NextResponse } from 'next/server';

const ADMIN_AUTH_COOKIE = 'admin_auth';

function isAdminAuthenticated(request: NextRequest) {
  return request.cookies.get(ADMIN_AUTH_COOKIE)?.value === '1';
}

function isProtectedAdminPath(pathname: string) {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function resolveLoginRedirectTarget(nextParam: string | null) {
  if (!nextParam) return '/admin';

  const cleanTarget = nextParam.split('#')[0];
  return isProtectedAdminPath(cleanTarget) ? cleanTarget : '/admin';
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const authenticated = isAdminAuthenticated(request);

  if (isProtectedAdminPath(pathname)) {
    if (!authenticated) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin-login';
      loginUrl.search = '';

      const nextPath = `${pathname}${search}`;
      loginUrl.searchParams.set('next', nextPath);

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
  matcher: ['/admin/:path*', '/admin-login'],
};
