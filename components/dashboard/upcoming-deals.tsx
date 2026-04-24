import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export interface UpcomingDealItem {
  id: string;
  title: string;
  lead: string;
  value: number;
  daysUntilDue: number;
  dueLabel: string;
}

function UrgencyBadge({ days }: { days: number }) {
  if (days < 0)
    return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-0 font-medium">Atrasado</Badge>;
  if (days === 0)
    return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-0 font-medium">Hoje</Badge>;
  if (days === 1)
    return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-0 font-medium">Amanhã</Badge>;
  if (days <= 3)
    return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0 font-medium">{days} dias</Badge>;
  return <Badge variant="secondary">{days} dias</Badge>;
}

export function UpcomingDeals({ deals }: { deals: UpcomingDealItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Prazo Próximo</CardTitle>
        <p className="text-xs text-muted-foreground">
          Negócios com vencimento nos próximos 7 dias
        </p>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {deals.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-muted-foreground">
            Nenhum negócio com prazo próximo.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {deals.map((deal) => (
              <li key={deal.id} className="flex items-start justify-between gap-3 px-6 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-tight">{deal.title}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {deal.lead} · {deal.dueLabel}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-sm font-semibold tabular-nums">
                    {formatCurrency(deal.value)}
                  </span>
                  <UrgencyBadge days={deal.daysUntilDue} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
