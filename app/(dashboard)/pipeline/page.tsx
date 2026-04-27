import { KanbanBoard } from "@/components/kanban/kanban-board";
import { fetchDeals } from "@/app/actions/deals";
import { fetchLeads } from "@/app/actions/leads";

export default async function PipelinePage() {
  const [{ deals, error }, leads] = await Promise.all([
    fetchDeals(),
    fetchLeads(),
  ]);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Pipeline</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Gerencie seus negócios no funil de vendas.
        </p>
      </div>
      <KanbanBoard
        initialDeals={deals}
        initialLeads={leads}
        fetchError={error}
      />
    </div>
  );
}
