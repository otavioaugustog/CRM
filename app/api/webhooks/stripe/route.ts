import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe/client'
import type Stripe from 'stripe'

// Desabilita o body parser do Next.js — Stripe precisa do raw body para validar a assinatura
export const runtime = 'nodejs'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

async function activatePro(
  customerId: string,
  subscriptionId: string,
  workspaceId?: string,
) {
  const supabase = serviceClient()
  const filter = workspaceId
    ? { column: 'id', value: workspaceId }
    : { column: 'stripe_customer_id', value: customerId }

  await supabase
    .from('workspaces')
    .update({
      plan: 'pro',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
    })
    .eq(filter.column, filter.value)
}

async function revertToFree(subscriptionId: string) {
  const supabase = serviceClient()
  await supabase
    .from('workspaces')
    .update({
      plan: 'free',
      stripe_subscription_id: null,
    })
    .eq('stripe_subscription_id', subscriptionId)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      if (session.mode !== 'subscription') break
      await activatePro(
        session.customer as string,
        session.subscription as string,
        session.metadata?.workspace_id,
      )
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await revertToFree(sub.id)
      break
    }
  }

  return NextResponse.json({ received: true })
}
