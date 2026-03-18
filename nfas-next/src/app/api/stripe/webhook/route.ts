import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendNewLeadEmail } from '@/lib/email'
import { formatPriceDecimal } from '@/lib/utils'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: NextRequest) {
  const body      = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session  = event.data.object as Stripe.Checkout.Session
  const { user_id, pack_id, credits } = session.metadata ?? {}
  if (!user_id || !pack_id || !credits) {
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
  }

  const admin  = createAdminClient()
  const amount = parseInt(credits, 10)

  const { data: current } = await admin.from('profiles').select('credits').eq('id', user_id).single()
  await admin.from('profiles').update({ credits: (current?.credits ?? 0) + amount }).eq('id', user_id)

  await admin.from('credit_transactions').insert({
    fitter_id: user_id, amount, reason: 'pack_purchase',
    stripe_payment_intent: session.payment_intent as string,
  })

  return NextResponse.json({ received: true })
}
