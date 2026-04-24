"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Lead } from "@/types";
import { fetchLeads, createLead, updateLead, deleteLead } from "@/app/actions/leads";
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
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterMounted = useRef(false);

  const loadLeads = useCallback(async (q: string, status: string) => {
    setLoading(true);
    const data = await fetchLeads(q || undefined, status);
    setLeads(data);
    setLoading(false);
  }, []);

  // Initial load — sem debounce
  useEffect(() => {
    loadLeads("", "todos");
  }, [loadLeads]);

  // Debounced reload quando filtros mudam (pula o mount inicial)
  useEffect(() => {
    if (!filterMounted.current) { filterMounted.current = true; return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadLeads(search, statusFilter), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, statusFilter, loadLeads]);

  function handleOpenNew() {
    setEditingLead(null);
    setSheetOpen(true);
  }

  function handleOpenEdit(lead: Lead) {
    setEditingLead(lead);
    setSheetOpen(true);
  }

  async function handleSave(data: {
    name: string; email: string; phone?: string;
    company?: string; role?: string; status: "ativo" | "inativo" | "perdido";
  }) {
    if (editingLead) {
      const res = await updateLead(editingLead.id, data);
      if (res.error) { toast.error(res.error); return; }
      setLeads((prev) => prev.map((l) => (l.id === editingLead.id ? res.lead! : l)));
      toast.success("Lead atualizado com sucesso.");
    } else {
      const res = await createLead(data);
      if (res.error) { toast.error(res.error); return; }
      setLeads((prev) => [res.lead!, ...prev]);
      toast.success("Lead criado com sucesso.");
    }
    setSheetOpen(false);
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;
    setDeleting(true);
    const res = await deleteLead(deleteId);
    setDeleting(false);
    if (res.error) { toast.error(res.error); return; }
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
          loading={loading}
          search={search}
          statusFilter={statusFilter}
          onSearchChange={setSearch}
          onStatusChange={setStatusFilter}
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
            key={editingLead?.id ?? "new"}
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
            <Button variant="outline" onClick={() => setDeleteId(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting ? "Excluindo…" : "Excluir"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
