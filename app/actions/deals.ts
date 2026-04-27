'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/get-workspace-id'
import type { Deal, DealStage } from '@/types'

export async function fetchDeals(): Promise<{ deals: Deal[]; error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { deals: [], error: 'Workspace não encontrado.' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('deals')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) return { deals: [], error: 'Erro ao carregar negócios.' }
  return { deals: (data ?? []) as Deal[] }
}

export async function createDeal(input: {
  title: string
  lead_id: string
  stage: DealStage
  value: number
  due_date?: string
}): Promise<{ deal?: Deal; error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: 'Workspace não encontrado.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

  const { data, error } = await supabase
    .from('deals')
    .insert({ workspace_id: workspaceId, owner_id: user.id, ...input })
    .select()
    .single()

  if (error) return { error: 'Erro ao criar negócio. Tente novamente.' }
  return { deal: data as Deal }
}

export async function updateDeal(
  id: string,
  input: {
    title?: string
    lead_id?: string
    stage?: DealStage
    value?: number
    due_date?: string | null
  }
): Promise<{ deal?: Deal; error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: 'Workspace não encontrado.' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('deals')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .select()
    .single()

  if (error) return { error: 'Erro ao atualizar negócio.' }
  return { deal: data as Deal }
}

export async function moveDeal(
  id: string,
  stage: DealStage
): Promise<{ error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: 'Workspace não encontrado.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('deals')
    .update({ stage, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) return { error: 'Erro ao mover negócio.' }
  return {}
}

export async function deleteDeal(id: string): Promise<{ error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: 'Workspace não encontrado.' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) return { error: 'Erro ao excluir negócio.' }
  return {}
}
