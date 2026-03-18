import Link from 'next/link'

const COLS = [
  { title: 'Customers', links: [['Post a Job', '/auth/register-customer'], ['How It Works', '/how-it-works'], ['Browse Jobs', '/jobs'], ['FAQ', '/faq']] },
  { title: 'Fitters',   links: [['Register', '/auth/register-fitter'], ['Buy Credits', '/dashboard/fitter?tab=credits'], ['How Leads Work', '/how-it-works#fitters'], ['Dashboard', '/dashboard/fitter']] },
  { title: 'Company',   links: [['About', '/about'], ['Contact', '/contact'], ['Privacy Policy', '/privacy'], ['Terms', '/terms']] },
]

export function Footer() {
  return (
    <footer style={{ background: '#060e1a', padding: '48px 24px 28px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 16, color: '#fff', marginBottom: 12 }}>
              National <span style={{ color: '#f0a500' }}>Flatpack</span> Assembly
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.8, maxWidth: 200 }}>
              Connecting customers with trusted local assembly fitters across the UK.
            </p>
          </div>
          {COLS.map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginBottom: 14 }}>{col.title}</div>
              {col.links.map(([label, href]) => (
                <Link key={label} href={href} style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 8, textDecoration: 'none' }}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>© 2026 National Flatpack Assembly Service Ltd. All rights reserved.</span>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Made in the UK 🇬🇧</span>
        </div>
      </div>
    </footer>
  )
}
