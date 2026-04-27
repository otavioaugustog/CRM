"use client";

import { KanbanCard } from "./kanban-card";
import type { Deal, Lead } from "@/types";

interface KanbanDragOverlayProps {
  deal: Deal;
  lead: Lead | undefined;
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

export function KanbanDragOverlay({ deal, lead }: KanbanDragOverlayProps) {
  return (
    <div className="shadow-2xl scale-105 rotate-1 w-72">
      <KanbanCard deal={deal} lead={lead} isDragging={false} onEdit={noop} onDelete={noop} />
    </div>
  );
}
