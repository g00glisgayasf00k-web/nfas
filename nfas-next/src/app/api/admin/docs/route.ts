import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const formData  = await req.formData()
  const docId     = formData.get('doc_id')    as string
  const fitterId  = formData.get('fitter_id') as string
  const action    = formData.get('action')    as 'approve' | 'reject'

  const admin = createAdminClient()

  // Update document status
  await admin.from('fitter_documents').update({
    status:      action === 'approve' ? 'approved' : 'rejected',
    reviewed_at: new Date().toISOString(),
    reviewed_by: user.id,
  }).eq('id', docId)

  // If approving, check if all required docs are now approved — if so, verify the fitter
  if (action === 'approve') {
    const { data: docs } = await admin
      .from('fitter_documents')
      .select('doc_type, status')
      .eq('fitter_id', fitterId)

    const required  = ['public_liability', 'dbs']
    const allPassed = required.every(type =>
      docs?.some(d => d.doc_type === type && d.status === 'approved')
    )

    if (allPassed) {
      await admin.from('profiles').update({ is_verified: true }).eq('id', fitterId)
    }
  }

  // Redirect back
  return NextResponse.redirect(new URL('/dashboard/admin?section=documents', req.url))
}
