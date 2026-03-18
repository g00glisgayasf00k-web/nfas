import { redirect }           from 'next/navigation'
import { createClient }       from '@/lib/supabase/server'
import Link                   from 'next/link'
import { formatPriceDecimal, affiliateRate, affiliateTierName } from '@/lib/utils'

export default async function AffiliateDashboard({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>
}) {
  const params   = await searchParams
  const section  = params.section ?? 'overview'
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/affiliate')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/auth/login')
  if (profile.role !== 'affiliate') redirect('/dashboard/customer')

  // All jobs posted by this affiliate
  const { data: jobs = [] } = await supabase
    .from('jobs')
    .select('*, job_items(*), lead_unlocks(fitter_status, fitter:profiles!lead_unlocks_fitter_id_fkey(display_name))')
    .eq('affiliate_id', user.id)
    .order('created_at', { ascending: false })

  // Earnings
  const { data: earnings = [] } = await supabase
    .from('affiliate_earnings')
    .select('*, job:jobs(title,created_at)')
    .eq('affiliate_id', user.id)
    .order('created_at', { ascending: false })

  const totalEarned   = (earnings ?? []).reduce((s: number, e: any) => s + Number(e.earned), 0)
  const totalUnpaid   = (earnings ?? []).filter((e: any) => !e.paid_at).reduce((s: number, e: any) => s + Number(e.earned), 0)
  const totalJobValue = (earnings ?? []).reduce((s: number, e: any) => s + Number(e.job_value), 0)

  const completedJobs = (jobs ?? []).filter((j: any) =>
    j.lead_unlocks?.some((u: any) => u.fitter_status === 'completed')
  ).length

  const NAV = [
    { id: 'overview',  label: 'Overview',   icon: '📊' },
    { id: 'jobs',      label: 'My Jobs',     icon: '🔨' },
    { id: 'earnings',  label: 'Earnings',    icon: '💷' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      <header style={{ background: '#0a1628', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', textDecoration: 'none' }}>
          National <span style={{ color: '#f0a500' }}>Flatpack</span> Assembly
        </Link>
        <span style={{ fontSize: 12, background: 'rgba(240,165,0,0.15)', color: '#f0a500', padding: '4px 12px', borderRadius: 999, fontWeight: 700 }}>Affiliate</span>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <aside style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', overflow: 'hidden', position: 'sticky', top: 76 }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid #f0f2f5' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0a1628', marginBottom: 2 }}>{profile.display_name}</div>
            <div style={{ fontSize: 11, color: '#94a3b8' }}>Affiliate Account</div>
          </div>
          <nav style={{ padding: '6px 0' }}>
            {NAV.map(item => (
              <Link key={item.id} href={`?section=${item.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, fontWeight: section === item.id ? 700 : 500, color: section === item.id ? '#0a1628' : '#64748b', textDecoration: 'none', background: section === item.id ? 'rgba(10,22,40,0.05)' : 'transparent', borderLeft: `3px solid ${section === item.id ? '#f0a500' : 'transparent'}` }}>
                <span>{item.icon}</span>{item.label}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid #f0f2f5', marginTop: 4, paddingTop: 4 }}>
              <form action="/api/auth/logout" method="POST">
                <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>🚪 Log Out</button>
              </form>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main>

          {section === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: '#0a1628', margin: 0 }}>Affiliate Overview</h2>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
                {[
                  { label: 'Total Jobs Posted', value: (jobs ?? []).length,            colour: false },
                  { label: 'Jobs Completed',    value: completedJobs,                  colour: false },
                  { label: 'Total Earned',       value: `£${totalEarned.toFixed(2)}`,  colour: true  },
                  { label: 'Awaiting Payment',   value: `£${totalUnpaid.toFixed(2)}`,  colour: totalUnpaid > 0 },
                ].map(stat => (
                  <div key={stat.label} style={{ background: stat.colour ? '#fffbeb' : '#fff', border: `1px solid ${stat.colour ? '#fde68a' : '#e8ecf0'}`, borderRadius: 14, padding: '16px 18px' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: 500 }}>{stat.label}</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: stat.colour ? '#b45309' : '#0a1628' }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Commission tiers */}
              <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, padding: '20px 24px' }}>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: '#0a1628', marginBottom: 16 }}>Commission Tiers</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[
                    { tier: 'Bronze', range: 'Under £500',   rate: '1.5%', colour: '#c47d0e' },
                    { tier: 'Silver', range: '£500 – £999',  rate: '2.0%', colour: '#64748b' },
                    { tier: 'Gold',   range: '£1,000+',      rate: '2.5%', colour: '#b45309' },
                  ].map(t => (
                    <div key={t.tier} style={{ border: `1px solid #e8ecf0`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: t.colour, marginBottom: 4 }}>{t.tier}</div>
                      <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: '#0a1628', marginBottom: 2 }}>{t.rate}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8' }}>{t.range} job value</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 14, lineHeight: 1.6 }}>
                  Commission is calculated on the estimated job value and paid monthly. Contact us to arrange a bank transfer.
                </p>
              </div>
            </div>
          )}

          {section === 'jobs' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#0a1628', margin: 0 }}>Jobs Posted</h2>
                <Link href="/dashboard/customer?section=post" style={{ padding: '8px 16px', background: '#f0a500', color: '#0a1628', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>+ Post a Job</Link>
              </div>
              {!(jobs ?? []).length ? (
                <div style={{ textAlign: 'center', padding: '60px 24px' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔨</div>
                  <p style={{ fontSize: 14, color: '#94a3b8' }}>No jobs posted yet.</p>
                  <Link href="/dashboard/customer?section=post" style={{ display: 'inline-block', marginTop: 16, padding: '10px 22px', background: '#f0a500', color: '#0a1628', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Post a Job</Link>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead style={{ background: '#f8f9fc' }}>
                    <tr>{['Job','Status','Est. Price','Commission','Posted'].map(h => <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontWeight: 700, color: '#0a1628', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {(jobs ?? []).map((job: any) => {
                      const isComplete = job.lead_unlocks?.some((u: any) => u.fitter_status === 'completed')
                      const rate       = affiliateRate(job.est_price)
                      const commission = (job.est_price * rate).toFixed(2)
                      const statusBg: Record<string, string> = { open: '#dcfce7', claimed: '#fef3c7', closed: '#f1f5f9', cancelled: '#fee2e2' }
                      const statusCl: Record<string, string> = { open: '#15803d', claimed: '#92400e', closed: '#475569', cancelled: '#dc2626' }
                      return (
                        <tr key={job.id} style={{ borderTop: '1px solid #f8f9fc' }}>
                          <td style={{ padding: '11px 18px', fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Link href={`/jobs/${job.id}`} style={{ color: '#0a1628', textDecoration: 'none' }}>{job.title}</Link>
                          </td>
                          <td style={{ padding: '11px 18px' }}>
                            <span style={{ background: statusBg[job.status] ?? '#f1f5f9', color: statusCl[job.status] ?? '#475569', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                              {isComplete ? 'Completed' : job.status}
                            </span>
                          </td>
                          <td style={{ padding: '11px 18px', fontWeight: 600 }}>{formatPriceDecimal(job.est_price)}</td>
                          <td style={{ padding: '11px 18px', color: isComplete ? '#15803d' : '#94a3b8', fontWeight: isComplete ? 600 : 400 }}>
                            {isComplete ? `£${commission}` : '—'}
                          </td>
                          <td style={{ padding: '11px 18px', color: '#64748b' }}>{new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {section === 'earnings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Total earned (all time)</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: '#0a1628', letterSpacing: '-1px' }}>£{totalEarned.toFixed(2)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Awaiting payment</div>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 30, fontWeight: 800, color: '#f0a500', letterSpacing: '-1px' }}>£{totalUnpaid.toFixed(2)}</div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid #f0f2f5' }}>
                  <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: '#0a1628', margin: 0 }}>Earnings History</h3>
                </div>
                {!(earnings ?? []).length ? (
                  <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8', fontSize: 14 }}>No earnings yet. Completed jobs will appear here.</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead style={{ background: '#f8f9fc' }}>
                      <tr>{['Job','Job Value','Rate','Earned','Status'].map(h => <th key={h} style={{ padding: '10px 18px', textAlign: 'left', fontWeight: 700, color: '#0a1628', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {(earnings ?? []).map((e: any) => (
                        <tr key={e.id} style={{ borderTop: '1px solid #f8f9fc' }}>
                          <td style={{ padding: '11px 18px', fontWeight: 600 }}>{e.job?.title ?? '—'}</td>
                          <td style={{ padding: '11px 18px' }}>{formatPriceDecimal(e.job_value)}</td>
                          <td style={{ padding: '11px 18px', color: '#64748b' }}>{(e.rate * 100).toFixed(1)}%</td>
                          <td style={{ padding: '11px 18px', fontWeight: 700, color: '#15803d' }}>£{Number(e.earned).toFixed(2)}</td>
                          <td style={{ padding: '11px 18px' }}>
                            <span style={{ background: e.paid_at ? '#dcfce7' : '#fef3c7', color: e.paid_at ? '#15803d' : '#92400e', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                              {e.paid_at ? `Paid ${new Date(e.paid_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}` : 'Awaiting payment'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
