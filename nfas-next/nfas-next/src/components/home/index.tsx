'use client'
import Link from 'next/link'
import { useState } from 'react'

// ── Shared style helpers ────────────────────────────────────
const S = { fontFamily: "'DM Sans',system-ui,sans-serif" }
const SYNE = { fontFamily: "'Syne',sans-serif" }

// ── HeroSection ─────────────────────────────────────────────
export function HeroSection() {
  const [tab, setTab] = useState<'customer'|'fitter'>('customer')
  return (
    <section style={{ background: '#0a1628', position: 'relative', overflow: 'hidden', paddingBottom: 80 }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.035) 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: -100, right: -60, width: 580, height: 580, background: 'radial-gradient(circle,rgba(240,165,0,0.11) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '90px 24px 0' }}>
        <div style={{ maxWidth: 680 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(240,165,0,0.14)', border: '1px solid rgba(240,165,0,0.28)', color: '#f0a500', padding: '5px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 26 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#f0a500' }} />
            UK's #1 Flatpack Assembly Service
          </div>
          <h1 style={{ ...SYNE, fontSize: 'clamp(40px,5.5vw,66px)', fontWeight: 800, color: '#fff', lineHeight: 1.06, letterSpacing: '-2px', marginBottom: 20 }}>
            Your furniture,<br /><span style={{ color: '#f0a500' }}>built perfectly.</span>
          </h1>
          <p style={{ ...S, fontSize: 17, color: 'rgba(255,255,255,0.58)', lineHeight: 1.75, maxWidth: 480, marginBottom: 40, fontWeight: 300 }}>
            Post your job in 2 minutes. Get matched with a verified local fitter. Sit back while it gets done.
          </p>
          {/* Tab switcher */}
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 5, display: 'inline-flex', gap: 3, marginBottom: 18 }}>
            {(['customer','fitter'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ ...S, padding: '9px 22px', borderRadius: 11, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: tab === t ? '#f0a500' : 'transparent', color: tab === t ? '#0a1628' : 'rgba(255,255,255,0.55)', transition: 'all 0.18s' }}>
                {t === 'customer' ? 'I need assembly' : "I'm a fitter"}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {tab === 'customer' ? <>
              <Link href="/auth/register-customer" style={{ ...S, background: '#f0a500', color: '#0a1628', padding: '14px 28px', borderRadius: 11, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>Post a Job — Free</Link>
              <Link href="/how-it-works" style={{ ...S, background: 'rgba(255,255,255,0.09)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)', padding: '14px 24px', borderRadius: 11, fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'inline-block' }}>See how it works →</Link>
            </> : <>
              <Link href="/auth/register-fitter" style={{ ...S, background: '#f0a500', color: '#0a1628', padding: '14px 28px', borderRadius: 11, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>Register as a Fitter</Link>
              <Link href="/jobs" style={{ ...S, background: 'rgba(255,255,255,0.09)', color: '#fff', border: '1px solid rgba(255,255,255,0.14)', padding: '14px 24px', borderRadius: 11, fontSize: 14, fontWeight: 500, textDecoration: 'none', display: 'inline-block' }}>View available leads →</Link>
            </>}
          </div>
        </div>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 1, background: 'rgba(255,255,255,0.07)', borderRadius: 14, marginTop: 60, overflow: 'hidden' }}>
          {[['2,400+','Jobs Completed'],['340+','Verified Fitters'],['4.9★','Average Rating'],['48h','Avg Match Time']].map(([v,l]) => (
            <div key={l} style={{ padding: '22px 24px', background: 'rgba(255,255,255,0.035)', textAlign: 'center' }}>
              <div style={{ ...SYNE, fontSize: 26, fontWeight: 800, color: '#f0a500', letterSpacing: '-1px' }}>{v}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 3, fontWeight: 500 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── FurnitureTypes ───────────────────────────────────────────
export function FurnitureTypes() {
  const items = [['🚪','Wardrobes'],['🛏','Bed Frames'],['🍳','Flat-Pack Kitchens'],['📚','Shelving & Storage'],['💼','Desks & Office'],['🪑','Dining Sets'],['📺','TV Units'],['🗄','Chest of Drawers']]
  return (
    <section style={{ padding: '64px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f0a500', marginBottom: 10 }}>What we assemble</p>
        <h2 style={{ ...SYNE, fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>Any flat-pack, anywhere in the UK</h2>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {items.map(([emoji,name]) => (
          <span key={name} style={{ ...S, display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 18px', borderRadius: 999, border: '1.5px solid #e2e8f0', background: '#fff', fontSize: 13, fontWeight: 500, color: '#0a1628', cursor: 'pointer', transition: 'all 0.15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='#0a1628'; (e.currentTarget as HTMLElement).style.color='#fff'; (e.currentTarget as HTMLElement).style.borderColor='#0a1628' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='#fff'; (e.currentTarget as HTMLElement).style.color='#0a1628'; (e.currentTarget as HTMLElement).style.borderColor='#e2e8f0' }}>
            <span style={{ fontSize: 16 }}>{emoji}</span>{name}
          </span>
        ))}
        <span style={{ ...S, display: 'inline-flex', alignItems: 'center', padding: '11px 18px', borderRadius: 999, border: '1.5px dashed #e2e8f0', fontSize: 13, color: '#94a3b8' }}>+ much more</span>
      </div>
    </section>
  )
}

// ── HowItWorks ───────────────────────────────────────────────
export function HowItWorks() {
  const steps = [
    { n: '01', title: 'Describe your job', body: 'Select your furniture items, add your postcode and preferred date. Takes 2 minutes.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
    { n: '02', title: 'We match your fitter', body: 'Local verified fitters in your area see the job and one is matched to you automatically.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
    { n: '03', title: 'Job done. You review.', body: 'Your fitter arrives, assembles everything, and you leave a verified review. Simple.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12"/></svg> },
  ]
  return (
    <section style={{ background: '#fff', padding: '72px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f0a500', marginBottom: 10 }}>Simple process</p>
          <h2 style={{ ...SYNE, fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>Three steps to done</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {steps.map(step => (
            <div key={step.n} style={{ background: '#f8f9fc', borderRadius: 18, padding: '32px 28px', position: 'relative', border: '1px solid #f0f2f5', transition: 'transform 0.18s, box-shadow 0.18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 14px 36px rgba(10,22,40,0.1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='none' }}>
              <span style={{ ...SYNE, position: 'absolute', top: 20, right: 24, fontSize: 36, fontWeight: 800, color: '#f0f2f5', letterSpacing: '-2px' }}>{step.n}</span>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#0a1628', color: '#f0a500', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>{step.icon}</div>
              <h3 style={{ ...SYNE, fontSize: 18, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.4px' }}>{step.title}</h3>
              <p style={{ ...S, fontSize: 13, color: '#64748b', lineHeight: 1.7 }}>{step.body}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/auth/register-customer" style={{ ...S, background: '#0a1628', color: '#fff', padding: '14px 32px', borderRadius: 11, fontSize: 14, fontWeight: 600, textDecoration: 'none', display: 'inline-block' }}>Post your first job — it's free</Link>
        </div>
      </div>
    </section>
  )
}

// ── Reviews ──────────────────────────────────────────────────
export function Reviews() {
  const reviews = [
    { name: 'Sarah M.', loc: 'Manchester', text: 'Fitter arrived on time and built my entire IKEA PAX wardrobe in under 2 hours. Absolutely brilliant service.', job: '4x IKEA PAX' },
    { name: 'James T.', loc: 'Bristol',    text: 'Used NFAS twice now. The matching system is great — had a fitter confirmed within the day both times.',           job: 'HEMNES Bed Frame' },
    { name: 'Priya K.', loc: 'London',     text: 'My fitter was professional, tidy, and even moved the old boxes to the bin. Would 100% recommend.',                job: 'Office desk & bookcase' },
  ]
  return (
    <section style={{ padding: '72px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f0a500', marginBottom: 10 }}>Real customers</p>
            <h2 style={{ ...SYNE, fontSize: 32, fontWeight: 800, letterSpacing: '-1px' }}>Don't take our word for it</h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #f0f2f5', borderRadius: 11, padding: '10px 18px' }}>
            <span style={{ color: '#f0a500', fontSize: 13 }}>★★★★★</span>
            <span style={{ ...SYNE, fontSize: 20, fontWeight: 800 }}>4.9</span>
            <span style={{ ...S, fontSize: 12, color: '#94a3b8' }}>from 1,240 reviews</span>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {reviews.map(r => (
            <div key={r.name} style={{ background: '#fff', borderRadius: 18, padding: '24px', border: '1px solid #f0f2f5', transition: 'transform 0.18s, box-shadow 0.18s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform='translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow='0 14px 36px rgba(10,22,40,0.1)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform='none'; (e.currentTarget as HTMLElement).style.boxShadow='none' }}>
              <div style={{ color: '#f0a500', fontSize: 13, marginBottom: 14 }}>★★★★★</div>
              <p style={{ ...S, fontSize: 13, lineHeight: 1.75, color: '#374151', marginBottom: 18 }}>"{r.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#0a1628', color: '#f0a500', display: 'flex', alignItems: 'center', justifyContent: 'center', ...SYNE, fontWeight: 800, fontSize: 12 }}>{r.name[0]}</div>
                  <div><div style={{ ...S, fontSize: 12, fontWeight: 600 }}>{r.name}</div><div style={{ fontSize: 10, color: '#94a3b8' }}>{r.loc}</div></div>
                </div>
                <span style={{ ...S, fontSize: 10, color: '#94a3b8', background: '#f8f9fc', padding: '3px 9px', borderRadius: 999 }}>{r.job}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── ForFitters ───────────────────────────────────────────────
export function ForFitters() {
  return (
    <section style={{ background: '#0a1628', padding: '72px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 450, height: 450, background: 'radial-gradient(circle,rgba(240,165,0,0.07) 0%,transparent 68%)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#f0a500', marginBottom: 14 }}>For fitters</p>
          <h2 style={{ ...SYNE, fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 18 }}>Turn your skills into a steady income</h2>
          <p style={{ ...S, fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.8, marginBottom: 32, fontWeight: 300 }}>Browse local assembly jobs, purchase leads with credits, and build your reputation. No agency fees, no fixed hours.</p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
            {['Browse real jobs in your area before you commit','Buy only the leads you want — credits never expire','Build a verified profile with customer reviews','Free to register — no monthly subscription'].map(item => (
              <li key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#f0a500', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0a1628" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <span style={{ ...S, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>{item}</span>
              </li>
            ))}
          </ul>
          <Link href="/auth/register-fitter" style={{ ...S, background: '#f0a500', color: '#0a1628', padding: '14px 28px', borderRadius: 11, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>Register as a Fitter →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[['£380','Avg weekly earnings','for active fitters'],['1 credit','Typical lead cost','from £2.50'],['24hrs','First lead time','after registering'],['0%','Commission taken','you keep everything']].map(([v,l,s]) => (
            <div key={l} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '20px' }}>
              <div style={{ ...SYNE, fontSize: 26, fontWeight: 800, color: '#f0a500', letterSpacing: '-1px', marginBottom: 3 }}>{v}</div>
              <div style={{ ...S, fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 2 }}>{l}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── CtaBand ──────────────────────────────────────────────────
export function CtaBand() {
  return (
    <section style={{ background: '#f0a500', padding: '72px 24px', textAlign: 'center' }}>
      <h2 style={{ ...SYNE, fontSize: 'clamp(30px,4.5vw,48px)', fontWeight: 800, color: '#0a1628', letterSpacing: '-2px', marginBottom: 14 }}>Ready to get started?</h2>
      <p style={{ ...S, fontSize: 15, color: 'rgba(10,22,40,0.6)', marginBottom: 36, fontWeight: 300 }}>Post your job today. No payment needed, no account required to browse.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href="/auth/register-customer" style={{ ...S, background: '#0a1628', color: '#fff', padding: '15px 36px', borderRadius: 11, fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>Post a Job — Free</Link>
        <Link href="/auth/register-fitter" style={{ ...S, background: 'rgba(10,22,40,0.1)', color: '#0a1628', padding: '15px 32px', borderRadius: 11, fontSize: 14, fontWeight: 600, border: '2px solid rgba(10,22,40,0.14)', textDecoration: 'none', display: 'inline-block' }}>Register as a Fitter</Link>
      </div>
    </section>
  )
}
