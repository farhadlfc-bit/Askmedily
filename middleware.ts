import { NextResponse, type NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/drug', '/condition', '/pricing']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtected = protectedRoutes.some(route => path.startsWith(route))

  if (!isProtected) {
    return NextResponse.next()
  }

  // Check for Supabase session cookie
  const cookies = request.cookies.getAll()
  const hasSession = cookies.some(cookie => 
    cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')
  )

  if (!hasSession) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
