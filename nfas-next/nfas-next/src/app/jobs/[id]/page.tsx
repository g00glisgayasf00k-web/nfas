import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatTime, formatPriceDecimal } from '@/lib/utils'
import { SingleJobActions } from './Actions'
import type { Metadata } from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id }   = await params
  const supabase = await createClient()
  const { data } = await supabase.from('jobs').select('title').eq('id', id).single()
  return { title: data?.title ?? 'Job Detail' }
}

export default async function SingleJobPage({ params }: Props) {
  const { id }   = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  let profile = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  const { data: job } = await supabase
    .from('jobs')
    .select(`*, job_items(*), customer:profiles!jobs_customer_id_fkey(id,display_name,email,telephone)`)
    .eq('id', id)
    .single()

  if (!job) notFound()

  // Only show open jobs publicly; matched jobs only to participants
  const isCustomer = user && job.customer_id === user.id
  const isFitter   = profile?.role === 'fitter'

  let unlock = null
  if (isFitter && user) {
    const { data } = await supabase
      .from('lead_unlocks')
      .select('*, fitter:profiles!lead_unlocks_fitter_id_fkey(id,display_name,email,telephone)')
      .eq('job_id', id).eq('fitter_id', user.id).single()
    unlock = data
  }

  const hasUnlocked = !!unlock
  const canView     = job.status === 'open' || isCustomer || hasUnlocked

  if (!canView) {
    return (
      <>
        <Header profile={profile} />
        <main style={{ maxWidth: 600, margin: '80px auto', padding: '0 24px', textAlign: 'center', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 8 }}>This lead is locked</h2>
          <p style={{ color: '#64748b', marginBottom: 24 }}>Register as a fitter and purchase credits to unlock customer contact details.</p>
          <Link href="/auth/register-fitter" style={{ display: 'inline-block', padding: '12px 28px', background: '#f0a500', color: '#0a1628', borderRadius: 10, fontWeight: 700, textDecoration: 'none', marginRight: 10 }}>Register as Fitter</Link>
          <Link href="/auth/login" style={{ display: 'inline-block', padding: '12px 22px', border: '1.5px solid #0a1628', color: '#0a1628', borderRadius: 10, fontWeight: 600, textDecoration: 'none' }}>Log In</Link>
        </main>
        <Footer />
      </>
    )
  }

  const sortedItems = [...(job.job_items ?? [])].sort((a: any, b: any) => a.sort_order - b.sort_order)

  // Build matched fitter info for customer view
  let matchedFitter = null
  if (isCustomer && ['claimed','closed'].includes(job.status)) {
    const { data: ul } = await supabase
      .from('lead_unlocks')
      .select('fitter:profiles!lead_unlocks_fitter_id_fkey(id,display_name,email,telephone,bio,avatar_url)')
      .eq('job_id', id).single()
    matchedFitter = ul?.fitter ?? null
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${job.town} ${job.postcode}`)}`

  return (
    <>
      <Header profile={profile} />
      <main style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>

        {/* Hero */}
        <div style={{ background: '#0a1628', padding: '40px 24px 36px' }}>
          <div style={{ maxWidth: 1040, margin: '0 auto' }}>
            {/* Breadcrumb */}
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link> ›
              {isFitter
                ? <Link href="/dashboard/fitter?tab=my-leads" style={{ color: 'inherit', textDecoration: 'none' }}>My Leads</Link>
                : <Link href="/jobs" style={{ color: 'inherit', textDecoration: 'none' }}>Jobs</Link>}
              › <span style={{ color: 'rgba(255,255,255,0.7)' }}>{job.title}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', marginBottom: 8 }}>{job.title}</h1>
                <a href={mapsUrl} target="_blank" rel="noopener" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                  📍 {job.town}{job.postcode ? `, ${job.postcode}` : ''}
                </a>
              </div>
              {/* Status badge */}
              {{
                open:      <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 4 }}>{isCustomer ? 'Finding Fitter' : 'Open'}</span>,
                claimed:   <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 4 }}>{isCustomer ? '✓ Fitter Matched' : 'Claimed'}</span>,
                closed:    <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 4 }}>Completed</span>,
                cancelled: <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 14px', borderRadius: 999, fontSize: 12, fontWeight: 700, flexShrink: 0, marginTop: 4 }}>Cancelled</span>,
              }[job.status] ?? null}
            </div>
            {/* Meta bar */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 28px', fontSize: 13, color: 'rgba(255,255,255,0.55)', marginTop: 16 }}>
              {job.preferred_date && <span>📅 Preferred: {new Date(job.preferred_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
              {job.est_time_min > 0 && <span>⏱ Est. {formatTime(job.est_time_min)}</span>}
              {job.est_price > 0   && <span>💷 Est. {formatPriceDecimal(job.est_price)}</span>}
              <span>📅 Posted {new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '32px 24px 64px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'flex-start' }}>

          {/* Main content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Items table */}
            {sortedItems.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid #f0f2f5' }}>
                  <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: '#0a1628', margin: 0 }}>Items to Assemble</h2>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead style={{ background: '#f8f9fc' }}>
                    <tr>
                      {['Item','Qty','Est. Time','Est. Price'].map(h => (
                        <th key={h} style={{ padding: '10px 18px', textAlign: h === 'Item' ? 'left' : 'right', fontWeight: 700, color: '#0a1628', fontSize: 12 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedItems.map((item: any) => (
                      <tr key={item.id} style={{ borderTop: '1px solid #f0f2f5' }}>
                        <td style={{ padding: '11px 18px', fontWeight: 500 }}>{item.name}</td>
                        <td style={{ padding: '11px 18px', textAlign: 'right', color: '#64748b' }}>{item.quantity}</td>
                        <td style={{ padding: '11px 18px', textAlign: 'right', color: '#64748b' }}>{formatTime(item.quantity * item.time_min)}</td>
                        <td style={{ padding: '11px 18px', textAlign: 'right', fontWeight: 600 }}>{formatPriceDecimal(item.quantity * item.unit_price)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #0a1628', background: '#f0fdf4' }}>
                      <td style={{ padding: '11px 18px', fontWeight: 800, color: '#15803d', fontFamily: "'Syne',sans-serif" }}>Total</td>
                      <td style={{ padding: '11px 18px', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>{job.total_items}</td>
                      <td style={{ padding: '11px 18px', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>{formatTime(job.est_time_min)}</td>
                      <td style={{ padding: '11px 18px', textAlign: 'right', fontWeight: 800, color: '#15803d', fontFamily: "'Syne',sans-serif" }}>{formatPriceDecimal(job.est_price)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Notes */}
            {job.notes && (
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '16px 20px' }}>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>Additional Notes</h3>
                <p style={{ fontSize: 13, color: '#92400e', lineHeight: 1.7, margin: 0 }}>{job.notes}</p>
              </div>
            )}

            {/* Map placeholder */}
            {(job.lat && job.lng) && (
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid #f0f2f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: '#0a1628', margin: 0 }}>Location</h2>
                  <a href={mapsUrl} target="_blank" rel="noopener" style={{ fontSize: 12, color: '#1d4ed8', textDecoration: 'none', fontWeight: 600 }}>Get Directions →</a>
                </div>
                <div style={{ height: 220, background: `url('https://static-maps.yandex.ru/1.x/?ll=${job.lng},${job.lat}&z=13&l=map&pt=${job.lng},${job.lat},pm2rdm&size=650,220') center/cover no-repeat #e8ecf0`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <a href={mapsUrl} target="_blank" rel="noopener" style={{ background: '#f0a500', color: '#0a1628', padding: '8px 18px', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
                    📍 View on Google Maps
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Customer viewing their own job */}
            {isCustomer && (
              <>
                {matchedFitter ? (
                  <div style={{ background: job.status === 'closed' ? '#eff6ff' : '#f0fdf4', border: `1px solid ${job.status === 'closed' ? '#bfdbfe' : '#bbf7d0'}`, borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${job.status === 'closed' ? '#bfdbfe' : '#bbf7d0'}` }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: job.status === 'closed' ? '#1d4ed8' : '#15803d' }}>
                        {job.status === 'closed' ? '✅ Job Completed' : '✓ Your Matched Fitter'}
                      </div>
                    </div>
                    <div style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#0a1628', color: '#f0a500', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                          {(matchedFitter as any).display_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#0a1628' }}>{(matchedFitter as any).display_name}</div>
                          {(matchedFitter as any).bio && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{(matchedFitter as any).bio?.slice(0, 80)}{(matchedFitter as any).bio?.length > 80 ? '…' : ''}</div>}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(matchedFitter as any).email && <a href={`mailto:${(matchedFitter as any).email}`} style={{ fontSize: 13, color: '#0a1628', textDecoration: 'none', fontWeight: 500, display: 'flex', gap: 6, alignItems: 'center' }}>✉ {(matchedFitter as any).email}</a>}
                        {(matchedFitter as any).telephone && <a href={`tel:${(matchedFitter as any).telephone}`} style={{ fontSize: 13, color: '#0a1628', textDecoration: 'none', fontWeight: 500, display: 'flex', gap: 6, alignItems: 'center' }}>📞 {(matchedFitter as any).telephone}</a>}
                      </div>
                    </div>
                    <div style={{ padding: '12px 20px', borderTop: `1px solid ${job.status === 'closed' ? '#bfdbfe' : '#bbf7d0'}` }}>
                      <Link href="/dashboard/customer?tab=jobs" style={{ fontSize: 12, color: '#1b3a6b', textDecoration: 'none', fontWeight: 600 }}>← Back to My Jobs</Link>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, padding: '20px' }}>
                    <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: '#0a1628', marginBottom: 8 }}>Your Job</h3>
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#92400e', display: 'flex', gap: 8, alignItems: 'center' }}>
                      ⏳ Finding the right fitter for you…
                    </div>
                    <Link href="/dashboard/customer?tab=jobs" style={{ display: 'block', marginTop: 14, fontSize: 12, color: '#1b3a6b', textDecoration: 'none', fontWeight: 600 }}>← Back to My Jobs</Link>
                  </div>
                )}
              </>
            )}

            {/* Fitter sidebar — actions */}
            {!isCustomer && (
              <SingleJobActions
                job={job}
                profile={profile}
                unlock={unlock}
              />
            )}
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
