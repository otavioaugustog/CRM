"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, AlertTriangle, Zap } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import type { Lead } from "@/types";
import { fetchLeads, fetchLeadLimitStatus, createLead, updateLead, deleteLead } from "@/app/actions/leads";
import { FREE_LIMITS } from "@/lib/limits";
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
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [limitStatus, setLimitStatus] = useState<{
    isPro: boolean;
    count: number;
    max: number;
  } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterMounted = useRef(false);

  const loadLeads = useCallback(async (q: string, status: string) => {
    setLoading(true);
    const data = await fetchLeads(q || undefined, status);
    setLeads(data);
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    loadLeads("", "todos");
    fetchLeadLimitStatus().then(setLimitStatus);
  }, [loadLeads]);

  // Debounced reload quando filtros mudam
  useEffect(() => {
    if (!filterMounted.current) { filterMounted.current = true; return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadLeads(search, statusFilter), 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, statusFilter, loadLeads]);

  const atLimit = limitStatus && !limitStatus.isPro && limitStatus.count >= limitStatus.max;
  const nearLimit = limitStatus && !limitStatus.isPro &&
    limitStatus.count >= Math.floor(limitStatus.max * 0.8) && !atLimit;

  function handleOpenNew() {
    if (atLimit) { setUpgradeOpen(true); return; }
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
      if (res.limitReached) {
        setSheetOpen(false);
        setUpgradeOpen(true);
        return;
      }
      if (res.error) { toast.error(res.error); return; }
      setLeads((prev) => [res.lead!, ...prev]);
      setLimitStatus((prev) => prev ? { ...prev, count: prev.count + 1 } : prev);
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
    setLimitStatus((prev) => prev ? { ...prev, count: Math.max(0, prev.count - 1) } : prev);
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

        {/* Aviso de limite */}
        {atLimit && (
          <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm dark:border-rose-800 dark:bg-rose-950">
            <AlertTriangle className="h-4 w-4 shrink-0 text-rose-500" />
            <span className="text-rose-700 dark:text-rose-300">
              Você atingiu o limite de <strong>{FREE_LIMITS.leads} leads</strong> do plano Free.{" "}
              <Link href="/settings/billing" className="font-medium underline underline-offset-2">
                Faça upgrade para Pro
              </Link>{" "}
              para adicionar leads ilimitados.
            </span>
          </div>
        )}

        {nearLimit && (
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm dark:border-amber-800 dark:bg-amber-950">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <span className="text-amber-700 dark:text-amber-300">
              Você está usando <strong>{limitStatus!.count}/{limitStatus!.max} leads</strong> do plano Free.{" "}
              <Link href="/settings/billing" className="font-medium underline underline-offset-2">
                Faça upgrade para Pro
              </Link>{" "}
              antes de atingir o limite.
            </span>
          </div>
        )}

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

      {/* Dialog — upgrade CTA */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Limite de leads atingido
            </DialogTitle>
            <DialogDescription>
              O plano Free permite até <strong>{FREE_LIMITS.leads} leads</strong>.
              Faça upgrade para o plano Pro e adicione leads ilimitados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpgradeOpen(false)}>
              Agora não
            </Button>
            <Button onClick={() => { setUpgradeOpen(false); window.location.href = '/settings/billing'; }}>
              Ver planos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
