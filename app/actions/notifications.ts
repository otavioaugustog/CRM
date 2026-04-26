'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/get-workspace-id'
import type { ActivityType, DealStage } from '@/types'

export interface NotificationDeal {
  id: string
  title: string
  due_date: string
  stage: DealStage
  lead_id: string
}

export interface NotificationActivity {
  id: string
  type: ActivityType
  description: string
  created_at: string
  lead_id: string
  lead_name: string
}

export async function fetchUpcomingDeals(): Promise<NotificationDeal[]> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createClient()
  const today = new Date().toISOString().slice(0, 10)
  const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('deals')
    .select('id, title, due_date, stage, lead_id')
    .eq('workspace_id', workspaceId)
    .not('stage', 'eq', 'fechado_ganho')
    .not('stage', 'eq', 'fechado_perdido')
    .gte('due_date', today)
    .lte('due_date', in7Days)
    .order('due_date', { ascending: true })
    .limit(5)

  return (data ?? []) as NotificationDeal[]
}

export async function fetchRecentActivities(): Promise<NotificationActivity[]> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('activities')
    .select('id, type, description, created_at, lead_id, leads(name)')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })
    .limit(5)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((a: any) => ({
    id: a.id,
    type: a.type,
    description: a.description,
    created_at: a.created_at,
    lead_id: a.lead_id,
    lead_name: a.leads?.name ?? 'Lead',
  }))
}
