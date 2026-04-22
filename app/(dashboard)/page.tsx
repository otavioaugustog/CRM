import { Users, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const METRIC_CARDS = [
  {
    title: "Total de Leads",
    value: "—",
    description: "Conecte o banco para ver",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    title: "Negócios Abertos",
    value: "—",
    description: "Conecte o banco para ver",
    icon: TrendingUp,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Valor do Pipeline",
    value: "—",
    description: "Conecte o banco para ver",
    icon: DollarSign,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Taxa de Conversão",
    value: "—",
    description: "Conecte o banco para ver",
    icon: BarChart3,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      {/* Page heading */}
      <div>
        <h2 className="text-xl font-semibold text-foreground">
          Boas-vindas ao PipeFlow
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Acompanhe suas métricas de vendas em tempo real.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRIC_CARDS.map(({ title, value, description, icon: Icon, color, bg }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-foreground">{value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Funnel chart placeholder */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Funil de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border">
              <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Gráfico disponível no Dashboard — Backend (M11)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Deals com Prazo Próximo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 flex-col items-center justify-center gap-2">
              <p className="text-sm text-muted-foreground text-center">
                Nenhum deal com prazo nos próximos 7 dias
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Skeleton example — remove quando conectar dados reais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Carregando dados de exemplo…
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    </div>
  );
}
