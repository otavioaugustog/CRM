import { Kanban } from "lucide-react";

export default function PipelinePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Pipeline</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Acompanhe seus negócios pelo Kanban.
        </p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-24 gap-3">
        <Kanban className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Board Kanban disponível no M6 — Kanban UI
        </p>
      </div>
    </div>
  );
}
