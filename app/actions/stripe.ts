'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe/client'
import { getActiveWorkspaceId } from '@/lib/get-workspace-id'

const BILLING_URL = `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`

export async function createCheckoutSession(): Promise<never> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) redirect('/onboarding')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: workspace } = await (supabase as any)
    .from('workspaces')
    .select('stripe_customer_id, plan, name')
    .eq('id', workspaceId)
    .single()

  if (workspace?.plan === 'pro') redirect(BILLING_URL)

  let customerId: string = workspace?.stripe_customer_id ?? ''

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: workspace?.name ?? undefined,
      metadata: { workspace_id: workspaceId },
    })
    customerId = customer.id

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from('workspaces')
      .update({ stripe_customer_id: customerId })
      .eq('id', workspaceId)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID!, quantity: 1 }],
    success_url: `${BILLING_URL}?success=1`,
    cancel_url: `${BILLING_URL}?canceled=1`,
    // metadata da session (checkout.session.completed)
    metadata: { workspace_id: workspaceId, user_id: user.id },
    // metadata da subscription — propagado para invoice.payment_failed
    subscription_data: {
      metadata: { workspace_id: workspaceId, user_id: user.id },
    },
  })

  redirect(session.url!)
}

export async function createPortalSession(): Promise<never> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) redirect('/onboarding')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: workspace } = await (supabase as any)
    .from('workspaces')
    .select('stripe_customer_id')
    .eq('id', workspaceId)
    .single()

  if (!workspace?.stripe_customer_id) redirect(BILLING_URL)

  const session = await stripe.billingPortal.sessions.create({
    customer: workspace.stripe_customer_id,
    return_url: BILLING_URL,
  })

  redirect(session.url)
}
