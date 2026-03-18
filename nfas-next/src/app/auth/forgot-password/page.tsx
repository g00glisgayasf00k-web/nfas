'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    const supabase  = createClient()
    const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/auth/reset-password`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setSent(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>
      <header style={{ background: '#0a1628', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <Link href="/" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', textDecoration: 'none' }}>
          National <span style={{ color: '#f0a500' }}>Flatpack</span> Assembly
        </Link>
      </header>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: '#0a1628', letterSpacing: '-1px', marginBottom: 8 }}>Reset Password</h1>
            <p style={{ fontSize: 14, color: '#64748b' }}>Enter your email and we'll send a reset link</p>
          </div>

          {sent ? (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', padding: '32px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#0a1628', marginBottom: 8 }}>Check your email</h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, marginBottom: 20 }}>
                We've sent a password reset link to <strong>{email}</strong>. Check your inbox (and spam folder just in case).
              </p>
              <Link href="/auth/login" style={{ display: 'inline-block', padding: '10px 22px', background: '#0a1628', color: '#fff', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                Back to Login
              </Link>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', padding: '32px' }}>
              {error && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#dc2626' }}>{error}</div>
              )}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0a1628', marginBottom: 6 }}>Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor='#0a1628'}
                    onBlur={e => e.target.style.borderColor='#e2e8f0'} />
                </div>
                <button type="submit" disabled={loading}
                  style={{ padding: '12px', background: loading ? '#94a3b8' : '#0a1628', color: '#fff', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>
              </form>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
            Remember your password?{' '}
            <Link href="/auth/login" style={{ color: '#0a1628', fontWeight: 600, textDecoration: 'none' }}>Log in →</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
