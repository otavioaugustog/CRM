import { BarChart3, DollarSign, Percent, Users } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { FunnelChart } from "@/components/dashboard/funnel-chart";
import { UpcomingDeals } from "@/components/dashboard/upcoming-deals";
import { formatCurrency } from "@/lib/utils";

const METRICS = [
  {
    title: "Total de Leads",
    value: "143",
    icon: Users,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    change: 12,
  },
  {
    title: "Negócios Abertos",
    value: "28",
    icon: BarChart3,
    iconColor: "text-emerald-500",
    iconBg: "bg-emerald-500/10",
    change: -3,
  },
  {
    title: "Valor do Pipeline",
    value: formatCurrency(312500),
    icon: DollarSign,
    iconColor: "text-amber-500",
    iconBg: "bg-amber-500/10",
    change: 18,
  },
  {
    title: "Taxa de Conversão",
    value: "34%",
    icon: Percent,
    iconColor: "text-violet-500",
    iconBg: "bg-violet-500/10",
    change: 5,
  },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Boas-vindas ao PipeFlow</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Acompanhe suas métricas de vendas em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <FunnelChart />
        <UpcomingDeals />
      </div>
    </div>
  );
}
