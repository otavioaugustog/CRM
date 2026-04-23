import {
  Kanban,
  Users,
  BarChart3,
  Building2,
  MessageSquare,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: Kanban,
    colorClass: "text-indigo-500",
    bgClass: "bg-indigo-500/10",
    title: "Pipeline Kanban Visual",
    description:
      "Arraste e solte negócios entre etapas do funil em tempo real. Visualize todo o seu pipeline em um único lugar e nunca perca o fio da meada.",
  },
  {
    icon: Users,
    colorClass: "text-emerald-500",
    bgClass: "bg-emerald-500/10",
    title: "Gestão de Leads",
    description:
      "Cadastre, filtre e acompanhe leads com histórico completo. Busca rápida por nome ou empresa e atribuição por responsável.",
  },
  {
    icon: BarChart3,
    colorClass: "text-violet-500",
    bgClass: "bg-violet-500/10",
    title: "Dashboard de Métricas",
    description:
      "Acompanhe taxa de conversão, volume de pipeline e deals por etapa com gráficos claros. Tome decisões baseadas em dados, não em feeling.",
  },
  {
    icon: Building2,
    colorClass: "text-amber-500",
    bgClass: "bg-amber-500/10",
    title: "Multi-empresa",
    description:
      "Gerencie múltiplos workspaces em uma única conta. Convide colaboradores por e-mail e defina permissões de admin ou membro.",
  },
  {
    icon: MessageSquare,
    colorClass: "text-rose-500",
    bgClass: "bg-rose-500/10",
    title: "Linha do Tempo de Atividades",
    description:
      "Registre ligações, e-mails, reuniões e notas em cada lead. Mantenha toda a equipe alinhada sem perder nenhum detalhe importante.",
  },
  {
    icon: Zap,
    colorClass: "text-indigo-500",
    bgClass: "bg-indigo-500/10",
    title: "Integrações Nativas",
    description:
      "Conectado ao Stripe para planos e cobranças, e Resend para e-mails transacionais. Ecossistema pronto para crescer com você.",
  },
];

export function Features() {
  return (
    <section id="features" className="bg-background py-24 scroll-mt-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Funcionalidades
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Tudo que seu time precisa para vender mais
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
            Do primeiro contato ao fechamento, o PipeFlow cobre cada etapa do
            seu processo comercial sem complexidade desnecessária.
          </p>
        </div>

        {/* Grid */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, colorClass, bgClass, title, description }) => (
            <div
              key={title}
              className="group rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg ${bgClass} mb-4 transition-transform duration-200 group-hover:scale-110`}
              >
                <Icon className={`h-5 w-5 ${colorClass}`} />
              </div>
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
