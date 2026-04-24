"use client";

import { useState, useEffect, useRef } from "react";
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
import { KanbanColumn } from "./kanban-column";
import { KanbanDragOverlay } from "./kanban-drag-overlay";
import { DealForm } from "@/components/leads/deal-form";
import { fetchDeals, createDeal, moveDeal } from "@/app/actions/deals";
import { fetchLeads } from "@/app/actions/leads";
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
  const [deals, setDeals] = useState<Deal[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [addingToStage, setAddingToStage] = useState<DealStage | null>(null);
  const previousStageRef = useRef<DealStage | null>(null);

  useEffect(() => {
    async function load() {
      const [dealsData, leadsData] = await Promise.all([fetchDeals(), fetchLeads()]);
      setDeals(dealsData);
      setLeads(leadsData);
      setLoading(false);
    }
    load();
  }, []);

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

    // Optimistic update
    setDeals((prev) =>
      prev.map((deal) =>
        deal.id === draggedDealId
          ? { ...deal, stage: targetStage, updated_at: new Date().toISOString() }
          : deal
      )
    );

    const result = await moveDeal(draggedDealId, targetStage);
    if (result.error) {
      // Revert on failure
      const prevStage = previousStageRef.current;
      if (prevStage) {
        setDeals((prev) =>
          prev.map((deal) =>
            deal.id === draggedDealId ? { ...deal, stage: prevStage } : deal
          )
        );
      }
      toast.error(result.error);
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  async function handleDealCreated(input: {
    title: string; lead_id: string; value: number; due_date?: string;
  }) {
    if (!addingToStage) return;
    const result = await createDeal({ ...input, stage: addingToStage });
    if (result.error) { toast.error(result.error); return; }
    setDeals((prev) => [result.deal!, ...prev]);
    toast.success("Negócio criado com sucesso.");
    setAddingToStage(null);
  }

  const getDealsForStage = (stage: DealStage) => deals.filter((d) => d.stage === stage);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4 px-1 -mx-1">
        {STAGES.map((stage) => (
          <div
            key={stage}
            className="w-72 flex-shrink-0 h-64 rounded-xl border border-border bg-muted/30 animate-pulse"
          />
        ))}
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
              onAddDeal={() => setAddingToStage(stage)}
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
          onOpenChange={(open) => { if (!open) setAddingToStage(null); }}
          onSuccess={handleDealCreated}
        />
      )}
    </>
  );
}
