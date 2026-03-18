'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatPriceDecimal } from '@/lib/utils'
import { MessageThread } from '@/components/messaging/MessageThread'
import { ReviewForm } from '@/components/reviews/ReviewForm'

interface Props {
  job:     any
  profile: any
  unlock:  any
}

const STATUS_LABELS = [
  { value: '',             label: 'Update Status…' },
  { value: 'contacted',   label: '📞 Contacted' },
  { value: 'booked',      label: '📅 Booked In' },
  { value: 'completed',   label: '✅ Completed' },
  { value: 'no_response', label: '🔕 No Response' },
  { value: 'cancelled',   label: '❌ Cancelled' },
]
const STATUS_COLOURS: Record<string, string> = {
  '': '#6b7280', contacted: '#1d4ed8', booked: '#7c3aed',
  completed: '#15803d', no_response: '#b45309', cancelled: '#dc2626',
}

export function SingleJobActions({ job, profile, unlock }: Props) {
  const router    = useRouter()
  const isFitter  = profile?.role === 'fitter'
  const isLoggedIn = !!profile
  const [unlocking, setUnlocking]     = useState(false)
  const [statusSaving, setStatusSaving] = useState(false)
  const [statusSaved, setStatusSaved]   = useState(false)
  const [fitterStatus, setFitterStatus] = useState<string>(unlock?.fitter_status ?? '')
  const [showMsg, setShowMsg]           = useState(false)
  const [showReview, setShowReview]     = useState(false)
  const [error, setError]               = useState('')

  const handleUnlock = async () => {
    if (!profile) return
    if (profile.credits < job.credit_cost) { setError(`You need ${job.credit_cost} credits but only have ${profile.credits}.`); return }
    if (!confirm(`Unlock this lead for ${job.credit_cost} credit${job.credit_cost !== 1 ? 's' : ''}?`)) return
    setUnlocking(true); setError('')
    const res  = await fetch('/api/leads/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job_id: job.id }) })
    const data = await res.json()
    setUnlocking(false)
    if (!res.ok || data.error) { setError(data.error ?? 'Failed to unlock.'); return }
    router.refresh()
  }

  const handleStatusChange = async (newVal: string) => {
    if (!newVal) return
    const label = STATUS_LABELS.find(s => s.value === newVal)?.label ?? newVal
    if (!confirm(`Change status to "${label}"?`)) return
    const prev = fitterStatus
    setFitterStatus(newVal); setStatusSaving(true)
    const res = await fetch('/api/leads/status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job_id: job.id, fitter_status: newVal }) })
    setStatusSaving(false)
    if (res.ok) { setStatusSaved(true); setTimeout(() => setStatusSaved(false), 2500); router.refresh() }
    else { setFitterStatus(prev); alert('Could not save status.') }
  }

  const F: React.CSSProperties = { fontFamily: "'DM Sans',system-ui,sans-serif" }

  // ── Unlocked fitter view ─────────────────────────────────
  if (unlock) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Customer contact */}
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', background: '#f8f9fc', borderBottom: '1px solid #f0f2f5' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#15803d' }}>🔓 Lead Unlocked — Customer Contact</div>
          </div>
          <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {job.customer?.display_name && <div style={{ display: 'flex', gap: 8, fontSize: 13, alignItems: 'center' }}><span style={{ color: '#94a3b8' }}>👤</span><span style={{ fontWeight: 600 }}>{job.customer.display_name}</span></div>}
            {job.customer?.email && <a href={`mailto:${job.customer.email}`} style={{ ...F, display: 'flex', gap: 8, fontSize: 13, color: '#1d4ed8', textDecoration: 'none', alignItems: 'center' }}><span>✉</span>{job.customer.email}</a>}
            {job.customer?.telephone && <a href={`tel:${job.customer.telephone}`} style={{ ...F, display: 'flex', gap: 8, fontSize: 13, color: '#1d4ed8', textDecoration: 'none', alignItems: 'center' }}><span>📞</span>{job.customer.telephone}</a>}
            {job.address_line1 && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${job.address_line1} ${job.town} ${job.postcode}`)}`} target="_blank" rel="noopener" style={{ ...F, display: 'flex', gap: 8, fontSize: 13, color: '#1d4ed8', textDecoration: 'none', alignItems: 'center' }}><span>📍</span>{job.address_line1}, {job.town}, {job.postcode}</a>}
          </div>
        </div>

        {/* Status selector */}
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, padding: '16px 20px' }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0a1628', marginBottom: 8 }}>My Status</label>
          <select value={fitterStatus} onChange={e => handleStatusChange(e.target.value)} disabled={statusSaving}
            style={{ ...F, width: '100%', padding: '9px 12px', border: `2px solid ${STATUS_COLOURS[fitterStatus] ?? '#e2e8f0'}`, borderRadius: 9, fontSize: 13, fontWeight: 600, color: STATUS_COLOURS[fitterStatus] ?? '#374151', cursor: 'pointer', background: '#fff', outline: 'none' }}>
            {STATUS_LABELS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {statusSaving && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 5 }}>Saving…</div>}
          {statusSaved  && <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600, marginTop: 5 }}>✓ Saved</div>}
        </div>

        {/* Messaging */}
        <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, overflow: 'hidden' }}>
          <button onClick={() => setShowMsg(s => !s)}
            style={{ ...F, width: '100%', padding: '13px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 700, color: '#0a1628' }}>
            💬 Message Customer
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ transform: showMsg ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {showMsg && <MessageThread jobId={job.id} userId={profile.id} />}
        </div>

        {/* Review */}
        {job.status === 'closed' && (
          <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, overflow: 'hidden' }}>
            <button onClick={() => setShowReview(s => !s)}
              style={{ ...F, width: '100%', padding: '13px 20px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 700, color: '#0a1628' }}>
              ⭐ Leave Review
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ transform: showReview ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showReview && (
              <div style={{ padding: '16px 20px', background: '#fffbeb', borderTop: '1px solid #fde68a' }}>
                <ReviewForm jobId={job.id} userId={profile.id} otherName={job.customer?.display_name} onSubmitted={() => setShowReview(false)} />
              </div>
            )}
          </div>
        )}

        <Link href="/dashboard/fitter?tab=my-leads" style={{ ...F, fontSize: 12, color: '#64748b', textDecoration: 'none', textAlign: 'center' }}>← Back to My Leads</Link>
      </div>
    )
  }

  // ── Not unlocked — show lead card ────────────────────────
  return (
    <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f2f5' }}>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: '#0a1628', margin: 0 }}>Customer Contact Details</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Unlock this lead to contact the customer directly.</p>
      </div>
      <div style={{ padding: '16px 20px' }}>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 9, padding: '10px 14px', marginBottom: 14, fontSize: 13, color: '#dc2626' }}>{error}</div>}

        {/* Credit cost */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Lead cost</span>
          <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: '#0a1628' }}>{job.credit_cost} credit{job.credit_cost !== 1 ? 's' : ''}</span>
        </div>
        {isFitter && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Your balance</span>
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: '#f0a500' }}>{profile.credits} credits</span>
          </div>
        )}

        {isFitter && job.status === 'open' ? (
          <>
            {profile.credits >= job.credit_cost ? (
              <button onClick={handleUnlock} disabled={unlocking}
                style={{ ...F, width: '100%', padding: '12px', background: unlocking ? '#94a3b8' : '#f0a500', color: '#0a1628', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: unlocking ? 'not-allowed' : 'pointer' }}>
                {unlocking ? 'Unlocking…' : `🔓 Unlock Lead`}
              </button>
            ) : (
              <>
                <div style={{ background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 9, padding: '10px 14px', marginBottom: 12, fontSize: 12, color: '#92400e' }}>
                  Not enough credits. You need {job.credit_cost - profile.credits} more.
                </div>
                <Link href="/dashboard/fitter?tab=credits" style={{ ...F, display: 'block', width: '100%', padding: '12px', background: '#0a1628', color: '#fff', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}>
                  Buy Credits
                </Link>
              </>
            )}
          </>
        ) : isFitter && job.status !== 'open' ? (
          <div style={{ background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#1d4ed8' }}>
            This lead has already been claimed by another fitter.
          </div>
        ) : !isLoggedIn ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: '#f8f9fc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>Register as a fitter to unlock leads and contact customers.</p>
              <Link href="/auth/register-fitter" style={{ ...F, display: 'block', padding: '10px', background: '#f0a500', color: '#0a1628', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none', marginBottom: 8, textAlign: 'center' }}>Register as Fitter</Link>
              <Link href={`/auth/login?redirect=/jobs/${job.id}`} style={{ ...F, display: 'block', padding: '10px', border: '1.5px solid #e2e8f0', color: '#0a1628', borderRadius: 9, fontSize: 13, fontWeight: 600, textDecoration: 'none', textAlign: 'center' }}>Already a fitter? Log in</Link>
            </div>
          </div>
        ) : (
          <div style={{ background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 14px', fontSize: 13, color: '#1d4ed8' }}>
            Contact details are only visible to registered fitters.
          </div>
        )}
      </div>
      <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f2f5', fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>
        Contact details shared only with the unlocking fitter.
      </div>
    </div>
  )
}
