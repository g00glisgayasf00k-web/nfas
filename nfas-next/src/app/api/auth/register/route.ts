import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeCustomerEmail, sendWelcomeFitterEmail } from '@/lib/email'

// Called after client-side signUp to send the welcome email
// The client already called supabase.auth.signUp — this just handles the email
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, role, email')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  try {
    if (profile.role === 'fitter') {
      await sendWelcomeFitterEmail(profile.email, { name: profile.display_name?.split(' ')[0] ?? 'there' })
    } else if (profile.role === 'customer' || profile.role === 'affiliate') {
      await sendWelcomeCustomerEmail(profile.email, { name: profile.display_name?.split(' ')[0] ?? 'there' })
    }
  } catch (e) {
    // Non-blocking — don't fail registration if email fails
    console.error('Welcome email failed:', e)
  }

  return NextResponse.json({ success: true })
}
