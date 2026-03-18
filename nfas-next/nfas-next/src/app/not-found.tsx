import Link from 'next/link'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>
      <header style={{ background: '#0a1628', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <Link href="/" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', textDecoration: 'none' }}>
          National <span style={{ color: '#f0a500' }}>Flatpack</span> Assembly
        </Link>
      </header>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', textAlign: 'center' }}>
        <div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 96, fontWeight: 800, color: '#f0a500', letterSpacing: '-4px', lineHeight: 1 }}>404</div>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 26, fontWeight: 700, color: '#0a1628', marginTop: 16, marginBottom: 10, letterSpacing: '-0.5px' }}>Page not found</h1>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32, maxWidth: 360, lineHeight: 1.7 }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/" style={{ display: 'inline-block', padding: '11px 24px', background: '#0a1628', color: '#fff', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
              Go Home
            </Link>
            <Link href="/jobs" style={{ display: 'inline-block', padding: '11px 24px', border: '1.5px solid #e2e8f0', color: '#0a1628', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none', background: '#fff' }}>
              Browse Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
