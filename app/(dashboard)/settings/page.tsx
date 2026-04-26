import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  fetchCurrentWorkspace,
  fetchWorkspaceMembers,
  fetchPendingInvites,
  getUserRole,
} from '@/app/actions/workspace'
import { WorkspaceSettingsForm } from './_components/workspace-settings-form'
import { MembersSection } from './_components/members-section'
import { DeleteWorkspaceDialog } from './_components/delete-workspace-dialog'

export const metadata = { title: 'Configurações — PipeFlow CRM' }

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [workspace, members, pendingInvites, role] = await Promise.all([
    fetchCurrentWorkspace(),
    fetchWorkspaceMembers(),
    fetchPendingInvites(),
    getUserRole(),
  ])

  if (!workspace) redirect('/onboarding')

  const isAdmin = role === 'admin'

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie seu workspace e colaboradores.</p>
      </div>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-foreground">Informações do workspace</h2>
        <WorkspaceSettingsForm name={workspace.name} slug={workspace.slug} isAdmin={isAdmin} />
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <MembersSection
          members={members}
          pendingInvites={pendingInvites}
          currentUserId={user.id}
          isAdmin={isAdmin}
          plan={workspace.plan}
        />
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Plano</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Plano atual:{' '}
              <span className={workspace.plan === 'pro' ? 'font-semibold text-primary' : 'font-semibold text-foreground'}>
                {workspace.plan === 'pro' ? 'Pro' : 'Free'}
              </span>
            </p>
          </div>
          <a
            href="/settings/billing"
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Ver detalhes
          </a>
        </div>
      </section>

      {isAdmin && (
        <section className="rounded-xl border border-destructive/30 bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-destructive">Zona de perigo</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Excluir o workspace remove permanentemente todos os leads, negócios, atividades e membros.
            Esta ação não pode ser desfeita.
          </p>
          <DeleteWorkspaceDialog workspaceName={workspace.name} />
        </section>
      )}
    </div>
  )
}
