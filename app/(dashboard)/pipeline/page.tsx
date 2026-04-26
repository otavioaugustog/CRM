import { KanbanBoard } from "@/components/kanban/kanban-board";

export default function PipelinePage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Pipeline</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Gerencie seus negócios no funil de vendas.
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
