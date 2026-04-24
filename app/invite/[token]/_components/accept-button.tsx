'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface AcceptButtonProps {
  token: string
  workspaceId: string
}

export function AcceptButton({ token, workspaceId }: AcceptButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleAccept() {
    setLoading(true)
    const supabase = createClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc('accept_workspace_invite', {
      p_token: token,
    })

    if (error || data?.error) {
      toast.error(data?.error ?? error?.message ?? 'Erro ao aceitar convite.')
      setLoading(false)
      return
    }

    // Persiste o workspace no cookie (30 dias) e força reload completo
    // para que o WorkspaceSwitcher e o layout busquem os dados atualizados
    document.cookie = `pipeflow_workspace=${workspaceId}; path=/; max-age=${60 * 60 * 24 * 30}`
    toast.success('Convite aceito! Redirecionando…')
    // Fix Bug 3: router.push + refresh para invalidar cache do Server Component
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? 'Aceitando…' : 'Aceitar convite e entrar'}
    </button>
  )
}
