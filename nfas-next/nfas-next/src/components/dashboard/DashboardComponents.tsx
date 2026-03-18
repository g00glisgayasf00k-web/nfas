'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatTime, formatPriceDecimal, geocodePostcode, calcCreditCost, buildJobTitle, calcJobTotals } from '@/lib/utils'
import { DocumentUpload } from './DocumentUpload'
import type { Profile, InventoryItem, CreditPack } from '@/types'

const SYNE: React.CSSProperties = { fontFamily: "'Syne',sans-serif" }
const F: React.CSSProperties    = { fontFamily: "'DM Sans',system-ui,sans-serif" }

function Panel({ title, subtitle, children }: { title: string; subtitle?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ ...SYNE, fontSize: 18, fontWeight: 700, color: '#0a1628', margin: 0 }}>{title}</h2>
        {subtitle}
      </div>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0',
  borderRadius: 9, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}

// ── ProfileForm ──────────────────────────────────────────────
export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter()
  const [form, setForm] = useState({
    first_name:    profile.first_name    ?? '',
    last_name:     profile.last_name     ?? '',
    telephone:     profile.telephone     ?? '',
    address_line1: profile.address_line1 ?? '',
    address_line2: profile.address_line2 ?? '',
    town:          profile.town          ?? '',
    postcode:      profile.postcode      ?? '',
    bio:           profile.bio           ?? '',
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved]     = useState(false)
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ ...form, postcode: form.postcode.toUpperCase() }).eq('id', profile.id)
    setLoading(false); setSaved(true); router.refresh()
    setTimeout(() => setSaved(false), 3000)
  }

  const label = (text: string, key?: string) => (
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0a1628', marginBottom: 5 }}>{text}</label>
  )

  return (
    <Panel title="My Profile">
      <div style={{ padding: 24 }}>
        {saved && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#15803d', fontWeight: 600 }}>✓ Profile saved</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>{label('First Name')}<input type="text" value={form.first_name} onChange={set('first_name')} style={inputStyle} onFocus={e => e.target.style.borderColor='#0a1628'} onBlur={e => e.target.style.borderColor='#e2e8f0'} /></div>
            <div>{label('Last Name')}<input type="text" value={form.last_name} onChange={set('last_name')} style={inputStyle} onFocus={e => e.target.style.borderColor='#0a1628'} onBlur={e => e.target.style.borderColor='#e2e8f0'} /></div>
          </div>
          <div>{label('Telephone')}<input type="tel" value={form.telephone} onChange={set('telephone')} style={inputStyle} onFocus={e => e.target.style.borderColor='#0a1628'} onBlur={e => e.target.style.borderColor='#e2e8f0'} /></div>
          <div>{label('Address Line 1')}<input type="text" value={form.address_line1} onChange={set('address_line1')} style={inputStyle} onFocus={e => e.target.style.borderColor='#0a1628'} onBlur={e => e.target.style.borderColor='#e2e8f0'} /></div>
          <div>{label('Address Line 2')}<input type="text" value={form.address_line2} onChange={set('address_line2')} style={inputStyle} onFocus={e => e.target.style.borderColor='#0a1628'} onBlur={e => e.target.style.borderColor='#e2e8f0'} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>{label('Town / City')}<input type="text" value={form.town} onChange={set('town')} style={inputStyle} onFocus={e => e.target.style.borderColor='#0a1628'} onBlur={e => e.target.style.borderColor='#e2e8f0'} /></div>
            <div>{label('Postcode')}<input type="text" value={form.postcode} onChange={set('postcode')} style={{ ...inputStyle, textTransform: 'uppercase' }} onFocus={e => e.target.style.borderColor='#0a1628'} onBlur={e => e.target.style.borderColor='#e2e8f0'} /></div>
          </div>
          {profile.role === 'fitter' && (
            <div>{label('Bio')}<textarea value={form.bio} onChange={set('bio')} rows={4} placeholder="Tell customers about your experience…" style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} onFocus={e => e.target.style.borderColor='#0a1628'} onBlur={e => e.target.style.borderColor='#e2e8f0'} /></div>
          )}
          <button type="submit" disabled={loading}
            style={{ ...F, padding: '12px', background: loading ? '#94a3b8' : '#0a1628', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>
    </Panel>
  )
}

// ── FitterProfile ────────────────────────────────────────────
export function FitterProfile({ profile, documents = [] }: { profile: Profile; documents?: any[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ background: profile.is_verified ? '#f0fdf4' : '#fffbeb', border: `1px solid ${profile.is_verified ? '#bbf7d0' : '#fde68a'}`, borderRadius: 14, padding: '16px 20px' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: profile.is_verified ? '#15803d' : '#92400e', marginBottom: 4 }}>
          {profile.is_verified ? '✓ Account Verified — You can receive leads' : '⏳ Verification Pending'}
        </div>
        <p style={{ ...F, fontSize: 12, color: profile.is_verified ? '#15803d' : '#92400e', margin: 0, opacity: 0.8 }}>
          {profile.is_verified
            ? 'Your documents have been approved. Browse new leads to get started.'
            : 'Upload your documents from the profile section. We aim to verify within 48 hours.'}
        </p>
      </div>
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 14, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4 }}>Credit balance</div>
          <div style={{ ...SYNE, fontSize: 34, fontWeight: 800, color: '#f0a500', letterSpacing: '-1px' }}>
            {profile.credits} <span style={{ fontSize: 15, color: '#94a3b8', fontWeight: 400 }}>credits</span>
          </div>
        </div>
        <Link href="/dashboard/fitter?tab=credits" style={{ ...F, background: '#0a1628', color: '#fff', padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
          Buy Credits
        </Link>
      </div>
      <ProfileForm profile={profile} />
      <div style={{ background: '#fff', border: '1px solid #e8ecf0', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #f0f2f5' }}>
          <h3 style={{ ...SYNE, fontSize: 16, fontWeight: 700, color: '#0a1628', margin: 0 }}>Verification Documents</h3>
        </div>
        <div style={{ padding: '20px 22px' }}>
          <DocumentUpload existingDocs={documents} fitterId={profile.id} />
        </div>
      </div>
    </div>
  )
}

// ── FitterRadius ─────────────────────────────────────────────
export function FitterRadius({ profile, area }: { profile: Profile; area: any }) {
  const router = useRouter()
  const [postcode, setPostcode] = useState(area?.postcode ?? profile.postcode ?? '')
  const [radius,   setRadius]   = useState<number>(area?.radius_mi ?? 10)
  const [loading,  setLoading]  = useState(false)
  const [saved,    setSaved]    = useState(false)
  const [error,    setError]    = useState('')

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    const coords = await geocodePostcode(postcode)
    if (!coords) { setError('Could not find that postcode. Please check and try again.'); setLoading(false); return }

    const supabase = createClient()
    await supabase.from('fitter_areas').upsert({
      fitter_id: profile.id, postcode: postcode.toUpperCase(),
      lat: coords.lat, lng: coords.lng, radius_mi: radius,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'fitter_id' })

    setLoading(false); setSaved(true); router.refresh()
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Panel title="My Service Radius">
      <div style={{ padding: 24 }}>
        <p style={{ ...F, fontSize: 13, color: '#64748b', marginBottom: 20, lineHeight: 1.65 }}>
          Set your base postcode and travel radius. Only jobs within this distance will appear in your New Leads feed.
        </p>
        {saved  && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#15803d', fontWeight: 600 }}>✓ Radius saved</div>}
        {error  && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>{error}</div>}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0a1628', marginBottom: 6 }}>Your base postcode *</label>
            <input type="text" value={postcode} onChange={e => setPostcode(e.target.value)} placeholder="e.g. S40 1AB" required
              style={{ ...inputStyle, maxWidth: 200, textTransform: 'uppercase' }}
              onFocus={e => e.target.style.borderColor='#0a1628'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#0a1628' }}>Travel radius</label>
              <span style={{ ...SYNE, fontSize: 20, fontWeight: 800, color: '#f0a500' }}>{radius} miles</span>
            </div>
            <input type="range" min={3} max={50} step={1} value={radius} onChange={e => setRadius(Number(e.target.value))} style={{ width: '100%', accentColor: '#f0a500' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
              <span>3 miles</span><span>50 miles</span>
            </div>
          </div>
          <button type="submit" disabled={loading}
            style={{ ...F, padding: '12px', background: loading ? '#94a3b8' : '#f0a500', color: '#0a1628', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', alignSelf: 'flex-start', paddingLeft: 28, paddingRight: 28 }}>
            {loading ? 'Saving…' : 'Save Radius'}
          </button>
        </form>
      </div>
    </Panel>
  )
}

// ── NewLeads ─────────────────────────────────────────────────
export function NewLeads({ jobs, profile, area }: { jobs: any[]; profile: Profile; area: any }) {
  const router = useRouter()
  const [unlocking, setUnlocking] = useState<string | null>(null)
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const unlock = async (jobId: string, creditCost: number) => {
    if (profile.credits < creditCost) { setFlash({ type: 'error', text: `You need ${creditCost} credit${creditCost !== 1 ? 's' : ''} but only have ${profile.credits}.` }); return }
    if (!confirm(`Unlock this lead for ${creditCost} credit${creditCost !== 1 ? 's' : ''}?`)) return
    setUnlocking(jobId)
    const res = await fetch('/api/leads/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ job_id: jobId }) })
    const data = await res.json()
    setUnlocking(null)
    if (!res.ok || data.error) { setFlash({ type: 'error', text: data.error ?? 'Failed to unlock.' }); return }
    setFlash({ type: 'success', text: `Lead unlocked! ${data.credits_remaining} credits remaining.` })
    router.refresh()
  }

  if (!jobs.length) return (
    <Panel title="New Leads">
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <h3 style={{ ...SYNE, fontSize: 18, fontWeight: 700, color: '#0a1628', marginBottom: 8 }}>No leads in your area</h3>
        <p style={{ ...F, fontSize: 14, color: '#64748b', marginBottom: 20 }}>
          {area ? `No open jobs within ${area.radius_mi} miles of ${area.postcode}.` : 'Set your service radius to see local jobs.'}
        </p>
        {!area && <Link href="/dashboard/fitter?tab=radius" style={{ ...F, background: '#f0a500', color: '#0a1628', padding: '10px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>Set My Radius</Link>}
      </div>
    </Panel>
  )

  return (
    <Panel title="New Leads" subtitle={<span style={{ fontSize: 12, color: '#94a3b8' }}>{jobs.length} available</span>}>
      <div>
        {flash && (
          <div style={{ margin: '16px 24px 0', background: flash.type === 'success' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${flash.type === 'success' ? '#bbf7d0' : '#fecaca'}`, borderRadius: 10, padding: '12px 16px', fontSize: 13, color: flash.type === 'success' ? '#15803d' : '#dc2626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {flash.text}
            <button onClick={() => setFlash(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        )}
        {jobs.map(job => (
          <div key={job.id} style={{ padding: '18px 24px', borderBottom: '1px solid #f0f2f5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
              <h3 style={{ ...SYNE, fontSize: 15, fontWeight: 700, color: '#0a1628', margin: 0 }}>{job.title}</h3>
              <span style={{ ...F, background: '#dcfce7', color: '#15803d', padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>Open</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', fontSize: 12, color: '#64748b', marginBottom: 10 }}>
              <span>📍 {job.town}{job.postcode ? `, ${job.postcode}` : ''}</span>
              {job.est_time_min > 0 && <span>⏱ {formatTime(job.est_time_min)}</span>}
              {job.est_price > 0   && <span>💷 {formatPriceDecimal(job.est_price)}</span>}
              {job.preferred_date  && <span>📅 {new Date(job.preferred_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>}
            </div>
            {job.job_items?.length > 0 && (
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>
                {job.job_items.slice(0, 4).map((it: any) => `${it.quantity}× ${it.name}`).join(' · ')}
                {job.job_items.length > 4 ? ` +${job.job_items.length - 4} more` : ''}
              </div>
            )}
            {job.notes && <p style={{ ...F, fontSize: 12, color: '#64748b', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>{job.notes}</p>}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => unlock(job.id, job.credit_cost)} disabled={!!unlocking}
                style={{ ...F, background: profile.credits >= job.credit_cost ? '#f0a500' : '#e2e8f0', color: profile.credits >= job.credit_cost ? '#0a1628' : '#94a3b8', border: 'none', padding: '8px 18px', borderRadius: 9, fontSize: 12, fontWeight: 700, cursor: unlocking || profile.credits < job.credit_cost ? 'not-allowed' : 'pointer' }}>
                {unlocking === job.id ? 'Unlocking…' : `🔓 Unlock (${job.credit_cost} credit${job.credit_cost !== 1 ? 's' : ''})`}
              </button>
              <Link href={`/jobs/${job.id}`} style={{ ...F, fontSize: 12, color: '#1b3a6b', textDecoration: 'none', fontWeight: 500 }}>Preview job →</Link>
              {profile.credits < job.credit_cost && (
                <Link href="/dashboard/fitter?tab=credits" style={{ ...F, fontSize: 12, color: '#dc2626', textDecoration: 'none', fontWeight: 600 }}>Buy credits</Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// ── PostJobForm ──────────────────────────────────────────────
export function PostJobForm({ inventory, profile }: { inventory: InventoryItem[]; profile: Profile }) {
  const router = useRouter()
  const [items, setItems] = useState<Array<{ inventory_id: string; name: string; quantity: number; time_min: number; unit_price: number }>>([])
  const [useProfile, setUseProfile] = useState(true)
  const [addr, setAddr]   = useState({ address_line1: '', town: '', postcode: '' })
  const [notes, setNotes] = useState('')
  const [date, setDate]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const categories = [...new Set(inventory.map(i => i.category))]
  const totals = calcJobTotals(items)

  const addItem = (inv: InventoryItem) => setItems(p => {
    const ex = p.find(i => i.inventory_id === inv.id)
    if (ex) return p.map(i => i.inventory_id === inv.id ? { ...i, quantity: i.quantity + 1 } : i)
    return [...p, { inventory_id: inv.id, name: inv.name, quantity: 1, time_min: inv.base_time_min, unit_price: inv.base_price }]
  })

  const removeItem  = (id: string) => setItems(p => p.filter(i => i.inventory_id !== id))
  const updateQty   = (id: string, q: number) => q < 1 ? removeItem(id) : setItems(p => p.map(i => i.inventory_id === id ? { ...i, quantity: q } : i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!items.length) { setError('Add at least one item.'); return }
    setError(''); setLoading(true)

    const town     = useProfile ? (profile.town ?? '') : addr.town
    const postcode = useProfile ? (profile.postcode ?? '') : addr.postcode
    const addr1    = useProfile ? (profile.address_line1 ?? '') : addr.address_line1

    if (!town || !postcode) { setError('Address is required.'); setLoading(false); return }

    const coords      = await geocodePostcode(postcode)
    const { est_price, est_time_min, total_items } = totals
    const credit_cost = calcCreditCost(est_price)

    const supabase = createClient()
    const { data: job, error: err } = await supabase.from('jobs').insert({
      customer_id: profile.id, title: buildJobTitle(items), status: 'open',
      address_line1: addr1, town, postcode: postcode.toUpperCase(),
      lat: coords?.lat ?? null, lng: coords?.lng ?? null,
      notes: notes || null, preferred_date: date || null,
      total_items, est_time_min, est_price, credit_cost,
    }).select().single()

    if (err || !job) { setError(err?.message ?? 'Failed to create job.'); setLoading(false); return }

    await supabase.from('job_items').insert(items.map((item, i) => ({ ...item, job_id: job.id, sort_order: i })))
    router.push('/dashboard/customer?tab=jobs')
    router.refresh()
  }

  return (
    <Panel title="Post a New Job">
      <div style={{ padding: 24 }}>
        {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#dc2626' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Item picker */}
          <div>
            <h3 style={{ ...SYNE, fontSize: 15, fontWeight: 700, color: '#0a1628', marginBottom: 14 }}>Select items to assemble</h3>
            {categories.map(cat => (
              <div key={cat} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 7 }}>{cat}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {inventory.filter(i => i.category === cat).map(inv => (
                    <button key={inv.id} type="button" onClick={() => addItem(inv)}
                      style={{ ...F, padding: '7px 14px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8f9fc', fontSize: 12, fontWeight: 500, color: '#0a1628', cursor: 'pointer', transition: 'all 0.12s' }}
                      onMouseEnter={e => { const t = e.currentTarget; t.style.borderColor='#0a1628'; t.style.background='#0a1628'; t.style.color='#fff' }}
                      onMouseLeave={e => { const t = e.currentTarget; t.style.borderColor='#e2e8f0'; t.style.background='#f8f9fc'; t.style.color='#0a1628' }}>
                      + {inv.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Items table */}
          {items.length > 0 && (
            <div style={{ border: '1px solid #e8ecf0', borderRadius: 12, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead style={{ background: '#f0f2f5' }}>
                  <tr>{['Item','Qty','Time','Price',''].map(h => <th key={h} style={{ padding: '9px 14px', textAlign: h === 'Qty' ? 'center' : h === '' ? 'center' : 'left', fontWeight: 700, color: '#0a1628', fontSize: 12 }}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.inventory_id} style={{ borderTop: '1px solid #e8ecf0' }}>
                      <td style={{ padding: '9px 14px', fontWeight: 500 }}>{item.name}</td>
                      <td style={{ padding: '9px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          <button type="button" onClick={() => updateQty(item.inventory_id, item.quantity - 1)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                          <span style={{ fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{item.quantity}</span>
                          <button type="button" onClick={() => updateQty(item.inventory_id, item.quantity + 1)} style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                        </div>
                      </td>
                      <td style={{ padding: '9px 14px', color: '#64748b', textAlign: 'right' }}>{formatTime(item.quantity * item.time_min)}</td>
                      <td style={{ padding: '9px 14px', fontWeight: 600, textAlign: 'right' }}>{formatPriceDecimal(item.quantity * item.unit_price)}</td>
                      <td style={{ padding: '9px 10px', textAlign: 'center' }}><button type="button" onClick={() => removeItem(item.inventory_id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 18 }}>×</button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid #0a1628', background: '#f0fdf4' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#15803d' }}>Total</td>
                    <td style={{ textAlign: 'center', fontWeight: 700, color: '#15803d' }}>{totals.total_items}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#15803d' }}>{formatTime(totals.est_time_min)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: '#15803d' }}>{formatPriceDecimal(totals.est_price)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* Address */}
          <div>
            <h3 style={{ ...SYNE, fontSize: 15, fontWeight: 700, color: '#0a1628', marginBottom: 12 }}>Assembly address</h3>
            {(profile.address_line1 && profile.town && profile.postcode) && (
              <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 12, cursor: 'pointer', fontSize: 13, color: '#475569' }}>
                <input type="checkbox" checked={useProfile} onChange={e => setUseProfile(e.target.checked)} style={{ marginTop: 2 }} />
                <span>Use my profile address — <strong>{profile.address_line1}, {profile.town}, {profile.postcode}</strong></span>
              </label>
            )}
            {!useProfile && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['address_line1','Address Line 1'],['town','Town / City'],['postcode','Postcode']].map(([k,lbl]) => (
                  <div key={k}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0a1628', marginBottom: 5 }}>{lbl} *</label>
                    <input type="text" value={(addr as any)[k]} onChange={e => setAddr(a => ({ ...a, [k]: e.target.value }))}
                      style={{ ...inputStyle, maxWidth: k === 'postcode' ? 200 : undefined, textTransform: k === 'postcode' ? 'uppercase' : 'none' }}
                      onFocus={e => e.target.style.borderColor='#0a1628'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes + date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0a1628', marginBottom: 5 }}>Notes (optional)</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Any special instructions…"
                style={{ ...inputStyle, resize: 'vertical' }} onFocus={e => e.target.style.borderColor='#0a1628'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#0a1628', marginBottom: 5 }}>Preferred date (optional)</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]}
                style={{ ...inputStyle }} onFocus={e => e.target.style.borderColor='#0a1628'} onBlur={e => e.target.style.borderColor='#e2e8f0'} />
            </div>
          </div>

          <button type="submit" disabled={loading || !items.length}
            style={{ ...F, padding: '14px', background: loading || !items.length ? '#94a3b8' : '#f0a500', color: '#0a1628', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading || !items.length ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Posting…' : items.length ? `Post Job — ${totals.total_items} item${totals.total_items !== 1 ? 's' : ''}, est. ${formatPriceDecimal(totals.est_price)}` : 'Add items above to continue'}
          </button>
        </form>
      </div>
    </Panel>
  )
}

// ── CreditsPanel ─────────────────────────────────────────────
async function startCheckout(packId: string) {
  const res = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pack_id: packId }),
  })
  const data = await res.json()
  if (data.url) window.location.href = data.url
  else alert(data.error ?? 'Could not start checkout.')
}

export function CreditsPanel({ profile, packs }: { profile: Profile; packs: CreditPack[] }) {
  return (
    <Panel title="Buy Credits">
      <div style={{ padding: 24 }}>
        <div style={{ background: '#f8f9fc', borderRadius: 12, padding: '18px 22px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 3 }}>Your current balance</div>
            <div style={{ ...SYNE, fontSize: 34, fontWeight: 800, color: '#f0a500', letterSpacing: '-1px' }}>{profile.credits}<span style={{ fontSize: 16, color: '#94a3b8', fontWeight: 400, marginLeft: 6 }}>credits</span></div>
          </div>
          <div style={{ fontSize: 12, color: '#64748b', lineHeight: 1.7, textAlign: 'right' }}>1 credit = 1 lead unlocked<br/>Credits never expire</div>
        </div>
        {!packs.length ? (
          <p style={{ ...F, fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '32px 0' }}>No credit packs available. Check back soon.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(175px,1fr))', gap: 16 }}>
            {packs.map(pack => (
              <div key={pack.id} style={{ border: `2px solid ${pack.badge ? '#0a1628' : '#e2e8f0'}`, borderRadius: 16, padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: 5, position: 'relative', background: '#fff' }}>
                {pack.badge && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#0a1628', color: '#f0a500', padding: '2px 12px', borderRadius: 999, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>{pack.badge}</div>}
                <div style={{ ...F, fontSize: 13, fontWeight: 700, color: '#0a1628' }}>{pack.name}</div>
                <div style={{ ...SYNE, fontSize: 26, fontWeight: 800, color: '#f0a500', letterSpacing: '-1px' }}>{pack.credits}<span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}> credits</span></div>
                <div style={{ ...SYNE, fontSize: 20, fontWeight: 800, color: '#0a1628' }}>£{(pack.price_pence / 100).toFixed(2)}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>£{(pack.price_pence / pack.credits / 100).toFixed(2)} / credit</div>
                <button onClick={() => startCheckout(pack.id)} style={{ ...F, width: '100%', padding: '9px', background: pack.badge ? '#f0a500' : '#0a1628', color: pack.badge ? '#0a1628' : '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
                  Buy Now
                </button>
              </div>
            ))}
          </div>
        )}
        <p style={{ ...F, fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 20 }}>Secure payment via Stripe. Credits added instantly.</p>
      </div>
    </Panel>
  )
}
