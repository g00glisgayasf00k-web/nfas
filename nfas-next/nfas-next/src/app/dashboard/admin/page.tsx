import { redirect }      from 'next/navigation'
import { createClient }  from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/server'
import Link              from 'next/link'
import { formatPriceDecimal } from '@/lib/utils'

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>
}) {
  const params   = await searchParams
  const section  = params.section ?? 'overview'
  const supabase = await createClient()
  const admin    = createAdminClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  // ── Stats ──────────────────────────────────────────────────
  const [
    { count: totalJobs },
    { count: openJobs },
    { count: totalFitters },
    { count: pendingFitters },
    { count: totalCustomers },
    { data: recentJobs },
    { data: pendingDocs },
  ] = await Promise.all([
    admin.from('jobs').select('*', { count: 'exact', head: true }),
    admin.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'fitter'),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'fitter').eq('is_verified', false),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
    admin.from('jobs').select('*, customer:profiles!jobs_customer_id_fkey(display_name)').order('created_at', { ascending: false }).limit(10),
    admin.from('fitter_documents').select('*, fitter:profiles!fitter_documents_fitter_id_fkey(display_name,email)').eq('status', 'pending').order('created_at', { ascending: false }),
  ])

  const NAV = [
    { id: 'overview',  label: 'Overview',     icon: '📊' },
    { id: 'jobs',      label: 'All Jobs',      icon: '🔨' },
    { id: 'fitters',   label: 'Fitters',       icon: '👷' },
    { id: 'customers', label: 'Customers',     icon: '👥' },
    { id: 'documents', label: 'Documents',     icon: '📄', badge: pendingDocs?.length ?? 0 },
    { id: 'credits',   label: 'Credit Packs',  icon: '💳' },
    { id: 'inventory', label: 'Inventory',     icon: '📦' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fc', fontFamily: "'DM Sans',system-ui,sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap');`}</style>

      <header style={{ background: '#0a1628', height: 56, display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Link href="/" style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 15, color: '#fff', textDecoration: 'none' }}>
          National <span style={{ color: '#f0a500' }}>Flatpack</span> Assembly
        </Link>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.08)', padding: '4px 12px', borderRadius: 999 }}>Admin Panel</span>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'flex-start' }}>

        {/* Sidebar */}
        <aside style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', overflow: 'hidden', position: 'sticky', top: 76 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f2f5', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#94a3b8' }}>
            Admin
          </div>
          <nav style={{ padding: '6px 0' }}>
            {NAV.map(item => (
              <Link key={item.id} href={`?section=${item.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', fontSize: 13, fontWeight: section === item.id ? 700 : 500, color: section === item.id ? '#0a1628' : '#64748b', textDecoration: 'none', background: section === item.id ? 'rgba(10,22,40,0.05)' : 'transparent', borderLeft: `3px solid ${section === item.id ? '#f0a500' : 'transparent'}` }}>
                <span>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge ? <span style={{ background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999 }}>{item.badge}</span> : null}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main */}
        <main>

          {/* OVERVIEW */}
          {section === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: '#0a1628', margin: 0 }}>Overview</h2>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
                {[
                  { label: 'Total Jobs',       value: totalJobs ?? 0,     accent: false },
                  { label: 'Open Jobs',         value: openJobs ?? 0,      accent: true  },
                  { label: 'Total Fitters',     value: totalFitters ?? 0,  accent: false },
                  { label: 'Pending Approval',  value: pendingFitters ?? 0, accent: pendingFitters > 0 },
                  { label: 'Customers',         value: totalCustomers ?? 0, accent: false },
                ].map(stat => (
                  <div key={stat.label} style={{ background: '#fff', borderRadius: 14, border: `1px solid ${stat.accent ? '#fde68a' : '#e8ecf0'}`, padding: '18px 16px', background: stat.accent ? '#fffbeb' : '#fff' }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: 500 }}>{stat.label}</div>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: stat.accent ? '#b45309' : '#0a1628' }}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Recent jobs */}
              <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 22px', borderBottom: '1px solid #f0f2f5' }}>
                  <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 700, color: '#0a1628', margin: 0 }}>Recent Jobs</h3>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead style={{ background: '#f8f9fc' }}>
                    <tr>
                      {['Title', 'Customer', 'Location', 'Status', 'Est. Price', 'Posted'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#0a1628', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(recentJobs ?? []).map((job: any) => {
                      const statusColours: Record<string, string> = { open: '#15803d', claimed: '#92400e', closed: '#475569', cancelled: '#dc2626' }
                      const statusBgs: Record<string, string>     = { open: '#dcfce7', claimed: '#fef3c7', closed: '#f1f5f9', cancelled: '#fee2e2' }
                      return (
                        <tr key={job.id} style={{ borderTop: '1px solid #f8f9fc' }}>
                          <td style={{ padding: '11px 16px', fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <Link href={`/jobs/${job.id}`} style={{ color: '#0a1628', textDecoration: 'none' }}>{job.title}</Link>
                          </td>
                          <td style={{ padding: '11px 16px', color: '#64748b' }}>{job.customer?.display_name ?? '—'}</td>
                          <td style={{ padding: '11px 16px', color: '#64748b' }}>{job.town}</td>
                          <td style={{ padding: '11px 16px' }}>
                            <span style={{ background: statusBgs[job.status] ?? '#f1f5f9', color: statusColours[job.status] ?? '#475569', padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
                              {job.status}
                            </span>
                          </td>
                          <td style={{ padding: '11px 16px', fontWeight: 600 }}>{formatPriceDecimal(job.est_price)}</td>
                          <td style={{ padding: '11px 16px', color: '#64748b' }}>{new Date(job.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DOCUMENTS — fitter verification */}
          {section === 'documents' && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f2f5' }}>
                <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#0a1628', margin: 0 }}>Pending Document Reviews</h2>
              </div>
              {!pendingDocs?.length ? (
                <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94a3b8' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <p style={{ fontSize: 14 }}>No documents pending review.</p>
                </div>
              ) : (
                <div>
                  {pendingDocs.map((doc: any) => (
                    <div key={doc.id} style={{ padding: '18px 24px', borderBottom: '1px solid #f8f9fc', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0a1628', marginBottom: 2 }}>{doc.fitter?.display_name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{doc.fitter?.email} · {doc.doc_type.replace(/_/g, ' ')}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Uploaded {new Date(doc.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                      <a href={`/api/admin/docs/view?path=${encodeURIComponent(doc.storage_path)}`}
                        target="_blank" rel="noopener"
                        style={{ padding: '7px 16px', background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#0a1628', textDecoration: 'none' }}>
                        View Doc ↗
                      </a>
                      <AdminDocActions docId={doc.id} fitterId={doc.fitter_id} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Other sections — placeholders with clear CTAs */}
          {['jobs','fitters','customers','credits','inventory'].includes(section) && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', padding: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{NAV.find(n => n.id === section)?.icon}</div>
              <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#0a1628', marginBottom: 8, textTransform: 'capitalize' }}>{section}</h3>
              <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>Full management UI for this section. Data is live from Supabase — you can manage records directly in the Supabase dashboard for now.</p>
              <a href={`https://supabase.com/dashboard/project/_/editor`} target="_blank" rel="noopener"
                style={{ display: 'inline-block', padding: '10px 22px', background: '#0a1628', color: '#fff', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                Open Supabase Editor ↗
              </a>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

// Server action wrapper for doc approval (client component needed for interactivity)
function AdminDocActions({ docId, fitterId }: { docId: string; fitterId: string }) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <form action={`/api/admin/docs`} method="POST" style={{ display: 'inline' }}>
        <input type="hidden" name="doc_id" value={docId} />
        <input type="hidden" name="fitter_id" value={fitterId} />
        <input type="hidden" name="action" value="approve" />
        <button type="submit" style={{ padding: '7px 14px', background: '#15803d', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          ✓ Approve
        </button>
      </form>
      <form action={`/api/admin/docs`} method="POST" style={{ display: 'inline' }}>
        <input type="hidden" name="doc_id" value={docId} />
        <input type="hidden" name="fitter_id" value={fitterId} />
        <input type="hidden" name="action" value="reject" />
        <button type="submit" style={{ padding: '7px 14px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
          ✗ Reject
        </button>
      </form>
    </div>
  )
}
