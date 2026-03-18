import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'fitter') return NextResponse.json({ error: 'Only fitters can upload documents' }, { status: 403 })

  const formData = await req.formData()
  const file     = formData.get('file') as File
  const docType  = formData.get('doc_type') as string

  const validTypes = ['public_liability', 'dbs', 'driving_licence', 'photo']
  if (!file || !validTypes.includes(docType)) {
    return NextResponse.json({ error: 'Invalid file or document type' }, { status: 400 })
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
  }

  const ext  = file.name.split('.').pop() ?? 'pdf'
  const path = `fitters/${user.id}/${docType}_${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('fitter-documents')
    .upload(path, file, { upsert: false, contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  // Upsert doc record (replace previous submission of same type)
  const { error: dbError } = await supabase.from('fitter_documents').upsert({
    fitter_id:    user.id,
    doc_type:     docType,
    storage_path: path,
    status:       'pending',
    reviewed_at:  null,
    reviewed_by:  null,
    notes:        null,
  }, { onConflict: 'fitter_id,doc_type' })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  return NextResponse.json({ success: true, path })
}
