import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const authRoutes      = ['/auth/login', '/auth/register-customer', '/auth/register-fitter']
  const customerRoutes  = ['/dashboard/customer']
  const fitterRoutes    = ['/dashboard/fitter']
  const affiliateRoutes = ['/dashboard/affiliate']
  const adminRoutes     = ['/dashboard/admin']
  const protectedRoutes = [...customerRoutes, ...fitterRoutes, ...affiliateRoutes, ...adminRoutes]

  // Redirect logged-in users away from auth pages
  if (user && authRoutes.some(r => pathname.startsWith(r))) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role
    const dest =
      role === 'fitter'    ? '/dashboard/fitter'    :
      role === 'affiliate' ? '/dashboard/affiliate' :
      role === 'admin'     ? '/dashboard/admin'     :
      '/dashboard/customer'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Redirect unauthenticated from protected routes
  if (!user && protectedRoutes.some(r => pathname.startsWith(r))) {
    const loginUrl = new URL('/auth/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access enforcement
  if (user && protectedRoutes.some(r => pathname.startsWith(r))) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    const role = profile?.role

    if (pathname.startsWith('/dashboard/fitter')    && role !== 'fitter'    && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/customer', request.url))
    }
    if (pathname.startsWith('/dashboard/affiliate') && role !== 'affiliate' && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/customer', request.url))
    }
    if (pathname.startsWith('/dashboard/admin')     && role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
