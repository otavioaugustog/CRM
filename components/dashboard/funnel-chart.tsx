"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STAGES = [
  { stage: "Novo Lead", count: 42, color: "#94a3b8" },
  { stage: "Contato Realizado", count: 31, color: "#3b82f6" },
  { stage: "Proposta Enviada", count: 18, color: "#8b5cf6" },
  { stage: "Negociação", count: 12, color: "#f59e0b" },
  { stage: "Fechado Ganho", count: 24, color: "#10b981" },
  { stage: "Fechado Perdido", count: 16, color: "#f43f5e" },
];

export function FunnelChart() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Funil de Vendas</CardTitle>
        <p className="text-xs text-muted-foreground">
          Volume de negócios por etapa do pipeline
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={264}>
          <BarChart
            data={STAGES}
            layout="vertical"
            margin={{ top: 0, right: 24, bottom: 0, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
            <XAxis
              type="number"
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="stage"
              width={148}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4 }}
              contentStyle={{
                fontSize: 12,
                borderRadius: 8,
                border: "1px solid var(--border)",
                background: "var(--card)",
                color: "var(--card-foreground)",
              }}
              formatter={(value) => [`${value} negócios`, "Volume"]}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
              {STAGES.map((s) => (
                <Cell key={s.stage} fill={s.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
