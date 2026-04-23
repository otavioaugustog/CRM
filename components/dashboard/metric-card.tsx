import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  change: number;
  changeLabel?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  change,
  changeLabel = "vs mês passado",
}: MetricCardProps) {
  const positive = change >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn("rounded-lg p-2", iconBg)}>
          <Icon className={cn("h-4 w-4", iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        <div className="mt-1 flex items-center gap-1">
          {positive ? (
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-rose-500" />
          )}
          <span
            className={cn(
              "text-xs font-medium",
              positive ? "text-emerald-500" : "text-rose-500"
            )}
          >
            {positive ? "+" : ""}
            {change}%
          </span>
          <span className="text-xs text-muted-foreground">{changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  );
}
