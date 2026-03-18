import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import Link from 'next/link'
import { formatTime, formatPriceDecimal } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Browse Jobs' }

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ postcode?: string; q?: string }>
}) {
  const params   = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  let query = supabase
    .from('jobs')
    .select('*, job_items(id,name,quantity)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(50)

  if (params.q) {
    // Use full-text search if available, fall back to ilike
    query = query.textSearch('search_vector', params.q, { type: 'websearch' })
  }

  const { data: jobs } = await query

  return (
    <>
      <Header profile={profile} />
      <main>
        {/* Hero */}
        <div style={{ background: '#0a1628', padding: '48px 24px 40px', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 6 }}>
              Browse Open Jobs
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', marginBottom: 24, fontWeight: 300 }}>
              {jobs?.length ?? 0} job{jobs?.length !== 1 ? 's' : ''} available across the UK
            </p>
            <form method="GET" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input name="q" defaultValue={params.q ?? ''} placeholder="Search by furniture type…"
                style={{ flex: 1, minWidth: 240, padding: '11px 16px', borderRadius: 10, border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
              <button type="submit" style={{ padding: '11px 24px', background: '#f0a500', color: '#0a1628', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                Search
              </button>
              {params.q && (
                <Link href="/jobs" style={{ padding: '11px 16px', background: 'rgba(255,255,255,0.1)', color: '#fff', borderRadius: 10, fontSize: 14, textDecoration: 'none' }}>
                  Clear
                </Link>
              )}
            </form>
          </div>
        </div>

        {/* Results */}
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 64px', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
          {!jobs?.length ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: '#0a1628', marginBottom: 8 }}>No jobs found</h3>
              <p style={{ fontSize: 14, color: '#64748b' }}>Try a different search or check back soon.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {jobs.map(job => (
                <Link key={job.id} href={`/jobs/${job.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', padding: '20px 24px', transition: 'box-shadow 0.15s, transform 0.15s', cursor: 'pointer' }}
                    onMouseEnter={e => { const t = e.currentTarget; t.style.boxShadow='0 8px 24px rgba(10,22,40,0.1)'; t.style.transform='translateY(-1px)' }}
                    onMouseLeave={e => { const t = e.currentTarget; t.style.boxShadow='none'; t.style.transform='none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 10 }}>
                      <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: '#0a1628', margin: 0 }}>{job.title}</h2>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Open</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 20px', fontSize: 13, color: '#64748b', marginBottom: 12 }}>
                      <span>📍 {job.town}{job.postcode ? `, ${job.postcode}` : ''}</span>
                      {job.est_time_min > 0 && <span>⏱ Est. {formatTime(job.est_time_min)}</span>}
                      {job.est_price > 0   && <span>💷 Est. {formatPriceDecimal(job.est_price)}</span>}
                      {job.preferred_date  && <span>📅 {new Date(job.preferred_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                      <span>🔐 {job.credit_cost} credit{job.credit_cost !== 1 ? 's' : ''} to unlock</span>
                    </div>
                    {job.job_items?.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {job.job_items.slice(0, 5).map((item: any) => (
                          <span key={item.id} style={{ background: '#f0f2f5', color: '#475569', padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500 }}>
                            {item.quantity}× {item.name}
                          </span>
                        ))}
                        {job.job_items.length > 5 && (
                          <span style={{ background: '#f0f2f5', color: '#94a3b8', padding: '3px 10px', borderRadius: 6, fontSize: 12 }}>+{job.job_items.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
