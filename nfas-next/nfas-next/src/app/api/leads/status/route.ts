import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendJobCompletedEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { job_id, fitter_status } = await req.json()
  const allowed = ['contacted', 'booked', 'completed', 'no_response', 'cancelled']
  if (!job_id || !allowed.includes(fitter_status)) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  }

  const { data: unlock } = await supabase
    .from('lead_unlocks')
    .select('id, fitter_status')
    .eq('job_id', job_id).eq('fitter_id', user.id).single()

  if (!unlock) return NextResponse.json({ error: 'Not your lead' }, { status: 403 })

  await supabase
    .from('lead_unlocks')
    .update({ fitter_status })
    .eq('job_id', job_id).eq('fitter_id', user.id)

  if (fitter_status === 'completed') {
    await supabase.rpc('complete_job', { p_fitter_id: user.id, p_job_id: job_id })

    // Email the customer
    const { data: job } = await supabase
      .from('jobs')
      .select('title, customer:profiles!jobs_customer_id_fkey(display_name,email)')
      .eq('id', job_id).single()

    const { data: fitterProfile } = await supabase
      .from('profiles').select('display_name').eq('id', user.id).single()

    const customer = (job as any)?.customer
    if (customer?.email) {
      sendJobCompletedEmail(customer.email, {
        customerName: customer.display_name ?? 'there',
        jobTitle:     job?.title ?? 'Your job',
        jobId:        job_id,
        fitterName:   fitterProfile?.display_name ?? 'Your fitter',
      }).catch(console.error)
    }
  }

  if (unlock.fitter_status === 'completed' && fitter_status !== 'completed') {
    await supabase.from('jobs').update({ status: 'claimed' }).eq('id', job_id)
  }

  return NextResponse.json({ success: true })
}
