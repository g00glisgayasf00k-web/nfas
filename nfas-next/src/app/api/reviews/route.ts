import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendReviewReceivedEmail, sendJobCompletedEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { job_id, rating, comment } = await req.json()
  if (!job_id || !rating) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })

  const { data: job } = await supabase
    .from('jobs')
    .select('customer_id, status, title, customer:profiles!jobs_customer_id_fkey(display_name,email)')
    .eq('id', job_id).single()

  if (!job || job.status !== 'closed') return NextResponse.json({ error: 'Job not completed yet' }, { status: 400 })

  const { data: unlock } = await supabase
    .from('lead_unlocks')
    .select('fitter_id, fitter:profiles!lead_unlocks_fitter_id_fkey(display_name,email)')
    .eq('job_id', job_id).single()

  if (!unlock) return NextResponse.json({ error: 'No fitter found for this job' }, { status: 404 })

  const reviewer_role = user.id === job.customer_id ? 'customer' : 'fitter'
  const reviewee_id   = user.id === job.customer_id ? unlock.fitter_id : job.customer_id
  const revieweeInfo  = user.id === job.customer_id ? (unlock as any).fitter : (job as any).customer

  const { error } = await supabase.from('reviews').insert({
    job_id, reviewer_id: user.id, reviewee_id, reviewer_role,
    rating: Number(rating), comment: comment?.trim() || null,
  })

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Already reviewed this job' }, { status: 409 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Email the reviewee (non-blocking)
  if (revieweeInfo?.email && reviewer_role === 'customer') {
    sendReviewReceivedEmail(revieweeInfo.email, {
      fitterName: revieweeInfo.display_name ?? 'there',
      rating:     Number(rating),
      comment:    comment?.trim(),
      jobTitle:   job.title,
    }).catch(console.error)
  }

  return NextResponse.json({ success: true })
}
