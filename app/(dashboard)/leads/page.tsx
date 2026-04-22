import { Users } from "lucide-react";

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Leads</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Gerencie seus contatos e oportunidades de venda.
        </p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-24 gap-3">
        <Users className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Listagem de leads disponível no M4 — Leads UI
        </p>
      </div>
    </div>
  );
}
