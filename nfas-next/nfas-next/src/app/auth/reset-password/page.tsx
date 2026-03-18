'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password,  setPassword]  = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const [ready,     setReady]     = useState(false)

  // Supabase sends the recovery token in the URL hash — we need to exchange it
  useEffect(() => {
    const supabase = createClient()
    // Listen for the PASSWORD_RECOVERY event which fires when the user lands from the email link
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    setError(''); setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) { setError(error.message); return }

    // Redirect to login after brief pause
    setTimeout(() => router.push('/auth/login'), 1500)
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
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 800, color: '#0a1628', letterSpacing: '-1px', marginBottom: 8 }}>Set New Password</h1>
            <p style={{ fontSize: 14, color: '#64748b' }}>Enter your new password below</p>
          </div>

          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', padding: '32px' }}>
            {!ready ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#64748b', fontSize: 14 }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                Verifying your reset link…
              </div>
            ) : (
              <>
                {error && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#dc2626' }}>{error}</div>
                )}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0a1628', marginBottom: 6 }}>New Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} autoFocus
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor='#0a1628'}
                      onBlur={e => e.target.style.borderColor='#e2e8f0'} />
                    <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>Minimum 8 characters</p>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#0a1628', marginBottom: 6 }}>Confirm Password</label>
                    <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor='#0a1628'}
                      onBlur={e => e.target.style.borderColor='#e2e8f0'} />
                  </div>
                  <button type="submit" disabled={loading}
                    style={{ padding: '12px', background: loading ? '#94a3b8' : '#f0a500', color: '#0a1628', border: 'none', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', marginTop: 4 }}>
                    {loading ? 'Updating password…' : 'Set New Password'}
                  </button>
                </form>
                {loading && (
                  <div style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: '#15803d', fontWeight: 600 }}>
                    ✓ Password updated — redirecting to login…
                  </div>
                )}
              </>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#64748b' }}>
            <Link href="/auth/login" style={{ color: '#0a1628', fontWeight: 600, textDecoration: 'none' }}>← Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
