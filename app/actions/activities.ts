'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/get-workspace-id'
import type { Activity } from '@/types'

const createActivitySchema = z.object({
  leadId: z.string().uuid(),
  type: z.enum(['call', 'email', 'meeting', 'note']),
  description: z.string().min(1).max(2000),
})

export async function fetchActivitiesByLead(leadId: string): Promise<Activity[]> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('activities')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false })

  if (error) console.error('[fetchActivitiesByLead]', error)
  return (data ?? []) as Activity[]
}

export async function createActivity(
  input: z.infer<typeof createActivitySchema>
): Promise<{ success: boolean; activity?: Activity; error?: string }> {
  const parsed = createActivitySchema.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Dados inválidos' }
  const data = parsed.data

  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) return { success: false, error: 'Não autenticado' }
  const user = authData.user

  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { success: false, error: 'Workspace não encontrado' }

  // Verifica que o lead pertence ao workspace do usuário (evita IDOR)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: lead } = await (supabase as any)
    .from('leads')
    .select('id')
    .eq('id', data.leadId)
    .eq('workspace_id', workspaceId)
    .single()

  if (!lead) return { success: false, error: 'Lead não encontrado' }

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

export async function deleteActivity(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData.user) return { success: false, error: 'Não autenticado' }
  const user = authData.user

  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { success: false, error: 'Workspace não encontrado' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('activities')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id)
    .eq('workspace_id', workspaceId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
