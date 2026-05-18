import { NextResponse, type NextRequest } from 'next/server'

const COOKIE_NAME = 'cf_auth'
const PUBLIC_PATHS = ['/auth/login', '/auth/callback']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths through
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next({ request })
  }

  // Gate everything else on the auth cookie
  if (!request.cookies.get(COOKIE_NAME)?.value) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next({ request })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
