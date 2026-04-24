'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/get-workspace-id'
import type { Activity, ActivityType } from '@/types'

export async function fetchActivitiesByLead(leadId: string): Promise<Activity[]> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('activities')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  return (data ?? []) as Activity[]
}

export async function createActivity(data: {
  leadId: string
  type: ActivityType
  description: string
}): Promise<{ success: boolean; activity?: Activity; error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { success: false, error: 'Workspace não encontrado' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Não autenticado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: activity, error } = await (supabase as any)
    .from('activities')
    .insert({
      workspace_id: workspaceId,
      lead_id: data.leadId,
      type: data.type,
      description: data.description,
      author_id: user.id,
    })
    .select()
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, activity: activity as Activity }
}
