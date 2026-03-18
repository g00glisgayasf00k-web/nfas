'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Msg {
  id: string
  sender_id: string
  body: string
  created_at: string
  sender?: { display_name: string }
}

export function MessageThread({ jobId, userId }: { jobId: string; userId: string }) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput]       = useState('')
  const [sending, setSending]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase  = createClient()

  const scrollBottom = () => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(display_name)')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true })
    setMessages(data ?? [])
    setLoading(false)
    // mark read
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('job_id', jobId).eq('receiver_id', userId).is('read_at', null)
  }, [jobId, userId])

  useEffect(() => {
    load().then(() => setTimeout(scrollBottom, 50))

    const channel = supabase
      .channel(`msg:${jobId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `job_id=eq.${jobId}` },
        async (payload) => {
          const { data: sender } = await supabase.from('profiles').select('display_name').eq('id', payload.new.sender_id).single()
          setMessages(prev => [...prev, { ...payload.new as Msg, sender: sender ?? undefined }])
          setTimeout(scrollBottom, 50)
        })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [jobId, load])

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

  return (
    <div style={{ background: '#f8fafc' }}>
      <div ref={scrollRef} style={{ height: 260, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', padding: '20px 0' }}>Loading…</p>}
        {!loading && !messages.length && <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', padding: '20px 0' }}>No messages yet — say hello!</p>}
        {messages.map(m => {
          const mine = m.sender_id === userId
          return (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: mine ? 'flex-end' : 'flex-start' }}>
              <div style={{ maxWidth: '76%', padding: '9px 13px', borderRadius: 12, borderBottomRightRadius: mine ? 3 : 12, borderBottomLeftRadius: mine ? 12 : 3, background: mine ? '#0a1628' : '#fff', color: mine ? '#fff' : '#0a1628', fontSize: 13, lineHeight: 1.55, border: mine ? 'none' : '1px solid #e2e8f0' }}>
                {m.body}
              </div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 3, paddingLeft: mine ? 0 : 4, paddingRight: mine ? 4 : 0 }}>
                {mine ? 'You' : m.sender?.display_name} · {new Date(m.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
        <textarea
          value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Type a message… (Enter to send)"
          rows={2}
          style={{ flex: 1, padding: '10px 14px', border: 'none', resize: 'none', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
        />
        <button onClick={send} disabled={!input.trim() || sending}
          style={{ padding: '0 18px', background: '#0a1628', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0, opacity: !input.trim() ? 0.4 : 1, transition: 'opacity 0.15s' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
