import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function getActiveWorkspaceId(): Promise<string | null> {
  const cookieStore = await cookies()
  const fromCookie = cookieStore.get('pipeflow_workspace')?.value
  if (fromCookie) return fromCookie

  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from('workspaces')
    .select('id')
    .limit(1)
    .single()

  return data?.id ?? null
}
