'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const nameSchema = z.string().min(2).max(80).trim()
const passwordSchema = z.string().min(8).max(128)

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function updateProfile(name: string): Promise<{ error?: string }> {
  const parsed = nameSchema.safeParse(name)
  if (!parsed.success) return { error: 'Nome inválido.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ data: { name: parsed.data } })
  if (error) return { error: error.message }
  revalidatePath('/', 'layout')
  return {}
}

export async function updatePassword(newPassword: string): Promise<{ error?: string }> {
  const parsed = passwordSchema.safeParse(newPassword)
  if (!parsed.success) return { error: 'Senha deve ter entre 8 e 128 caracteres.' }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Sessão expirada. Faça login novamente.' }

  const { error } = await supabase.auth.updateUser({ password: parsed.data })
  if (error) return { error: error.message }
  return {}
}
