'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { UserPlus, Trash2, Clock, X, Crown, ShieldCheck } from 'lucide-react'
import { removeMember, cancelInvite } from '@/app/actions/workspace'
import type { WorkspaceMemberWithProfile, WorkspaceInvite } from '@/app/actions/workspace'

const MAX_FREE_MEMBERS = 2

interface MembersSectionProps {
  members: WorkspaceMemberWithProfile[]
  pendingInvites: WorkspaceInvite[]
  currentUserId: string
  isAdmin: boolean
  plan: 'free' | 'pro'
}

export function MembersSection({
  members,
  pendingInvites,
  currentUserId,
  isAdmin,
  plan,
}: MembersSectionProps) {
  const router = useRouter()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [sending, setSending] = useState(false)
  const [removing, startRemove] = useTransition()
  const [cancelling, startCancel] = useTransition()

  const atLimit = plan === 'free' && members.length >= MAX_FREE_MEMBERS

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)

    const res = await fetch('/api/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    })

    const body = await res.json()
    setSending(false)

    if (!res.ok) {
      if (body.limitReached) {
        toast.error('Limite do plano Free atingido. Faça upgrade para Pro.')
      } else {
        toast.error(body.error ?? 'Erro ao enviar convite.')
      }
      return
    }

    if (body.warning) {
      toast.warning(body.warning)
    } else {
      toast.success(`Convite enviado para ${email}.`)
    }

    setEmail('')
    setRole('member')
    setInviteOpen(false)
    router.refresh()
  }

  function handleRemove(membershipId: string) {
    startRemove(async () => {
      const result = await removeMember(membershipId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Membro removido.')
        router.refresh()
      }
    })
  }

  function handleCancelInvite(inviteId: string) {
    startCancel(async () => {
      const result = await cancelInvite(inviteId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Convite cancelado.')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Membros{' '}
            <span className="text-sm font-normal text-slate-500">
              ({members.length}{plan === 'free' ? `/${MAX_FREE_MEMBERS}` : ''})
            </span>
          </h2>
          {atLimit && (
            <p className="mt-0.5 text-xs text-amber-600">
              Limite do plano Free atingido.{' '}
              <a href="/settings/billing" className="underline underline-offset-2">
                Faça upgrade para Pro
              </a>{' '}
              para convidar mais membros.
            </p>
          )}
        </div>

        {isAdmin && (
          <button
            onClick={() => setInviteOpen(true)}
            disabled={atLimit}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            Convidar
          </button>
        )}
      </div>

      {/* Tabela de membros */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3 text-left font-medium text-slate-600">Membro</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Papel</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600 hidden sm:table-cell">Desde</th>
              {isAdmin && <th className="px-4 py-3" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                      {getInitials(m.full_name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {m.full_name}
                        {m.user_id === currentUserId && (
                          <span className="ml-1.5 text-xs text-slate-400">(você)</span>
                        )}
                      </p>
                      <p className="truncate text-xs text-slate-500">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={m.role as 'admin' | 'member'} />
                </td>
                <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
                  {formatDate(m.created_at)}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    {m.user_id !== currentUserId && (
                      <button
                        onClick={() => handleRemove(m.id)}
                        disabled={removing}
                        className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
                        title="Remover membro"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Convites pendentes */}
      {pendingInvites.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-600">Convites pendentes</h3>
          <div className="space-y-2">
            {pendingInvites.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-700">{inv.email}</p>
                    <p className="text-xs text-slate-500">
                      <RoleBadge role={inv.role as 'admin' | 'member'} inline /> · expira{' '}
                      {formatDate(inv.expires_at)}
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleCancelInvite(inv.id)}
                    disabled={cancelling}
                    className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500 disabled:opacity-50"
                    title="Cancelar convite"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dialog de convite */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">Convidar membro</h3>
              <button
                onClick={() => setInviteOpen(false)}
                className="rounded p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="invite-email">
                  E-mail
                </label>
                <input
                  id="invite-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colaborador@empresa.com"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="invite-role">
                  Papel
                </label>
                <select
                  id="invite-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'member')}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="member">Membro — acesso a leads e pipeline</option>
                  <option value="admin">Administrador — acesso total + configurações</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {sending ? 'Enviando…' : 'Enviar convite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function RoleBadge({ role, inline }: { role: 'admin' | 'member'; inline?: boolean }) {
  if (role === 'admin') {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 ${inline ? '' : ''}`}
      >
        <Crown className="h-3 w-3" />
        Admin
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
      <ShieldCheck className="h-3 w-3" />
      Membro
    </span>
  )
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}
