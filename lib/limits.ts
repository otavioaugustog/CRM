import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/get-workspace-id'
import { FREE_LIMITS } from '@/lib/plan-config'

async function getWorkspaceContext(table: 'leads' | 'workspace_members') {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { plan: 'free' as string, count: 0 }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any
  const [planRes, countRes] = await Promise.all([
    supabase.from('workspaces').select('plan').eq('id', workspaceId).single(),
    supabase.from(table).select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
  ])

  return {
    plan: (planRes.data?.plan as string) ?? 'free',
    count: (countRes.count as number) ?? 0,
  }
}

export async function canAddLead(): Promise<boolean> {
  const { plan, count } = await getWorkspaceContext('leads')
  return plan === 'pro' || count < FREE_LIMITS.leads
}

export async function canAddMember(): Promise<boolean> {
  const { plan, count } = await getWorkspaceContext('workspace_members')
  return plan === 'pro' || count < FREE_LIMITS.members
}
