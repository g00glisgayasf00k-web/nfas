import { redirect }          from 'next/navigation'
import { createClient }      from '@/lib/supabase/server'
import { JobsList }          from '@/components/dashboard/JobsList'
import { FitterProfile, FitterRadius, NewLeads, CreditsPanel } from '@/components/dashboard/DashboardComponents'
import { MessagesPanel }     from '@/components/messaging/MessagesPanel'
import { ReviewsPanel }      from '@/components/reviews/ReviewsPanel'
import { haversineMiles }    from '@/lib/utils'
import Link                  from 'next/link'
import type { Profile }      from '@/types'

const NAV = [
  { id: 'profile',   label: 'My Profile',  icon: '👤' },
  { id: 'radius',    label: 'My Radius',   icon: '📍' },
  { id: 'new-leads', label: 'New Leads',   icon: '🔍' },
  { id: 'my-leads',  label: 'My Leads',    icon: '⚡' },
  { id: 'credits',   label: 'Buy Credits', icon: '💳' },
  { id: 'messages',  label: 'Messages',    icon: '💬' },
  { id: 'reviews',   label: 'My Reviews',  icon: '⭐' },
]

export default async function FitterDashboard({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>
}) {
  const params   = await searchParams
  const section  = params.section ?? 'profile'
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/fitter')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/auth/login')

  const { data: area } = await supabase.from('fitter_areas').select('*').eq('fitter_id', user.id).single()

  // Fitter documents for verification panel
  const { data: documents = [] } = await supabase
    .from('fitter_documents')
    .select('doc_type, status, created_at')
    .eq('fitter_id', user.id)

  // Unlocked leads
  const { data: unlocks = [] } = await supabase
    .from('lead_unlocks')
    .select('*, job:jobs(*, job_items(*), customer:profiles!jobs_customer_id_fkey(id,display_name,email,telephone))')
    .eq('fitter_id', user.id)
    .order('unlocked_at', { ascending: false })

  const myLeads = (unlocks ?? []).map((u: any) => ({ ...u.job, unlock: u, customer: u.job?.customer })).filter(Boolean)

  // New leads (open jobs filtered by radius)
  let newLeads: any[] = []
  if (['new-leads', 'profile'].includes(section)) {
    const { data: openJobs = [] } = await supabase
      .from('jobs').select('*, job_items(*)').eq('status', 'open').order('created_at', { ascending: false })

    const unlockedIds = new Set((unlocks ?? []).map((u: any) => u.job_id))
    newLeads = (openJobs ?? []).filter((job: any) => {
      if (unlockedIds.has(job.id)) return false
      if (!area || !job.lat || !job.lng) return true
      return haversineMiles(area.lat, area.lng, job.lat, job.lng) <= area.radius_mi
    })
  }

  const { data: creditPacks = [] } = await supabase.from('credit_packs').select('*').eq('is_active', true).order('sort_order')

  const { data: reviews = [] } = await supabase
    .from('reviews')
    .select('*, reviewer:profiles!reviews_reviewer_id_fkey(id,display_name,avatar_url), job:jobs(id,title)')
    .eq('reviewee_id', user.id).order('created_at', { ascending: false })

  const pendingReviews = myLeads.filter((j: any) =>
    j.status === 'closed' && !(reviews ?? []).some((r: any) => r.job_id === j.id && r.reviewer_id === user.id)
  )

  const unread = await supabase.rpc('get_unread_count', { user_id: user.id }).then(r => r.data ?? 0)

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>
      <header style={{ background: '#0a1628', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', textDecoration: 'none' }}>
          National <span style={{ color: '#f0a500' }}>Flatpack</span> Assembly
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, color: '#f0a500' }}>{profile.credits} <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 400, fontFamily: 'inherit' }}>credits</span></div>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f0a500', color: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 12 }}>
            {profile.first_name?.[0]?.toUpperCase()}
          </div>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <aside style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', overflow: 'hidden', position: 'sticky', top: 76 }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #f0f2f5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#0a1628', color: '#f0a500', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 13 }}>
                {profile.first_name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0a1628' }}>{profile.display_name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  Fitter · {profile.is_verified
                    ? <span style={{ color: '#15803d' }}>✓ Verified</span>
                    : <span style={{ color: '#b45309' }}>Pending</span>}
                </div>
              </div>
            </div>
            <div style={{ background: '#f8f9fc', borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>Credits</span>
              <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: '#f0a500' }}>{profile.credits}</span>
            </div>
          </div>
          <nav style={{ padding: '6px 0' }}>
            {NAV.map(item => (
              <Link key={item.id} href={`?section=${item.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, fontWeight: section === item.id ? 700 : 500, color: section === item.id ? '#0a1628' : '#64748b', textDecoration: 'none', background: section === item.id ? 'rgba(10,22,40,0.05)' : 'transparent', borderLeft: `3px solid ${section === item.id ? '#f0a500' : 'transparent'}` }}>
                <span>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.id === 'new-leads' && newLeads.length > 0 && (
                  <span style={{ background: '#f0a500', color: '#0a1628', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 999 }}>{newLeads.length}</span>
                )}
                {item.id === 'messages' && unread > 0 && (
                  <span style={{ background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999 }}>{unread}</span>
                )}
                {item.id === 'reviews' && (pendingReviews?.length ?? 0) > 0 && (
                  <span style={{ background: '#f0a500', color: '#0a1628', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 999 }}>{pendingReviews.length}</span>
                )}
              </Link>
            ))}
            <div style={{ borderTop: '1px solid #f0f2f5', marginTop: 4, paddingTop: 4 }}>
              <form action="/api/auth/logout" method="POST">
                <button style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>
                  🚪 Log Out
                </button>
              </form>
            </div>
          </nav>
        </aside>

        {/* Main */}
        <main>
          {section === 'profile'   && <FitterProfile profile={profile as Profile} documents={documents ?? []} />}
          {section === 'radius'    && <FitterRadius profile={profile as Profile} area={area} />}
          {section === 'new-leads' && <NewLeads jobs={newLeads} profile={profile as Profile} area={area} />}
          {section === 'my-leads'  && (
            <JobsList jobs={myLeads} emptyIcon="📋" emptyTitle="No leads yet"
              emptyDesc="Unlock your first lead from the New Leads tab."
              emptyAction={{ label: 'Browse New Leads', href: '/dashboard/fitter?section=new-leads' }}
              profile={profile as Profile} viewer="fitter" unlocks={unlocks ?? []} />
          )}
          {section === 'credits'   && <CreditsPanel profile={profile as Profile} packs={creditPacks ?? []} />}
          {section === 'messages'  && <MessagesPanel userId={user.id} jobs={myLeads} viewer="fitter" />}
          {section === 'reviews'   && (
            <ReviewsPanel reviews={reviews ?? []} pendingReviews={pendingReviews} userId={user.id} />
          )}
        </main>
      </div>
    </div>
  )
}
