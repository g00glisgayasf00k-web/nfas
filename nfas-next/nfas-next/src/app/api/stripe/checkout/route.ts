import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

  const { data: profile } = await supabase.from('profiles').select('role, email').eq('id', user.id).single()
  if (profile?.role !== 'fitter') return NextResponse.json({ error: 'Only fitters can buy credits' }, { status: 403 })

  const { pack_id } = await req.json()
  if (!pack_id) return NextResponse.json({ error: 'Missing pack_id' }, { status: 400 })

  const { data: pack } = await supabase.from('credit_packs').select('*').eq('id', pack_id).eq('is_active', true).single()
  if (!pack) return NextResponse.json({ error: 'Pack not found' }, { status: 404 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  const session = await stripe.checkout.sessions.create({
    mode:               'payment',
    customer_email:     profile.email,
    line_items: [{
      price_data: {
        currency:     'gbp',
        unit_amount:  pack.price_pence,
        product_data: {
          name:        `${pack.name} — ${pack.credits} Credits`,
          description: `${pack.credits} lead unlock credits for National Flatpack Assembly Service`,
        },
      },
      quantity: 1,
    }],
    metadata: {
      user_id:  user.id,
      pack_id:  pack.id,
      credits:  String(pack.credits),
    },
    success_url: `${appUrl}/dashboard/fitter?section=credits&payment=success`,
    cancel_url:  `${appUrl}/dashboard/fitter?section=credits&payment=cancelled`,
  })

  return NextResponse.json({ url: session.url })
}
