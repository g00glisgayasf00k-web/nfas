import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { job_id } = await req.json()
  if (!job_id) return NextResponse.json({ error: 'Missing job_id' }, { status: 400 })

  // Call the DB function which handles credits atomically
  const { data, error } = await supabase.rpc('unlock_lead', {
    p_fitter_id: user.id,
    p_job_id: job_id,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (data?.error) return NextResponse.json({ error: data.error }, { status: 400 })

  return NextResponse.json({ success: true, credits_remaining: data.credits_remaining })
}
