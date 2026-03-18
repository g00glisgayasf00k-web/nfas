'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── MessageThread (inline per-job chat) ────────────────────────────────

interface ThreadProps {
  jobId: string
  userId: string
}

interface Msg {
  id: string
  sender_id: string
  body: string
  created_at: string
  sender?: { display_name: string }
}

export function MessageThread({ jobId, userId }: ThreadProps) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const scrollToBottom = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }

  const loadMessages = useCallback(async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(display_name)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })

    setMessages(data ?? [])
    setLoading(false)

    // Mark as read
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('job_id', jobId)
      .eq('receiver_id', userId)
      .is('read_at', null)
  }, [jobId, userId])

  useEffect(() => {
    loadMessages().then(scrollToBottom)

    // Realtime subscription
    const channel = supabase
      .channel(`messages:${jobId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `job_id=eq.${jobId}`,
      }, async (payload) => {
        // Fetch sender info
        const { data: sender } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', payload.new.sender_id)
          .single()

        setMessages(prev => [...prev, { ...payload.new as Msg, sender: sender ?? undefined }])
        setTimeout(scrollToBottom, 50)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [jobId, loadMessages])

  const send = async () => {
    const body = input.trim()
    if (!body || sending) return
    setSending(true)
    setInput('')

    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, body }),
    })
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={{ background: '#f8fafc' }}>
      {/* Messages */}
      <div ref={scrollRef} style={{ height: 240, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', padding: '20px 0' }}>Loading…</div>}
        {!loading && messages.length === 0 && <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', padding: '20px 0' }}>No messages yet — say hello!</div>}
        {messages.map(m => {
          const mine = m.sender_id === userId
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '75%', padding: '9px 13px', borderRadius: 12, borderBottomRightRadius: mine ? 3 : 12, borderBottomLeftRadius: mine ? 12 : 3, background: mine ? '#0a1628' : '#fff', color: mine ? '#fff' : '#0a1628', fontSize: 13, lineHeight: 1.5, border: mine ? 'none' : '1px solid #e2e8f0' }}>
                {m.body}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, paddingLeft: mine ? 0 : 4, paddingRight: mine ? 4 : 0 }}>
                {mine ? 'You' : m.sender?.display_name} · {new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Compose */}
      <div style={{ display: 'flex', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={2}
          style={{ flex: 1, padding: '10px 14px', border: 'none', resize: 'none', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
        />
        <button
          onClick={send} disabled={!input.trim() || sending}
          style={{ padding: '0 18px', background: '#0a1628', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0, opacity: !input.trim() ? 0.4 : 1 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  )
}

// ── MessagesPanel (the full Messages tab) ──────────────────────────────

interface PanelProps {
  userId: string
  jobs: any[]
  viewer: 'customer' | 'fitter'
}

export function MessagesPanel({ userId, jobs, viewer }: PanelProps) {
  const [openJob, setOpenJob] = useState<string | null>(null)

  const messageable = jobs.filter(j => ['claimed', 'closed'].includes(j.status))

  if (!messageable.length) {
    return (
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
        <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700, color: '#0a1628', marginBottom: 8 }}>No active conversations</h3>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          {viewer === 'customer'
            ? 'Once a fitter is matched to your job, you can message them here.'
            : 'Once you unlock a lead, you can message the customer here.'}
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8ecf0', overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f2f5' }}>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 800, color: '#0a1628', margin: 0 }}>Messages</h2>
      </div>
      {messageable.map(job => {
        const isOpen = openJob === job.id
        const other = viewer === 'customer'
          ? (job.lead_unlocks?.[0]?.fitter ?? job.unlock?.fitter)
          : job.customer
        return (
          <div key={job.id} style={{ borderBottom: '1px solid #f0f2f5' }}>
            <button
              onClick={() => setOpenJob(isOpen ? null : job.id)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0a1628' }}>{job.title}</div>
                {other && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{viewer === 'customer' ? 'Fitter: ' : 'Customer: '}{other.display_name}</div>}
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {isOpen && <MessageThread jobId={job.id} userId={userId} />}
          </div>
        )
      })}
    </div>
  )
}
