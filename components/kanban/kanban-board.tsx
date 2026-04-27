"use client";

import { useState, useRef } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { AlertCircleIcon } from "lucide-react";
import { KanbanColumn } from "./kanban-column";
import { KanbanDragOverlay } from "./kanban-drag-overlay";
import { DealForm } from "@/components/leads/deal-form";
import { createDeal, updateDeal, moveDeal, deleteDeal } from "@/app/actions/deals";
import type { Deal, DealStage, Lead } from "@/types";

const STAGES: DealStage[] = [
  "novo_lead",
  "contato_realizado",
  "proposta_enviada",
  "negociacao",
  "fechado_ganho",
  "fechado_perdido",
];

interface KanbanBoardProps {
  initialDeals: Deal[];
  initialLeads: Lead[];
  fetchError?: string;
}

export function KanbanBoard({ initialDeals, initialLeads, fetchError }: KanbanBoardProps) {
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const leads = initialLeads;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingToStage, setAddingToStage] = useState<DealStage | null>(null);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const previousStageRef = useRef<DealStage | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null;
  const activeLead = activeDeal ? leads.find((l) => l.id === activeDeal.lead_id) : undefined;

  function getStageForId(id: string): DealStage | null {
    if (STAGES.includes(id as DealStage)) return id as DealStage;
    return deals.find((d) => d.id === id)?.stage ?? null;
  }

  function handleDragStart({ active }: DragStartEvent) {
    const deal = deals.find((d) => d.id === active.id);
    previousStageRef.current = deal?.stage ?? null;
    setActiveId(active.id as string);
  }

  async function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);
    if (!over) return;

    const draggedDealId = active.id as string;
    const targetStage = getStageForId(over.id as string);
    if (!targetStage) return;

    const currentStage = deals.find((d) => d.id === draggedDealId)?.stage;
    if (currentStage === targetStage) return;

    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === draggedDealId
          ? { ...deal, stage: targetStage, updated_at: new Date().toISOString() }
          : deal
      )
    );

    const result = await moveDeal(draggedDealId, targetStage);
    if (result.error) {
      const prevStage = previousStageRef.current;
      if (prevStage) {
        setDeals((prev) =>
          prev.map((deal) =>
            deal.id === draggedDealId ? { ...deal, stage: prevStage } : deal
          )
        );
      }
      toast.error(result.error);
    } else {
      toast.success("Negócio movido.");
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  async function handleDealCreated(input: {
    title: string;
    lead_id: string;
    value: number;
    due_date?: string;
  }) {
    if (!addingToStage) return;
    const result = await createDeal({ ...input, stage: addingToStage });
    if (result.error) { toast.error(result.error); return; }
    if (!result.deal) { toast.error("Erro inesperado. Tente novamente."); return; }
    setDeals((prev) => [result.deal!, ...prev]);
    toast.success("Negócio criado com sucesso.");
    setAddingToStage(null);
  }

  async function handleDealUpdated(input: {
    title: string;
    lead_id: string;
    value: number;
    due_date?: string;
  }) {
    if (!editingDeal) return;
    const result = await updateDeal(editingDeal.id, {
      title: input.title,
      lead_id: input.lead_id,
      value: input.value,
      due_date: input.due_date ?? null,
    });
    if (result.error) { toast.error(result.error); return; }
    if (!result.deal) { toast.error("Erro inesperado. Tente novamente."); return; }
    setDeals((prev) => prev.map((d) => (d.id === editingDeal.id ? result.deal! : d)));
    toast.success("Negócio atualizado.");
    setEditingDeal(null);
  }

  async function handleDealDeleted(id: string) {
    const snapshotIndex = deals.findIndex((d) => d.id === id);
    const snapshot = deals[snapshotIndex];
    setDeals((prev) => prev.filter((d) => d.id !== id));
    const result = await deleteDeal(id);
    if (result.error) {
      if (snapshot !== undefined) {
        setDeals((prev) => {
          const next = [...prev];
          next.splice(snapshotIndex, 0, snapshot);
          return next;
        });
      }
      toast.error(result.error);
    } else {
      toast.error("Negócio excluído.");
    }
  }

  const getDealsForStage = (stage: DealStage) => deals.filter((d) => d.stage === stage);

  if (fetchError) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
        <AlertCircleIcon className="size-4 shrink-0" />
        {fetchError}
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 px-1 -mx-1">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              deals={getDealsForStage(stage)}
              leads={leads}
              onAddDeal={() => { setEditingDeal(null); setAddingToStage(stage); }}
              onEditDeal={(deal) => { setAddingToStage(null); setEditingDeal(deal); }}
              onDeleteDeal={handleDealDeleted}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
          {activeDeal ? (
            <KanbanDragOverlay deal={activeDeal} lead={activeLead} />
          ) : null}
        </DragOverlay>
      </DndContext>

      {addingToStage && (
        <DealForm
          stage={addingToStage}
          leads={leads}
          open
          onOpenChange={(open) => { if (!open) setAddingToStage(null); }}
          onSuccess={handleDealCreated}
        />
      )}

      {editingDeal && (
        <DealForm
          key={editingDeal.id}
          stage={editingDeal.stage}
          leads={leads}
          open
          deal={editingDeal}
          onOpenChange={(open) => { if (!open) setEditingDeal(null); }}
          onSuccess={handleDealUpdated}
        />
      )}
    </>
  );
}
