import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendMessageNotificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { job_id, body } = await req.json()
  if (!job_id || !body?.trim()) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const { data: job } = await supabase
    .from('jobs')
    .select('customer_id, title, customer:profiles!jobs_customer_id_fkey(display_name,email)')
    .eq('id', job_id).single()

  const { data: unlock } = await supabase
    .from('lead_unlocks')
    .select('fitter_id, fitter:profiles!lead_unlocks_fitter_id_fkey(display_name,email)')
    .eq('job_id', job_id).single()

  if (!job || !unlock) return NextResponse.json({ error: 'Job not found or not unlocked' }, { status: 404 })

  const receiver_id   = user.id === job.customer_id ? unlock.fitter_id : job.customer_id
  const receiverInfo  = user.id === job.customer_id ? (unlock as any).fitter : (job as any).customer
  const senderInfo    = user.id === job.customer_id ? (job as any).customer : (unlock as any).fitter

  const { error } = await supabase.from('messages').insert({
    job_id, sender_id: user.id, receiver_id, body: body.trim(),
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fire notification email (non-blocking)
  if (receiverInfo?.email) {
    sendMessageNotificationEmail(receiverInfo.email, {
      recipientName:   receiverInfo.display_name ?? 'there',
      senderName:      senderInfo?.display_name ?? 'Someone',
      jobTitle:        job.title,
      messagePreview:  body.trim(),
      jobId:           job_id,
    }).catch(console.error)
  }

  return NextResponse.json({ success: true })
}
