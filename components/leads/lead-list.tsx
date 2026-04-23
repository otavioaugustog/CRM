"use client";

import Link from "next/link";
import { Search, Pencil, Trash2, Users } from "lucide-react";
import type { Lead, LeadStatus } from "@/types";
import { cn, formatDate } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUS_CONFIG: Record<LeadStatus, { label: string; className: string }> = {
  ativo: {
    label: "Ativo",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  inativo: {
    label: "Inativo",
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
  perdido: {
    label: "Perdido",
    className: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  },
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  const { label, className } = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        className
      )}
    >
      {label}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3">
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
          <Skeleton className="hidden h-4 w-28 md:block" />
          <Skeleton className="hidden h-4 w-40 lg:block" />
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="hidden h-4 w-20 sm:block" />
          <Skeleton className="h-7 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

interface LeadListProps {
  leads: Lead[];
  loading: boolean;
  search: string;
  statusFilter: string;
  onSearchChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
}

export function LeadList({
  leads,
  loading,
  search,
  statusFilter,
  onSearchChange,
  onStatusChange,
  onEdit,
  onDelete,
}: LeadListProps) {
  const hasFilters = search.trim() !== "" || statusFilter !== "todos";

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, empresa ou e-mail…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => onStatusChange(v ?? "todos")}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
            <SelectItem value="perdido">Perdido</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        {loading ? (
          <TableSkeleton />
        ) : leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Users className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? "Nenhum lead encontrado com esses filtros."
                : "Nenhum lead cadastrado ainda."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">Empresa</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">E-mail</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">Criado em</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, idx) => (
                  <tr
                    key={lead.id}
                    className={cn(
                      "transition-colors hover:bg-muted/40",
                      idx !== leads.length - 1 && "border-b border-border"
                    )}
                  >
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {lead.name}
                        </Link>
                        {lead.role && (
                          <span className="text-xs text-muted-foreground">{lead.role}</span>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {lead.company ?? "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {lead.email}
                    </td>
                    <td className="px-4 py-3">
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEdit(lead)}
                          aria-label="Editar lead"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onDelete(lead.id)}
                          aria-label="Excluir lead"
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && leads.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {leads.length} lead{leads.length !== 1 ? "s" : ""} encontrado
          {leads.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
