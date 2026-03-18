'use client'

import Link from 'next/link'
import { useState } from 'react'
import { formatTime, formatPriceDecimal, jobStatusLabel } from '@/lib/utils'
import { MessageThread } from '@/components/messaging/MessageThread'
import { ReviewForm } from '@/components/reviews/ReviewForm'
import type { Profile, LeadUnlock } from '@/types'

interface Props {
  jobs: any[]
  emptyIcon: string
  emptyTitle: string
  emptyDesc?: string
  emptyAction?: { label: string; href: string }
  profile: Profile
  viewer: 'customer' | 'fitter'
  isHistory?: boolean
  unlocks?: LeadUnlock[]
}

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  open:      { bg: '#dcfce7', color: '#15803d', label: 'Open' },
  claimed:   { bg: '#fef3c7', color: '#92400e', label: 'Fitter Matched' },
  closed:    { bg: '#f1f5f9', color: '#475569', label: 'Completed' },
  cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
}

export function JobsList({ jobs, emptyIcon, emptyTitle, emptyDesc, emptyAction, profile, viewer, isHistory, unlocks = [] }: Props) {
  const [openMsg, setOpenMsg]     = useState<string | null>(null)
  const [openReview, setOpenReview] = useState<string | null>(null)

  if (!jobs.length) {
    return (
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{emptyIcon}</div>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#0a1628', marginBottom: 8 }}>{emptyTitle}</h3>
        {emptyDesc && <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>{emptyDesc}</p>}
        {emptyAction && (
          <Link href={emptyAction.href} style={{ display: 'inline-block', padding: '10px 22px', background: '#f0a500', color: '#0a1628', borderRadius: 9, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
            {emptyAction.label}
          </Link>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: '#0a1628', margin: 0 }}>
          {isHistory ? 'Completed Jobs' : viewer === 'fitter' ? 'My Leads' : 'Active Jobs'}
        </h2>
        {!isHistory && viewer === 'customer' && (
          <Link href="/dashboard/customer?tab=post" style={{ padding: '8px 18px', background: '#f0a500', color: '#0a1628', borderRadius: 8, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            + Post New Job
          </Link>
        )}
      </div>

      {jobs.map(job => {
        const status = job.status ?? 'open'
        const statusStyle = STATUS_STYLES[status] ?? STATUS_STYLES.open
        const displayLabel = jobStatusLabel(status, viewer)
        const unlock = unlocks.find(u => u.job_id === job.id) ?? job.unlock
        const fitter = unlock?.fitter
        const customer = job.customer
        const isMatched = ['claimed', 'closed'].includes(status) && (viewer === 'customer' ? fitter : true)
        const canMessage = isMatched
        const canReview = status === 'closed'

        return (
          <div key={job.id} style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
            {/* Job header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #f0f2f5' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: '#0a1628', margin: 0, flex: 1 }}>
                  <Link href={`/jobs/${job.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{job.title}</Link>
                </h3>
                <span style={{ background: statusStyle.bg, color: statusStyle.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, flexShrink: 0 }}>
                  {displayLabel}
                </span>
              </div>

              {/* Meta */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 20px', fontSize: 12, color: '#64748b' }}>
                {job.town && <span>📍 {job.town}{job.postcode ? `, ${job.postcode}` : ''}</span>}
                {job.preferred_date && <span>📅 {new Date(job.preferred_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                {job.est_time_min > 0 && <span>⏱ {formatTime(job.est_time_min)}</span>}
                {job.est_price > 0 && <span>💷 {formatPriceDecimal(job.est_price)}</span>}
              </div>
            </div>

            {/* Progress bar (customer view) */}
            {viewer === 'customer' && (
              <div style={{ padding: '14px 22px', borderBottom: '1px solid #f0f2f5' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                  {[
                    { label: 'Job Posted', done: true },
                    { label: status === 'open' ? 'Finding Fitter' : 'Fitter Matched', done: ['claimed', 'closed'].includes(status) },
                    { label: 'Complete', done: status === 'closed' },
                  ].map((step, i, arr) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < arr.length - 1 ? 1 : 'initial' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: step.done ? '#f0a500' : '#e2e8f0', border: step.done ? '2px solid #f0a500' : '2px solid #d1d5db' }} />
                        <span style={{ fontSize: 10, color: step.done ? '#0a1628' : '#94a3b8', fontWeight: step.done ? 600 : 400, whiteSpace: 'nowrap' }}>{step.label}</span>
                      </div>
                      {i < arr.length - 1 && (
                        <div style={{ flex: 1, height: 2, background: step.done ? '#f0a500' : '#e2e8f0', margin: '-14px 4px 0', minWidth: 24 }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matched fitter (customer view) */}
            {viewer === 'customer' && isMatched && fitter && (
              <div style={{ padding: '14px 22px', background: status === 'closed' ? '#f0f9ff' : '#f0fdf4', borderBottom: '1px solid #f0f2f5' }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: status === 'closed' ? '#0369a1' : '#15803d', marginBottom: 10 }}>
                  {status === 'closed' ? '✅ Job Completed' : '✓ Your matched fitter'}
                </div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#0a1628', color: '#f0a500', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                    {fitter.display_name?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0a1628' }}>{fitter.display_name}</div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 4, fontSize: 12 }}>
                      {fitter.email && <a href={`mailto:${fitter.email}`} style={{ color: '#1b3a6b', textDecoration: 'none' }}>✉ {fitter.email}</a>}
                      {fitter.telephone && <a href={`tel:${fitter.telephone}`} style={{ color: '#1b3a6b', textDecoration: 'none' }}>📞 {fitter.telephone}</a>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fitter contact (fitter view, unlocked) */}
            {viewer === 'fitter' && customer && (
              <div style={{ padding: '14px 22px', background: '#f8fafc', borderBottom: '1px solid #f0f2f5', display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 12 }}>
                {customer.display_name && <span style={{ fontWeight: 600, color: '#0a1628' }}>👤 {customer.display_name}</span>}
                {customer.email && <a href={`mailto:${customer.email}`} style={{ color: '#1b3a6b', textDecoration: 'none' }}>✉ {customer.email}</a>}
                {customer.telephone && <a href={`tel:${customer.telephone}`} style={{ color: '#1b3a6b', textDecoration: 'none' }}>📞 {customer.telephone}</a>}
              </div>
            )}

            {/* Fitter status selector */}
            {viewer === 'fitter' && unlock && (
              <div style={{ padding: '12px 22px', borderBottom: '1px solid #f0f2f5' }}>
                <FitterStatusSelect unlock={unlock} jobId={job.id} />
              </div>
            )}

            {/* Actions */}
            <div style={{ padding: '12px 22px', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Link href={`/jobs/${job.id}`} style={{ padding: '7px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12, fontWeight: 600, color: '#0a1628', textDecoration: 'none' }}>
                View Full Job
              </Link>
              {canMessage && (
                <button
                  onClick={() => setOpenMsg(openMsg === job.id ? null : job.id)}
                  style={{ padding: '7px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  💬 {viewer === 'customer' ? 'Message Fitter' : 'Message Customer'}
                </button>
              )}
              {canReview && (
                <button
                  onClick={() => setOpenReview(openReview === job.id ? null : job.id)}
                  style={{ padding: '7px 14px', background: '#fffbeb', color: '#92400e', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  ⭐ Leave Review
                </button>
              )}
            </div>

            {/* Inline message thread */}
            {openMsg === job.id && (
              <div style={{ borderTop: '1px solid #f0f2f5' }}>
                <MessageThread jobId={job.id} userId={profile.id} />
              </div>
            )}

            {/* Inline review form */}
            {openReview === job.id && (
              <div style={{ borderTop: '1px solid #f0f2f5', padding: '16px 22px', background: '#fffbeb' }}>
                <ReviewForm
                  jobId={job.id}
                  userId={profile.id}
                  otherName={viewer === 'customer' ? fitter?.display_name : customer?.display_name}
                  onSubmitted={() => setOpenReview(null)}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Fitter status select — client component
function FitterStatusSelect({ unlock, jobId }: { unlock: any; jobId: string }) {
  const [status, setStatus]   = useState(unlock.fitter_status ?? '')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)

  const STATUSES = [
    { value: '',            label: 'Update Status…' },
    { value: 'contacted',  label: '📞 Contacted' },
    { value: 'booked',     label: '📅 Booked In' },
    { value: 'completed',  label: '✅ Completed' },
    { value: 'no_response',label: '🔕 No Response' },
    { value: 'cancelled',  label: '❌ Cancelled' },
  ]

  const COLOURS: Record<string, string> = {
    '': '#6b7280', contacted: '#1d4ed8', booked: '#7c3aed',
    completed: '#15803d', no_response: '#b45309', cancelled: '#dc2626',
  }

  const handleChange = async (newVal: string) => {
    if (!newVal) return
    const prev = status
    const label = STATUSES.find(s => s.value === newVal)?.label ?? newVal
    if (!confirm(`Change status to "${label}"?`)) return

    setStatus(newVal)
    setSaving(true)
    const res = await fetch('/api/leads/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, fitter_status: newVal }),
    })
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } else {
      setStatus(prev)
      alert('Could not save status.')
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>My Status:</span>
      <select
        value={status}
        onChange={e => handleChange(e.target.value)}
        disabled={saving}
        style={{ padding: '5px 10px', border: `2px solid ${COLOURS[status] ?? '#e2e8f0'}`, borderRadius: 7, fontSize: 12, fontWeight: 600, color: COLOURS[status] ?? '#374151', fontFamily: 'inherit', cursor: 'pointer', background: '#fff' }}
      >
        {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
      {saving && <span style={{ fontSize: 11, color: '#94a3b8' }}>Saving…</span>}
      {saved && <span style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>✓ Saved</span>}
    </div>
  )
}
