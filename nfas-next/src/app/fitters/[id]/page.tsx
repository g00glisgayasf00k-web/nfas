import { createClient }   from '@/lib/supabase/server'
import { Header }          from '@/components/layout/Header'
import { Footer }          from '@/components/layout/Footer'
import { notFound }        from 'next/navigation'
import { formatPriceDecimal } from '@/lib/utils'
import type { Metadata }   from 'next'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id }   = await params
  const supabase = await createClient()
  const { data } = await supabase.from('profiles').select('display_name').eq('id', id).single()
  return { title: data?.display_name ? `${data.display_name} — Fitter Profile` : 'Fitter Profile' }
}

export default async function FitterProfilePage({ params }: Props) {
  const { id }   = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  let viewer = null
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    viewer = data
  }

  const { data: fitter } = await supabase
    .from('profiles')
    .select('id,display_name,bio,avatar_url,is_verified,credits,created_at,town,postcode')
    .eq('id', id).eq('role', 'fitter').single()

  if (!fitter) notFound()

  const { data: area } = await supabase
    .from('fitter_areas')
    .select('postcode,radius_mi')
    .eq('fitter_id', id).single()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('id,rating,comment,created_at,reviewer:profiles!reviews_reviewer_id_fkey(display_name),job:jobs(title)')
    .eq('reviewee_id', id)
    .order('created_at', { ascending: false })

  const avgRating = reviews?.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length)
    : null

  const { data: completedCount } = await supabase
    .from('lead_unlocks')
    .select('id', { count: 'exact' })
    .eq('fitter_id', id)
    .eq('fitter_status', 'completed')

  const stars = (n: number, size = 16) => Array.from({ length: 5 }, (_, i) => (
    <svg key={i} width={size} height={size} viewBox="0 0 24 24"
      fill={i < Math.round(n) ? '#f0a500' : 'none'}
      stroke={i < Math.round(n) ? '#f0a500' : '#d1d5db'}
      strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ))

  return (
    <>
      <Header profile={viewer} />
      <main style={{ fontFamily: "'DM Sans',system-ui,sans-serif" }}>

        {/* Hero */}
        <div style={{ background: '#0a1628', padding: '48px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{ width: 96, height: 96, borderRadius: '50%', background: '#f0a500', color: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 36, flexShrink: 0, border: '3px solid rgba(255,255,255,0.15)' }}>
              {fitter.display_name?.[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: 'clamp(22px,4vw,30px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', margin: 0 }}>
                  {fitter.display_name}
                </h1>
                {fitter.is_verified && (
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>✓ Verified</span>
                )}
              </div>
              {fitter.town && <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', marginBottom: 10 }}>📍 {fitter.town}{area ? `, covers up to ${area.radius_mi} miles` : ''}</div>}
              {avgRating !== null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 2 }}>{stars(avgRating, 16)}</div>
                  <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, color: '#f0a500', fontSize: 18 }}>{avgRating.toFixed(1)}</span>
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)' }}>({reviews?.length} review{reviews?.length !== 1 ? 's' : ''})</span>
                </div>
              )}
            </div>
            {/* Stats */}
            <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 18px' }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: '#f0a500' }}>{completedCount?.length ?? 0}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Jobs Done</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 18px' }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: '#f0a500' }}>
                  {Math.floor((Date.now() - new Date(fitter.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))}mo
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>On Platform</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 64px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'flex-start' }}>

          {/* Reviews */}
          <div>
            <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, color: '#0a1628', marginBottom: 16, letterSpacing: '-0.5px' }}>
              Customer Reviews
            </h2>
            {!reviews?.length ? (
              <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 14, padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
                <p style={{ fontSize: 14, color: '#94a3b8' }}>No reviews yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {reviews.map(r => (
                  <div key={r.id} style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 14, padding: '18px 22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0a1628' }}>{(r.reviewer as any)?.display_name ?? 'Customer'}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{(r.job as any)?.title}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 2 }}>{stars(r.rating, 13)}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                          {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                    </div>
                    {r.comment && (
                      <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.65, borderTop: '1px solid #f0f2f5', paddingTop: 10, margin: 0 }}>
                        "{r.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {fitter.bio && (
              <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 14, padding: '18px 20px' }}>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: '#0a1628', marginBottom: 8 }}>About</h3>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, margin: 0 }}>{fitter.bio}</p>
              </div>
            )}
            <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 14, padding: '18px 20px' }}>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: '#0a1628', marginBottom: 12 }}>Details</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, color: '#475569' }}>
                {fitter.is_verified && <div style={{ display: 'flex', gap: 8 }}><span>✓</span><span style={{ color: '#15803d', fontWeight: 600 }}>Identity Verified</span></div>}
                {area && <div style={{ display: 'flex', gap: 8 }}><span>📍</span><span>Covers up to {area.radius_mi} miles from {area.postcode}</span></div>}
                <div style={{ display: 'flex', gap: 8 }}><span>📅</span><span>Member since {new Date(fitter.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</span></div>
              </div>
            </div>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 14, padding: '18px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: '#92400e', marginBottom: 14, lineHeight: 1.6 }}>
                Need flatpack assembly? Post a job and get matched with verified fitters in your area.
              </p>
              <a href="/auth/register-customer" style={{ display: 'block', padding: '10px', background: '#f0a500', color: '#0a1628', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
                Post a Job — Free
              </a>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
