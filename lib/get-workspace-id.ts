import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function getActiveWorkspaceId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const cookieStore = await cookies()
  const fromCookie = cookieStore.get('pipeflow_workspace')?.value

  if (fromCookie) {
    // Validate that the authenticated user is actually a member of this workspace
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: membership } = await (supabase as any)
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', fromCookie)
      .eq('user_id', user.id)
      .single()

    if (membership) return fromCookie
  }

  // Fallback: resolve via membership table, not workspaces directly
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('workspace_members')
    .select('workspace_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  return data?.workspace_id ?? null
}
