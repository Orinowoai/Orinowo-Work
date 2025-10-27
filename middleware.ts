import { NextResponse, NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const cookieName = 'x-user-id'
  let userId = req.cookies.get(cookieName)?.value
  if (!userId) {
    userId = crypto.randomUUID()
    res.cookies.set(cookieName, userId, { path: '/', httpOnly: false, sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 })
  }
  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
