'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

export async function createWorkspace(name: string): Promise<{ error: string } | never> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

  const slug = toSlug(name)

  // supabase-js v2.104+ usa PostgrestVersion no tipo — cast até regenerar types/supabase.ts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('workspaces')
    .insert({ name, slug })

  if (error) {
    if (error.code === '23505') {
      return { error: 'Já existe um workspace com esse nome. Escolha outro.' }
    }
    return { error: 'Erro ao criar workspace. Tente novamente.' }
  }

  redirect('/dashboard')
}
