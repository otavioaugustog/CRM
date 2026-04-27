import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileForm } from './_components/profile-form'
import { PasswordForm } from './_components/password-form'

export const metadata = { title: 'Meu Perfil — PipeFlow CRM' }

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const name: string = user.user_metadata?.name ?? ''
  const email = user.email ?? ''

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Meu Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie suas informações pessoais e senha.</p>
      </div>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-foreground">Dados pessoais</h2>
        <div className="mb-4 space-y-1">
          <p className="text-sm font-medium text-foreground">E-mail</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
        <ProfileForm name={name} />
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-foreground">Segurança</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Para alterar sua senha, confirme a senha atual primeiro.
        </p>
        <PasswordForm />
      </section>
    </div>
  )
}
