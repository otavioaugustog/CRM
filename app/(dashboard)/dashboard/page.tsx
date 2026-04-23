import { BarChart3, DollarSign, Percent, Users } from "lucide-react";
import { cookies } from "next/headers";
import { MetricCard } from "@/components/dashboard/metric-card";
import { FunnelChart, type FunnelStage } from "@/components/dashboard/funnel-chart";
import { UpcomingDeals, type UpcomingDealItem } from "@/components/dashboard/upcoming-deals";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspaceId } from "@/lib/get-workspace-id";
import { formatCurrency } from "@/lib/utils";
import type { Deal, Lead } from "@/types";

const STAGE_LABELS: Record<string, string> = {
  novo_lead: "Novo Lead",
  contato_realizado: "Contato Realizado",
  proposta_enviada: "Proposta Enviada",
  negociacao: "Negociação",
  fechado_ganho: "Fechado Ganho",
  fechado_perdido: "Fechado Perdido",
};

const STAGE_COLORS: Record<string, string> = {
  novo_lead: "#94a3b8",
  contato_realizado: "#60a5fa",
  proposta_enviada: "#8b5cf6",
  negociacao: "#f59e0b",
  fechado_ganho: "#10b981",
  fechado_perdido: "#f43f5e",
};

const STAGE_ORDER = [
  "novo_lead",
  "contato_realizado",
  "proposta_enviada",
  "negociacao",
  "fechado_ganho",
  "fechado_perdido",
];

const CLOSED_STAGES = ["fechado_ganho", "fechado_perdido"];

async function getDashboardData() {
  // Ensure cookies are read (needed for getActiveWorkspaceId)
  await cookies();
  const workspaceId = await getActiveWorkspaceId();
  if (!workspaceId) {
    return { totalLeads: 0, openDeals: 0, pipelineValue: 0, conversionRate: 0, funnelStages: [], upcomingDeals: [] };
  }

  const supabase = await createClient();

  const [{ count: totalLeads }, { data: rawDeals }, { data: rawLeads }] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("deals")
      .select("*")
      .eq("workspace_id", workspaceId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from("leads")
      .select("id, name")
      .eq("workspace_id", workspaceId),
  ]);

  const deals = (rawDeals ?? []) as Deal[];
  const leads = (rawLeads ?? []) as Pick<Lead, "id" | "name">[];

  const openDeals = deals.filter((d) => !CLOSED_STAGES.includes(d.stage));
  const closedWon = deals.filter((d) => d.stage === "fechado_ganho");
  const closedLost = deals.filter((d) => d.stage === "fechado_perdido");

  const pipelineValue = openDeals.reduce((sum, d) => sum + d.value, 0);

  const conversionDenominator = closedWon.length + closedLost.length;
  const conversionRate =
    conversionDenominator > 0
      ? Math.round((closedWon.length / conversionDenominator) * 100)
      : 0;

  const funnelStages: FunnelStage[] = STAGE_ORDER.map((stage) => ({
    stage: STAGE_LABELS[stage],
    count: deals.filter((d) => d.stage === stage).length,
    color: STAGE_COLORS[stage],
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  in7Days.setHours(23, 59, 59, 999);

  const upcomingDeals: UpcomingDealItem[] = deals
    .filter((d) => {
      if (!d.due_date || CLOSED_STAGES.includes(d.stage)) return false;
      const due = new Date(d.due_date);
      return due >= today && due <= in7Days;
    })
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5)
    .map((d) => {
      const due = new Date(d.due_date!);
      const diffMs = due.getTime() - today.getTime();
      const daysUntilDue = Math.round(diffMs / (1000 * 60 * 60 * 24));
      const leadName = leads.find((l) => l.id === d.lead_id)?.name ?? "—";
      return {
        id: d.id,
        title: d.title,
        lead: leadName,
        value: d.value,
        daysUntilDue,
        dueLabel: due.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      };
    });

  return {
    totalLeads: totalLeads ?? 0,
    openDeals: openDeals.length,
    pipelineValue,
    conversionRate,
    funnelStages,
    upcomingDeals,
  };
}

export default async function DashboardPage() {
  const { totalLeads, openDeals, pipelineValue, conversionRate, funnelStages, upcomingDeals } =
    await getDashboardData();

  const metrics = [
    {
      title: "Total de Leads",
      value: String(totalLeads),
      icon: Users,
      iconColor: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      title: "Negócios Abertos",
      value: String(openDeals),
      icon: BarChart3,
      iconColor: "text-emerald-500",
      iconBg: "bg-emerald-500/10",
    },
    {
      title: "Valor do Pipeline",
      value: formatCurrency(pipelineValue),
      icon: DollarSign,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-500/10",
    },
    {
      title: "Taxa de Conversão",
      value: `${conversionRate}%`,
      icon: Percent,
      iconColor: "text-violet-500",
      iconBg: "bg-violet-500/10",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold">Boas-vindas ao PipeFlow</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Acompanhe suas métricas de vendas em tempo real.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <MetricCard key={m.title} {...m} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <FunnelChart stages={funnelStages} />
        <UpcomingDeals deals={upcomingDeals} />
      </div>
    </div>
  );
}
