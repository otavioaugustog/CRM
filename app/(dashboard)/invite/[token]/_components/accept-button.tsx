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

    // Persiste o workspace aceito no cookie e redireciona
    document.cookie = `pipeflow_workspace=${workspaceId}; path=/; max-age=${60 * 60 * 24 * 30}`
    toast.success('Convite aceito! Redirecionando…')
    router.push('/dashboard')
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
