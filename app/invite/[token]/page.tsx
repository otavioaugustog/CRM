import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Building2, Crown, ShieldCheck, Clock } from 'lucide-react'
import { AcceptButton } from './_components/accept-button'

interface Props {
  params: Promise<{ token: string }>
}

export const metadata = { title: 'Aceitar convite — PipeFlow CRM' }

export default async function InvitePage({ params }: Props) {
  const { token } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/invite/${token}`)
  }

  // Fix Bug 2: usa service client para ler o convite + workspace sem RLS.
  // O RLS de `workspaces` bloquearia quem ainda não é membro.
  const service = createServiceClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invite } = await (service as any)
    .from('workspace_invites')
    .select('*, workspaces(name)')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invite) {
    return <InvalidInvite reason="Convite inválido ou expirado." />
  }

  const userEmail = user.email ?? ''

  if (invite.email.toLowerCase() !== userEmail.toLowerCase()) {
    return (
      <InvalidInvite
        reason={`Este convite é para ${invite.email}. Você está logado como ${userEmail}.`}
        suggestion="Faça login com o e-mail correto para aceitar o convite."
      />
    )
  }

  const workspaceName: string = invite.workspaces?.name ?? 'Workspace'
  const role: 'admin' | 'member' = invite.role

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
            <Building2 className="h-7 w-7 text-primary" />
          </div>

          <h1 className="text-center text-xl font-bold text-foreground">
            Você foi convidado!
          </h1>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Você foi convidado para colaborar em
          </p>
          <p className="mt-1 text-center text-lg font-semibold text-foreground">
            {workspaceName}
          </p>

          <div className="mt-5 flex justify-center">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                role === 'admin' ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
              }`}
            >
              {role === 'admin' ? <Crown className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
              {role === 'admin' ? 'Administrador' : 'Membro'}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Convite válido até{' '}
            {new Date(invite.expires_at).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </div>

          <div className="mt-7">
            <AcceptButton token={token} workspaceId={invite.workspace_id} />
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Ao aceitar, você terá acesso a todos os dados de {workspaceName}.
          </p>
        </div>
      </div>
    </div>
  )
}

function InvalidInvite({ reason, suggestion }: { reason: string; suggestion?: string }) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/15">
          <Building2 className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="text-lg font-bold text-foreground">Convite inválido</h1>
        <p className="mt-2 text-sm text-muted-foreground">{reason}</p>
        {suggestion && <p className="mt-1 text-sm text-muted-foreground/70">{suggestion}</p>}
        <a
          href="/dashboard"
          className="mt-6 inline-block rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Ir para o dashboard
        </a>
      </div>
    </div>
  )
}
