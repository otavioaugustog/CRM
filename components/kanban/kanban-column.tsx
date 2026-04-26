"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KanbanCard } from "./kanban-card";
import { formatCurrency } from "@/lib/utils";
import type { Deal, DealStage, Lead } from "@/types";

export const STAGE_LABELS: Record<DealStage, string> = {
  novo_lead: "Novo Lead",
  contato_realizado: "Contato Realizado",
  proposta_enviada: "Proposta Enviada",
  negociacao: "Negociação",
  fechado_ganho: "Fechado Ganho",
  fechado_perdido: "Fechado Perdido",
};

const STAGE_DOT_COLOR: Record<DealStage, string> = {
  novo_lead: "#94a3b8",        // slate-400
  contato_realizado: "#60a5fa", // blue-400
  proposta_enviada: "#8b5cf6",  // violet-500
  negociacao: "#f59e0b",        // amber-500
  fechado_ganho: "#10b981",     // emerald-500
  fechado_perdido: "#f43f5e",   // rose-500
};

const STAGE_BG_CLASS: Record<DealStage, string> = {
  novo_lead: "bg-stage-novo",
  contato_realizado: "bg-stage-contato",
  proposta_enviada: "bg-stage-proposta",
  negociacao: "bg-stage-negociacao",
  fechado_ganho: "bg-stage-ganho",
  fechado_perdido: "bg-stage-perdido",
};

// Sortable wrapper for each card
function SortableCard({ deal, lead }: { deal: Deal; lead: Lead | undefined }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard deal={deal} lead={lead} isDragging={isDragging} />
    </div>
  );
}

interface KanbanColumnProps {
  stage: DealStage;
  deals: Deal[];
  leads: Lead[];
  onAddDeal: (stage: DealStage) => void;
}

export function KanbanColumn({ stage, deals, leads, onAddDeal }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  const columnTotal = deals.reduce((sum, d) => sum + d.value, 0);
  const dotColor = STAGE_DOT_COLOR[stage];
  const bgClass = STAGE_BG_CLASS[stage];
  const label = STAGE_LABELS[stage];
  const dealIds = deals.map((d) => d.id);

  const getLeadForDeal = (deal: Deal) => leads.find((l) => l.id === deal.lead_id);

  return (
    <div
      className="w-72 flex-shrink-0 flex flex-col rounded-xl overflow-hidden border border-border"
      style={{ transition: "box-shadow 0.15s ease" }}
    >
      {/* Header */}
      <div className="px-3 py-2.5 bg-card border-b border-border">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ backgroundColor: dotColor }}
            />
            <span className="text-sm font-semibold text-foreground truncate">
              {label}
            </span>
          </div>
          <Badge variant="secondary" className="shrink-0 tabular-nums">
            {deals.length}
          </Badge>
        </div>
        {deals.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground pl-4">
            {formatCurrency(columnTotal)}
          </p>
        )}
      </div>

      {/* Body */}
      <div
        ref={setNodeRef}
        className={`flex-1 overflow-y-auto p-2 space-y-2 min-h-[400px] ${bgClass} transition-colors duration-150 ${isOver ? "ring-2 ring-inset ring-primary/30" : ""}`}
      >
        <SortableContext items={dealIds} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <SortableCard
              key={deal.id}
              deal={deal}
              lead={getLeadForDeal(deal)}
            />
          ))}
        </SortableContext>
        {deals.length === 0 && (
          <div className="flex items-center justify-center h-16 rounded-lg border border-dashed border-border/60">
            <p className="text-xs text-muted-foreground/60">Nenhum negócio</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-card border-t border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-1.5 text-muted-foreground hover:text-foreground"
          onClick={() => onAddDeal(stage)}
        >
          <PlusIcon className="size-3.5" />
          Negócio
        </Button>
      </div>
    </div>
  );
}
