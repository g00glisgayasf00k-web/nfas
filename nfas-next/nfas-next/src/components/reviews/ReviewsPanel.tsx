'use client'

import { useState } from 'react'

// ── Star picker ───────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(n => (
        <button
          key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, fontSize: 28, color: n <= (hover || value) ? '#f0a500' : '#d1d5db', transition: 'color 0.1s' }}
        >★</button>
      ))}
    </div>
  )
}

// ── ReviewForm ────────────────────────────────────────────────

interface ReviewFormProps {
  jobId: string
  userId: string
  otherName?: string
  onSubmitted?: () => void
}

export function ReviewForm({ jobId, userId, otherName, onSubmitted }: ReviewFormProps) {
  const [rating, setRating]   = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  const submit = async () => {
    setLoading(true)
    setError('')
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, rating, comment }),
    })
    setLoading(false)
    if (res.ok) {
      setDone(true)
      setTimeout(() => onSubmitted?.(), 1500)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Could not submit review.')
    }
  }

  if (done) {
    return (
      <div style={{ textAlign: 'center', padding: '16px', color: '#15803d', fontWeight: 600, fontSize: 14 }}>
        ⭐ Thanks for your review!
      </div>
    )
  }

  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#0a1628', marginBottom: 10 }}>
        {otherName ? `How was ${otherName}?` : 'Leave a review:'}
      </p>
      <StarPicker value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Optional comment…"
        rows={2}
        style={{ width: '100%', marginTop: 10, padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
      />
      {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{error}</p>}
      <button
        onClick={submit} disabled={loading}
        style={{ marginTop: 10, padding: '8px 20px', background: '#0a1628', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  )
}

// ── ReviewsPanel (fitter's My Reviews tab) ────────────────────

interface Review {
  id: string
  rating: number
  comment?: string
  created_at: string
  reviewer?: { display_name: string; avatar_url?: string }
  job?: { id: string; title: string }
}

interface ReviewsPanelProps {
  reviews: Review[]
  pendingReviews: any[]
  userId: string
}

function Stars({ n }: { n: number }) {
  return (
    <span style={{ color: '#f0a500', fontSize: 13, letterSpacing: 1 }}>
      {'★'.repeat(n)}{'☆'.repeat(5 - n)}
    </span>
  )
}

export function ReviewsPanel({ reviews, pendingReviews, userId }: ReviewsPanelProps) {
  const [submitted, setSubmitted] = useState<string[]>([])

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: '#0a1628', margin: 0 }}>My Reviews</h2>
        {avg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Stars n={Math.round(Number(avg))} />
            <span style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: '#f0a500' }}>{avg}</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
          </div>
        )}
      </div>

      {/* Pending reviews */}
      {pendingReviews.filter(j => !submitted.includes(j.id)).length > 0 && (
        <div style={{ background: '#fffbeb', borderRadius: 16, border: '1px solid #fde68a', padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e', marginBottom: 14 }}>Jobs awaiting your review:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {pendingReviews.filter(j => !submitted.includes(j.id)).map(job => (
              <div key={job.id} style={{ paddingBottom: 16, borderBottom: '1px solid #fde68a' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0a1628', marginBottom: 8 }}>{job.title}</div>
                <ReviewForm
                  jobId={job.id}
                  userId={userId}
                  otherName={job.customer?.display_name}
                  onSubmitted={() => setSubmitted(s => [...s, job.id])}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews received */}
      {reviews.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⭐</div>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#0a1628', marginBottom: 8 }}>No reviews yet</h3>
          <p style={{ fontSize: 14, color: '#64748b' }}>Reviews from customers will appear here once jobs are completed.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map(r => (
            <div key={r.id} style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8ecf0', padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0a1628' }}>{r.reviewer?.display_name ?? 'Customer'}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{r.job?.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Stars n={r.rating} />
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                    {new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              {r.comment && (
                <p style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, borderTop: '1px solid #f0f2f5', paddingTop: 8, margin: 0 }}>
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
