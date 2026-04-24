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
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Planos e cobrança</h1>
        <p className="mt-1 text-sm text-slate-500">Gerencie seu plano de assinatura.</p>
      </div>

      {/* Status atual */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Plano atual</h2>
        <div className="flex items-start gap-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isPro ? 'bg-indigo-100' : 'bg-slate-100'}`}>
            {isPro ? (
              <Zap className="h-5 w-5 text-indigo-600" />
            ) : (
              <BarChart3 className="h-5 w-5 text-slate-500" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-slate-900">
              {isPro ? 'Pro' : 'Free'}
            </p>
            <p className="text-sm text-slate-500">
              {isPro ? 'R$49/mês · Recursos ilimitados' : 'Grátis · Limites de membros e leads'}
            </p>
          </div>
        </div>

        {/* Uso do plano Free */}
        {!isPro && (
          <div className="mt-5 space-y-3">
            <UsageMeter
              icon={<Users className="h-4 w-4" />}
              label="Colaboradores"
              current={memberCount}
              max={2}
            />
            <UsageMeter
              icon={<Mail className="h-4 w-4" />}
              label="Leads"
              current={0}
              max={50}
              note="Conectado ao Supabase em M5"
            />
          </div>
        )}
      </section>

      {/* Cards de planos */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Free */}
        <div className={`rounded-xl border p-5 ${!isPro ? 'border-indigo-200 bg-indigo-50/30 ring-1 ring-indigo-200' : 'border-slate-200 bg-white'}`}>
          <div className="mb-4">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Free</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">R$0</p>
            <p className="text-xs text-slate-500">para sempre</p>
          </div>
          <ul className="space-y-2">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                {f}
              </li>
            ))}
          </ul>
          {!isPro && (
            <div className="mt-5 rounded-lg bg-indigo-100 px-3 py-2 text-center text-xs font-medium text-indigo-700">
              Plano atual
            </div>
          )}
        </div>

        {/* Pro */}
        <div className={`rounded-xl border p-5 ${isPro ? 'border-indigo-200 bg-indigo-50/30 ring-1 ring-indigo-200' : 'border-slate-200 bg-white'}`}>
          <div className="mb-4">
            <p className="text-sm font-medium text-indigo-600 uppercase tracking-wide">Pro</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">R$49</p>
            <p className="text-xs text-slate-500">por mês</p>
          </div>
          <ul className="space-y-2">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-500" />
                {f}
              </li>
            ))}
          </ul>
          {isPro ? (
            <div className="mt-5 rounded-lg bg-indigo-100 px-3 py-2 text-center text-xs font-medium text-indigo-700">
              Plano atual
            </div>
          ) : (
            <button
              disabled
              className="mt-5 w-full rounded-lg bg-indigo-600 py-2 text-sm font-medium text-white opacity-60 cursor-not-allowed"
              title="Integração Stripe disponível em breve"
            >
              Fazer upgrade — em breve
            </button>
          )}
        </div>
      </div>

      {!isPro && (
        <p className="text-center text-xs text-slate-400">
          Integração de pagamento via Stripe será ativada em breve.
        </p>
      )}
    </div>
  )
}

function UsageMeter({
  icon,
  label,
  current,
  max,
  note,
}: {
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
        <span className="flex items-center gap-1 text-slate-600">
          {icon}
          {label}
          {note && <span className="text-slate-400">({note})</span>}
        </span>
        <span className={nearLimit ? 'text-amber-600 font-medium' : 'text-slate-500'}>
          {current}/{max}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${nearLimit ? 'bg-amber-500' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
