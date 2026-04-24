import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Cliente com service role — ignora RLS completamente.
// Usar APENAS em Server Components / Route Handlers, nunca no cliente.
export function createServiceClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
