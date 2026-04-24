import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { stripe } from '@/lib/stripe/client'
import type Stripe from 'stripe'

// Raw body obrigatório para validação de assinatura do Stripe
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
    .update({ plan: 'free', stripe_subscription_id: null })
    .eq('stripe_subscription_id', subscriptionId)
}

export async function POST(req: NextRequest) {
  // Stripe precisa do raw body para validar a assinatura — nunca usar req.json()
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

      const workspaceId = session.metadata?.workspace_id
      await activatePro(
        session.customer as string,
        session.subscription as string,
        workspaceId,
      )
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await revertToFree(sub.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      // workspace_id e user_id propagados via subscription_data.metadata no checkout
      // snapshot imutável do metadata da subscription no momento de emissão da invoice
      const meta = invoice.parent?.subscription_details?.metadata
      const workspaceId = meta?.workspace_id
      const userId = meta?.user_id

      // Stripe retentará automaticamente — não rebaixamos o plano aqui.
      // O plano só volta a 'free' quando customer.subscription.deleted for emitido.

      console.error('[stripe] invoice.payment_failed', {
        invoiceId: invoice.id,
        workspaceId,
        userId,
        amountDue: invoice.amount_due,
      })
      break
    }
  }

  return NextResponse.json({ received: true })
}
