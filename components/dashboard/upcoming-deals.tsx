import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface UpcomingDeal {
  id: string;
  title: string;
  lead: string;
  value: number;
  daysUntilDue: number;
}

function addDays(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function formatDueDate(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

const DEALS: UpcomingDeal[] = [
  { id: "1", title: "Renovação Contrato Alírios", lead: "Marcos Alírios", value: 48000, daysUntilDue: 0 },
  { id: "2", title: "Upgrade ERP Nexus", lead: "Fernanda Costa", value: 32500, daysUntilDue: 1 },
  { id: "3", title: "Consultoria Setup Nuvem", lead: "Rafael Nunes", value: 18000, daysUntilDue: 3 },
  { id: "4", title: "Licenças Microsoft 365", lead: "Ana Carvalho", value: 9600, daysUntilDue: 5 },
  { id: "5", title: "Suporte Premium Anual", lead: "Bruno Silva", value: 24000, daysUntilDue: 7 },
];

function UrgencyBadge({ days }: { days: number }) {
  if (days === 0)
    return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-0 font-medium">Hoje</Badge>;
  if (days === 1)
    return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-0 font-medium">Amanhã</Badge>;
  if (days <= 3)
    return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0 font-medium">{days} dias</Badge>;
  return <Badge variant="secondary">{days} dias</Badge>;
}

export function UpcomingDeals() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Prazo Próximo</CardTitle>
        <p className="text-xs text-muted-foreground">
          Negócios com vencimento nos próximos 7 dias
        </p>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <ul className="divide-y divide-border">
          {DEALS.map((deal) => {
            const due = addDays(deal.daysUntilDue);
            return (
              <li key={deal.id} className="flex items-start justify-between gap-3 px-6 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">
                    {deal.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {deal.lead} · {formatDueDate(due)}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(deal.value)}
                  </span>
                  <UrgencyBadge days={deal.daysUntilDue} />
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
