'use client'

import { useState } from 'react'

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, fontSize: 28, color: n <= (hover || value) ? '#f0a500' : '#d1d5db', transition: 'color 0.1s', lineHeight: 1 }}>
          ★
        </button>
      ))}
    </div>
  )
}

export function ReviewForm({ jobId, userId, otherName, onSubmitted }: {
  jobId: string; userId: string; otherName?: string; onSubmitted?: () => void
}) {
  const [rating, setRating]   = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState('')

  const submit = async () => {
    setLoading(true); setError('')
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

  if (done) return (
    <div style={{ textAlign: 'center', padding: '16px', color: '#15803d', fontWeight: 600, fontSize: 14 }}>
      ⭐ Thanks for your review!
    </div>
  )

  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: '#0a1628', marginBottom: 10 }}>
        {otherName ? `How was ${otherName}?` : 'Leave a review:'}
      </p>
      <StarPicker value={rating} onChange={setRating} />
      <textarea value={comment} onChange={e => setComment(e.target.value)}
        placeholder="Optional comment…" rows={2}
        style={{ width: '100%', marginTop: 10, padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
      {error && <p style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{error}</p>}
      <button onClick={submit} disabled={loading}
        style={{ marginTop: 10, padding: '8px 20px', background: '#0a1628', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
        {loading ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  )
}
