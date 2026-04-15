import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_PATHS  = ['/login', '/magic-link', '/v/']
const ADMIN_PATHS   = ['/admin']
const CLIENT_PATHS  = ['/client']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Rutes públiques — sempre accessibles
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const token = request.cookies.get('accessToken')?.value
    || request.headers.get('authorization')?.split(' ')[1]

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Nota: la verificació del rol es fa al backend.
  // El middleware Next.js només comprova presència del token.
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/client/:path*'],
}
