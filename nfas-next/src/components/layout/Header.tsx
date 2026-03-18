'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'

interface HeaderProps {
  profile?: Profile | null
}

export function Header({ profile }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const dashboardHref =
    profile?.role === 'fitter'    ? '/dashboard/fitter' :
    profile?.role === 'admin'     ? '/dashboard/admin'  :
    profile?.role === 'affiliate' ? '/dashboard/affiliate' :
    '/dashboard/customer'

  return (
    <header className="bg-brand-navy border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="font-heading text-white font-bold text-xl leading-none">
              National <span className="text-brand-amber">Flatpack</span> Assembly
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/jobs"
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === '/jobs'
                  ? 'text-white bg-white/10'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              Browse Jobs
            </Link>
            <Link
              href="/how-it-works"
              className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              How It Works
            </Link>
          </nav>

          {/* Auth */}
          <div className="flex items-center gap-3">
            {profile ? (
              <>
                <Link
                  href={dashboardHref}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <span className="w-7 h-7 rounded-full bg-brand-amber text-brand-navy flex items-center justify-center text-xs font-bold shrink-0">
                    {profile.first_name?.[0]?.toUpperCase() ?? '?'}
                  </span>
                  My Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/register-customer"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-brand-amber text-brand-navy hover:bg-amber-400 transition-colors"
                >
                  Post a Job
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
