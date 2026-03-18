'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'DM Sans',system-ui,sans-serif", background: '#f8f9fc' }}>
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0a1628', marginBottom: 10 }}>Something went wrong</h2>
            <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28, maxWidth: 360, lineHeight: 1.7 }}>
              An unexpected error occurred. Please try again or return home.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={reset}
                style={{ padding: '10px 22px', background: '#f0a500', color: '#0a1628', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Try Again
              </button>
              <a href="/" style={{ display: 'inline-block', padding: '10px 22px', border: '1.5px solid #e2e8f0', color: '#0a1628', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: '#fff' }}>
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
