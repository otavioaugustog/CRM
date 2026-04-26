'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/get-workspace-id'
import type { Workspace, WorkspaceMemberRole } from '@/types'

function toSlug(name: string): string {
  // eslint-disable-next-line no-control-regex
  const diacritics = /[̀-ͯ]/g
  return (
    name
      .toLowerCase()
      .normalize('NFD')
      .replace(diacritics, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'workspace'
  )
}

export async function createWorkspace(name: string): Promise<{ error: string } | { workspace: Workspace }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

  const slug = toSlug(name)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('workspaces')
    .insert({ name, slug })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { error: 'Já existe um workspace com esse nome. Escolha outro.' }
    }
    return { error: 'Erro ao criar workspace. Tente novamente.' }
  }

  return { workspace: data as Workspace }
}

export async function fetchCurrentWorkspace(): Promise<Workspace | null> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return null

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single()

  return (data as Workspace) ?? null
}

export async function updateWorkspace(
  name: string,
  slug: string
): Promise<{ error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: 'Workspace não encontrado.' }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('workspaces')
    .update({ name, slug })
    .eq('id', workspaceId)

  if (error) {
    if (error.code === '23505') return { error: 'Esse slug já está em uso. Escolha outro.' }
    return { error: 'Erro ao salvar. Tente novamente.' }
  }

  return {}
}

export interface WorkspaceMemberWithProfile {
  id: string
  workspace_id: string
  user_id: string
  role: WorkspaceMemberRole
  created_at: string
  email: string
  full_name: string
}

export async function fetchWorkspaceMembers(): Promise<WorkspaceMemberWithProfile[]> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .rpc('get_workspace_members_with_profile', { p_workspace_id: workspaceId })

  if (error) return []
  return (data ?? []) as WorkspaceMemberWithProfile[]
}

export async function removeMember(membershipId: string): Promise<{ error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: 'Workspace não encontrado.' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: target } = await (supabase as any)
    .from('workspace_members')
    .select('user_id')
    .eq('id', membershipId)
    .eq('workspace_id', workspaceId)
    .single()

  if (!target) return { error: 'Membro não encontrado.' }
  if (target.user_id === user.id) return { error: 'Você não pode remover a si mesmo.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('workspace_members')
    .delete()
    .eq('id', membershipId)
    .eq('workspace_id', workspaceId)

  if (error) {
    console.error('[removeMember] error:', error, { membershipId, workspaceId })
    return { error: 'Erro ao remover membro.' }
  }
  return {}
}

export interface WorkspaceInvite {
  id: string
  workspace_id: string
  email: string
  role: WorkspaceMemberRole
  token: string
  invited_by: string | null
  expires_at: string
  accepted_at: string | null
  created_at: string
}

export async function fetchPendingInvites(): Promise<WorkspaceInvite[]> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return []

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('workspace_invites')
    .select('*')
    .eq('workspace_id', workspaceId)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })

  return (data ?? []) as WorkspaceInvite[]
}

export async function cancelInvite(inviteId: string): Promise<{ error?: string }> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return { error: 'Workspace não encontrado.' }

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('workspace_invites')
    .delete()
    .eq('id', inviteId)
    .eq('workspace_id', workspaceId)

  if (error) return { error: 'Erro ao cancelar convite.' }
  return {}
}

export async function getUserRole(): Promise<WorkspaceMemberRole | null> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return null

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  return (data?.role as WorkspaceMemberRole) ?? null
}

export async function getMemberCount(): Promise<number> {
  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) return 0

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { count } = await (supabase as any)
    .from('workspace_members')
    .select('id', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId)

  return count ?? 0
}
