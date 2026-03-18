import { redirect }       from 'next/navigation'
import { createClient }   from '@/lib/supabase/server'
import { JobsList }       from '@/components/dashboard/JobsList'
import { PostJobForm }    from '@/components/dashboard/PostJobForm'
import { ProfileForm }    from '@/components/dashboard/DashboardComponents'
import { MessagesPanel }  from '@/components/messaging/MessagesPanel'
import { Header }         from '@/components/layout/Header'
import Link               from 'next/link'
import type { Profile }   from '@/types'

const NAV = [
  { id: 'jobs',     label: 'My Jobs',    icon: '🔨' },
  { id: 'post',     label: 'Post a Job', icon: '➕' },
  { id: 'history',  label: 'History',    icon: '📋' },
  { id: 'messages', label: 'Messages',   icon: '💬' },
  { id: 'profile',  label: 'My Profile', icon: '👤' },
]

export default async function CustomerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>
}) {
  const params   = await searchParams
  const section  = params.section ?? 'jobs'
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login?redirect=/dashboard/customer')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile) redirect('/auth/login')
  if (profile.role === 'fitter') redirect('/dashboard/fitter')

  const { data: activeJobs = [] } = await supabase
    .from('jobs')
    .select('*, job_items(*), lead_unlocks(*, fitter:profiles!lead_unlocks_fitter_id_fkey(id,display_name,email,telephone,avatar_url,bio,is_verified))')
    .eq('customer_id', user.id)
    .in('status', ['open', 'claimed'])
    .order('created_at', { ascending: false })

  const { data: closedJobs = [] } = await supabase
    .from('jobs')
    .select('*, job_items(*), lead_unlocks(*, fitter:profiles!lead_unlocks_fitter_id_fkey(id,display_name,email,telephone,avatar_url,bio,is_verified))')
    .eq('customer_id', user.id)
    .in('status', ['closed', 'cancelled'])
    .order('created_at', { ascending: false })

  const { data: inventory = [] } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('is_active', true)
    .order('category').order('sort_order')

  const unread = await supabase.rpc('get_unread_count', { user_id: user.id }).then(r => r.data ?? 0)

  const allJobs = [...(activeJobs ?? []), ...(closedJobs ?? [])]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>
      <header style={{ background: '#0a1628', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', textDecoration: 'none' }}>
          National <span style={{ color: '#f0a500' }}>Flatpack</span> Assembly
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f0a500', color: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 12 }}>
            {profile.first_name?.[0]?.toUpperCase()}
          </div>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{profile.display_name}</span>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'flex-start' }}>
        {/* Sidebar */}
        <aside style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', overflow: 'hidden', position: 'sticky', top: 76 }}>
          <div style={{ padding: '18px 16px', borderBottom: '1px solid #f0f2f5' }}>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 2 }}>Customer</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 700, color: '#0a1628' }}>{profile.display_name}</div>
          </div>
          <nav style={{ padding: '6px 0' }}>
            {NAV.map(item => (
              <Link key={item.id} href={`?section=${item.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, fontWeight: section === item.id ? 700 : 500, color: section === item.id ? '#0a1628' : '#64748b', textDecoration: 'none', background: section === item.id ? 'rgba(10,22,40,0.05)' : 'transparent', borderLeft: `3px solid ${section === item.id ? '#f0a500' : 'transparent'}` }}>
                <span>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.id === 'jobs' && (activeJobs?.length ?? 0) > 0 && (
                  <span style={{ background: '#f0a500', color: '#0a1628', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 999 }}>{activeJobs?.length}</span>
                )}
                {item.id === 'messages' && unread > 0 && (
                  <span style={{ background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999 }}>{unread}</span>
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
          {section === 'jobs' && (
            <JobsList jobs={activeJobs ?? []} emptyIcon="🔨" emptyTitle="No active jobs"
              emptyDesc="Post your first job and local fitters will be matched to you."
              emptyAction={{ label: '+ Post a Job', href: '/dashboard/customer?section=post' }}
              profile={profile as Profile} viewer="customer" />
          )}
          {section === 'post' && (
            <PostJobForm inventory={inventory ?? []} profile={profile as Profile} />
          )}
          {section === 'history' && (
            <JobsList jobs={closedJobs ?? []} emptyIcon="📋" emptyTitle="No completed jobs yet"
              emptyDesc="Completed jobs appear here." profile={profile as Profile} viewer="customer" isHistory />
          )}
          {section === 'messages' && (
            <MessagesPanel userId={user.id} jobs={allJobs} viewer="customer" />
          )}
          {section === 'profile' && (
            <ProfileForm profile={profile as Profile} />
          )}
        </main>
      </div>
    </div>
  )
}
