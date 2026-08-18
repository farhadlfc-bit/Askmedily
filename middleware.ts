import { NextResponse, type NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard', '/drug', '/condition', '/pricing', '/settings'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some(route => path.startsWith(route));

  if (!isProtected) return NextResponse.next();

  const sessionCookie = request.cookies.get('sb-hjllgaodcutlaqqievtn-auth-token');
  if (!sessionCookie?.value) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
