"use client";

import { useState } from "react";
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
import { KanbanColumn } from "./kanban-column";
import { KanbanDragOverlay } from "./kanban-drag-overlay";
import { DealForm } from "@/components/leads/deal-form";
import { MOCK_DEALS, PIPELINE_LEADS } from "@/lib/data/mock-pipeline";
import type { Deal, DealStage, Lead } from "@/types";

const STAGES: DealStage[] = [
  "novo_lead",
  "contato_realizado",
  "proposta_enviada",
  "negociacao",
  "fechado_ganho",
  "fechado_perdido",
];

export function KanbanBoard() {
  const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
  const [leads] = useState<Lead[]>(PIPELINE_LEADS);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingToStage, setAddingToStage] = useState<DealStage | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null;
  const activeLead = activeDeal
    ? leads.find((l) => l.id === activeDeal.lead_id)
    : undefined;

  function getStageForId(id: string): DealStage | null {
    // Check if the id is a stage directly
    if (STAGES.includes(id as DealStage)) {
      return id as DealStage;
    }
    // Otherwise it's a deal id — find the deal's stage
    const deal = deals.find((d) => d.id === id);
    return deal?.stage ?? null;
  }

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveId(null);

    if (!over) return;

    const draggedDealId = active.id as string;
    const overId = over.id as string;
    const targetStage = getStageForId(overId);

    if (!targetStage) return;

    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === draggedDealId
          ? { ...deal, stage: targetStage, updated_at: new Date().toISOString() }
          : deal
      )
    );
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function handleAddDeal(stage: DealStage) {
    setAddingToStage(stage);
  }

  function handleDealCreated(newDeal: Deal) {
    setDeals((prev) => [...prev, newDeal]);
  }

  const getDealsForStage = (stage: DealStage) =>
    deals.filter((d) => d.stage === stage);

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
              onAddDeal={handleAddDeal}
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
          open={addingToStage !== null}
          onOpenChange={(open) => {
            if (!open) setAddingToStage(null);
          }}
          onSuccess={handleDealCreated}
        />
      )}
    </>
  );
}
