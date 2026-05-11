/**
 * Next.js Middleware — the "firewall" of the Review Engine.
 *
 * Responsibilities:
 * 1. Supabase session refresh (keeps cookies in sync).
 * 2. Strict origin enforcement on all /api/* routes.
 * 3. Route protection for /dashboard — redirects unauthenticated users.
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Origins allowed to call the API, read from env at startup.
// The dynamic cache in lib/security/origins.ts is for the Route Handlers;
// the middleware uses env only to stay edge-runtime compatible.
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Origin enforcement for API routes ─────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin')
    const method = request.method

    // Pre-flight OPTIONS — allow it through so CORS headers can be set
    if (method === 'OPTIONS') {
      return buildCorsResponse(origin)
    }

    // Non-browser clients (server-to-server) typically don't send Origin.
    // We only block cross-origin browser requests.
    if (origin !== null && !ALLOWED_ORIGINS.includes(origin)) {
      return new NextResponse(
        JSON.stringify({ error: 'Forbidden: origin not allowed' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        },
      )
    }
  }

  // ── 2. Supabase session refresh ───────────────────────────────────────────
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh session — do NOT use getUser() inside middleware to avoid overhead
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── 3. Dashboard route protection ────────────────────────────────────────
  if (pathname.startsWith('/dashboard') && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from login page
  if (pathname === '/login' && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}

/** Build a CORS pre-flight response */
function buildCorsResponse(origin: string | null): NextResponse {
  const isAllowed = origin !== null && ALLOWED_ORIGINS.includes(origin)
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
  if (isAllowed && origin) {
    headers['Access-Control-Allow-Origin'] = origin
  }
  return new NextResponse(null, { status: 204, headers })
}

export const config = {
  matcher: [
    // Run on all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
