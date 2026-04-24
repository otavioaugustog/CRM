'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/get-workspace-id'
import { canAddLead, FREE_LIMITS } from '@/lib/limits'
import type { Lead, LeadStatus } from '@/types'

export async function fetchLeads(search?: string, status?: string): Promise<Lead[]> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from('leads')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (status && status !== 'todos') {
    query = query.eq('status', status)
  }

  if (search?.trim()) {
    // Remove vírgulas — são separadores no PostgREST .or() e quebrariam o filtro
    const q = search.trim().replace(/,/g, '')
    query = query.or(`name.ilike.%${q}%,company.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data } = await query
  return (data ?? []) as Lead[]
}

export async function fetchLeadById(id: string): Promise<Lead | null> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return null

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('leads')
    .select('*')
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .single()

  return (data as Lead) ?? null
}

export async function fetchLeadLimitStatus(): Promise<{
  isPro: boolean
  count: number
  max: number
}> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { isPro: false, count: 0, max: FREE_LIMITS.leads }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any
  const [planRes, countRes] = await Promise.all([
    supabase.from('workspaces').select('plan').eq('id', workspaceId).single(),
    supabase.from('leads').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
  ])

  const isPro = planRes.data?.plan === 'pro'
  return { isPro, count: (countRes.count as number) ?? 0, max: FREE_LIMITS.leads }
}

export async function createLead(input: {
  name: string
  email: string
  phone?: string
  company?: string
  role?: string
  status: LeadStatus
}): Promise<{ lead?: Lead; error?: string; limitReached?: boolean }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: 'Workspace não encontrado.' }

  const allowed = await canAddLead()
  if (!allowed) return { limitReached: true }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('leads')
    .insert({ workspace_id: workspaceId, owner_id: user.id, ...input })
    .select()
    .single()

  if (error) return { error: 'Erro ao criar lead. Tente novamente.' }
  return { lead: data as Lead }
}

export async function updateLead(
  id: string,
  input: Partial<{
    name: string
    email: string
    phone: string
    company: string
    role: string
    status: LeadStatus
  }>
): Promise<{ lead?: Lead; error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: 'Workspace não encontrado.' }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('leads')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('workspace_id', workspaceId)
    .select()
    .single()

  if (error) return { error: 'Erro ao atualizar lead. Tente novamente.' }
  return { lead: data as Lead }
}

export async function deleteLead(id: string): Promise<{ error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: 'Workspace não encontrado.' }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('leads')
    .delete()
    .eq('id', id)
    .eq('workspace_id', workspaceId)

  if (error) return { error: 'Erro ao excluir lead. Tente novamente.' }
  return {}
}
