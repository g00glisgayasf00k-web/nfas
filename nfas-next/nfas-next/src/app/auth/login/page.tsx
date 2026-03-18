'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const params = useSearchParams()
  const redirect = params.get('redirect') ?? '/dashboard/customer'
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError('Incorrect email or password.'); setLoading(false); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    const role = profile?.role
    if (role === 'fitter') router.push('/dashboard/fitter')
    else if (role === 'admin') router.push('/dashboard/admin')
    else router.push(redirect)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-brand-navy">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center">
          <Link href="/" className="font-heading text-white font-extrabold text-lg tracking-tight">
            National <span className="text-brand-amber">Flatpack</span> Assembly
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-navy text-brand-amber flex items-center justify-center mx-auto mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <h1 className="font-heading text-2xl font-extrabold tracking-tight">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">Log in to your account</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            {error && <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-brand-navy mb-1.5">Email address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors"
                  placeholder="you@example.com" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-brand-navy">Password</label>
                  <a href="#" className="text-xs text-gray-400 hover:text-brand-navy transition-colors">Forgot password?</a>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy transition-colors"
                  placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold bg-brand-navy text-white hover:bg-brand-navy-mid transition-colors disabled:opacity-60 mt-2">
                {loading ? 'Logging in…' : 'Log In'}
              </button>
            </form>
          </div>
          <p className="mt-6 text-center text-sm text-gray-500">
            Need an account?{' '}
            <Link href="/auth/register-customer" className="font-semibold text-brand-navy hover:underline">Customer</Link>
            {' '}or{' '}
            <Link href="/auth/register-fitter" className="font-semibold text-brand-navy hover:underline">Fitter</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
