import Link from "next/link";
import { Check, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const FREE_FEATURES = [
  { text: "Até 2 colaboradores", included: true },
  { text: "Até 50 leads", included: true },
  { text: "Pipeline Kanban", included: true },
  { text: "Dashboard básico", included: true },
  { text: "Linha do tempo de atividades", included: true },
  { text: "Workspaces ilimitados", included: false },
  { text: "Membros ilimitados", included: false },
  { text: "Leads ilimitados", included: false },
  { text: "Suporte prioritário", included: false },
];

const PRO_FEATURES = [
  { text: "Membros ilimitados", included: true },
  { text: "Leads ilimitados", included: true },
  { text: "Pipeline Kanban", included: true },
  { text: "Dashboard avançado", included: true },
  { text: "Linha do tempo de atividades", included: true },
  { text: "Workspaces ilimitados", included: true },
  { text: "Convite por e-mail", included: true },
  { text: "Controle de permissões", included: true },
  { text: "Suporte prioritário", included: true },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-muted/40 py-24 scroll-mt-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Preços
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Simples e transparente
          </h2>
          <p className="mx-auto mt-4 max-w-sm text-base text-muted-foreground">
            Comece grátis, sem cartão de crédito. Faça upgrade quando precisar
            de mais.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-14 grid gap-8 md:grid-cols-2 md:max-w-3xl md:mx-auto">
          {/* Free */}
          <div className="flex flex-col rounded-2xl border border-border bg-card p-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Grátis
              </p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-5xl font-extrabold tracking-tight text-foreground">
                  R$&nbsp;0
                </span>
                <span className="mb-1 text-sm text-muted-foreground">/mês</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Para quem está começando ou testando.
              </p>
            </div>

            <ul className="mt-8 flex-1 space-y-3">
              {FREE_FEATURES.map(({ text, included }) => (
                <li key={text} className="flex items-center gap-3 text-sm">
                  {included ? (
                    <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <X className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  )}
                  <span
                    className={
                      included ? "text-foreground" : "text-muted-foreground/60"
                    }
                  >
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full justify-center"
                )}
              >
                Criar conta grátis
              </Link>
            </div>
          </div>

          {/* Pro */}
          <div className="relative flex flex-col rounded-2xl border-2 border-primary bg-card p-8 shadow-xl shadow-primary/10">
            {/* Badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-primary px-4 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground shadow">
                Mais popular
              </span>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Pro
              </p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-5xl font-extrabold tracking-tight text-foreground">
                  R$&nbsp;49
                </span>
                <span className="mb-1 text-sm text-muted-foreground">/mês</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Para times que querem crescer sem limites.
              </p>
            </div>

            <ul className="mt-8 flex-1 space-y-3">
              {PRO_FEATURES.map(({ text }) => (
                <li key={text} className="flex items-center gap-3 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span className="text-foreground">{text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({}),
                  "w-full justify-center shadow-lg shadow-primary/20"
                )}
              >
                Começar com Pro
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-muted-foreground">
          Sem taxa de setup · Cancele quando quiser · Suporte por e-mail incluído
        </p>
      </div>
    </section>
  );
}
