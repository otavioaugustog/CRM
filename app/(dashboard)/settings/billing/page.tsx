import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchCurrentWorkspace, getMemberCount } from '@/app/actions/workspace'
import { CheckCircle2, Zap, Users, BarChart3, Mail } from 'lucide-react'

export const metadata = { title: 'Planos e Cobrança — PipeFlow CRM' }

const FREE_FEATURES = [
  'Até 2 colaboradores',
  'Até 50 leads',
  'Pipeline Kanban',
  'Dashboard básico',
]

const PRO_FEATURES = [
  'Colaboradores ilimitados',
  'Leads ilimitados',
  'Pipeline Kanban',
  'Dashboard completo',
  'Convites por e-mail',
  'Suporte prioritário',
]

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [workspace, memberCount] = await Promise.all([
    fetchCurrentWorkspace(),
    getMemberCount(),
  ])

  if (!workspace) redirect('/onboarding')

  const isPro = workspace.plan === 'pro'

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Planos e cobrança</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gerencie seu plano de assinatura.</p>
      </div>

      {/* Status atual */}
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-foreground">Plano atual</h2>
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isPro ? 'bg-primary/15' : 'bg-muted'}`}>
            {isPro
              ? <Zap className="h-5 w-5 text-primary" />
              : <BarChart3 className="h-5 w-5 text-muted-foreground" />}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{isPro ? 'Pro' : 'Free'}</p>
            <p className="text-sm text-muted-foreground">
              {isPro ? 'R$49/mês · Recursos ilimitados' : 'Grátis · Limites de membros e leads'}
            </p>
          </div>
        </div>

        {!isPro && (
          <div className="mt-5 space-y-3">
            <UsageMeter icon={<Users className="h-4 w-4" />} label="Colaboradores" current={memberCount} max={2} />
            <UsageMeter icon={<Mail className="h-4 w-4" />} label="Leads" current={0} max={50} note="conectado no M5" />
          </div>
        )}
      </section>

      {/* Cards de planos */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={`rounded-xl border p-5 ${!isPro ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-card'}`}>
          <div className="mb-4">
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Free</p>
            <p className="mt-1 text-2xl font-bold text-foreground">R$0</p>
            <p className="text-xs text-muted-foreground">para sempre</p>
          </div>
          <ul className="space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                {f}
              </li>
            ))}
          </ul>
          {!isPro && (
            <div className="mt-5 rounded-lg bg-primary/10 px-3 py-2 text-center text-xs font-medium text-primary">
              Plano atual
            </div>
          )}
        </div>

        <div className={`rounded-xl border p-5 ${isPro ? 'border-primary/40 bg-primary/5 ring-1 ring-primary/30' : 'border-border bg-card'}`}>
          <div className="mb-4">
            <p className="text-sm font-medium uppercase tracking-wide text-primary">Pro</p>
            <p className="mt-1 text-2xl font-bold text-foreground">R$49</p>
            <p className="text-xs text-muted-foreground">por mês</p>
          </div>
          <ul className="space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                {f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <div className="mt-5 rounded-lg bg-primary/10 px-3 py-2 text-center text-xs font-medium text-primary">
              Plano atual
            </div>
          ) : (
            <button
              disabled
              className="mt-5 w-full rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground opacity-50 cursor-not-allowed"
              title="Integração Stripe disponível em breve"
            >
              Fazer upgrade — em breve
            </button>
          )}
        </div>
      </div>

      {!isPro && (
        <p className="text-center text-xs text-muted-foreground">
          Integração de pagamento via Stripe será ativada em breve.
        </p>
      )}
    </div>
  )
}

function UsageMeter({ icon, label, current, max, note }: {
  icon: React.ReactNode
  label: string
  current: number
  max: number
  note?: string
}) {
  const pct = Math.min(100, Math.round((current / max) * 100))
  const nearLimit = pct >= 80

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          {icon}{label}
          {note && <span className="text-muted-foreground/60">({note})</span>}
        </span>
        <span className={nearLimit ? 'font-medium text-amber-500' : 'text-muted-foreground'}>
          {current}/{max}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${nearLimit ? 'bg-amber-500' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
