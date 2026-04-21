export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral das suas métricas de vendas
        </p>
      </div>
      <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-card p-24">
        <p className="text-muted-foreground">Dashboard em breve</p>
      </div>
    </div>
  );
}
