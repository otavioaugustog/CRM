"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Lead } from "@/types";
import { MOCK_LEADS } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LeadForm } from "@/components/leads/lead-form";
import { LeadList } from "@/components/leads/lead-list";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function handleOpenNew() {
    setEditingLead(null);
    setSheetOpen(true);
  }

  function handleOpenEdit(lead: Lead) {
    setEditingLead(lead);
    setSheetOpen(true);
  }

  function handleSave(lead: Lead) {
    if (editingLead) {
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? lead : l)));
      toast.success("Lead atualizado com sucesso.");
    } else {
      setLeads((prev) => [lead, ...prev]);
      toast.success("Lead criado com sucesso.");
    }
    setSheetOpen(false);
  }

  function handleConfirmDelete() {
    if (!deleteId) return;
    setLeads((prev) => prev.filter((l) => l.id !== deleteId));
    setDeleteId(null);
    toast.success("Lead excluído.");
  }

  const deletingLead = leads.find((l) => l.id === deleteId);

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Leads</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Gerencie seus contatos e oportunidades de venda.
            </p>
          </div>
          <Button onClick={handleOpenNew} className="shrink-0">
            <Plus className="h-4 w-4" />
            Novo lead
          </Button>
        </div>

        <LeadList
          leads={leads}
          onEdit={handleOpenEdit}
          onDelete={setDeleteId}
        />
      </div>

      {/* Sheet — criar / editar */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="flex flex-col gap-0 p-0">
          <SheetHeader className="border-b border-border px-4 py-4">
            <SheetTitle>
              {editingLead ? "Editar lead" : "Novo lead"}
            </SheetTitle>
            <SheetDescription>
              {editingLead
                ? "Atualize as informações do contato."
                : "Preencha os dados do novo contato."}
            </SheetDescription>
          </SheetHeader>
          <LeadForm
            lead={editingLead ?? undefined}
            onSuccess={handleSave}
            onCancel={() => setSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Dialog — confirmar exclusão */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir lead</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir{" "}
              <span className="font-medium text-foreground">
                {deletingLead?.name}
              </span>
              ? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
