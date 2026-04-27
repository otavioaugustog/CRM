import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function getActiveWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies()
  const fromCookie = cookieStore.get('pipeflow_workspace')?.value
  if (fromCookie) return fromCookie

  const supabase = await createClient()
  const { data } = await supabase
    .from('workspace_members')
    .select('workspace_id')
    .limit(1)
    .single()

  return data?.workspace_id ?? null
}
