import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const path = req.nextUrl.searchParams.get('path')
  if (!path) return NextResponse.json({ error: 'Missing path' }, { status: 400 })

  const admin = createAdminClient()
  const { data, error } = await admin.storage
    .from('fitter-documents')
    .createSignedUrl(path, 300) // 5 minute expiry

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: 'Could not generate URL' }, { status: 500 })
  }

  return NextResponse.redirect(data.signedUrl)
}
