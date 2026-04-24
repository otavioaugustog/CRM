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
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>
        <p className="mt-1 text-sm text-slate-500">Gerencie seu workspace e colaboradores.</p>
      </div>

      {/* Workspace */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Informações do workspace</h2>
        <WorkspaceSettingsForm
          name={workspace.name}
          slug={workspace.slug}
          isAdmin={isAdmin}
        />
      </section>

      {/* Membros */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <MembersSection
          members={members}
          pendingInvites={pendingInvites}
          currentUserId={user.id}
          isAdmin={isAdmin}
          plan={workspace.plan}
        />
      </section>

      {/* Link para billing */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Plano</h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Plano atual:{' '}
              <span className={workspace.plan === 'pro' ? 'font-semibold text-indigo-600' : 'font-semibold'}>
                {workspace.plan === 'pro' ? 'Pro' : 'Free'}
              </span>
            </p>
          </div>
          <a
            href="/settings/billing"
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Ver detalhes
          </a>
        </div>
      </section>
    </div>
  )
}
