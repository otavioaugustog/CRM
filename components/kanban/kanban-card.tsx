"use client";

import { CalendarIcon, AlertTriangleIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Deal, DealStage, Lead } from "@/types";

const STAGE_BORDER_COLOR: Record<DealStage, string> = {
  novo_lead: "#94a3b8",
  contato_realizado: "#60a5fa",
  proposta_enviada: "#8b5cf6",
  negociacao: "#f59e0b",
  fechado_ganho: "#10b981",
  fechado_perdido: "#f43f5e",
};

const AVATAR_BG_COLOR: Record<DealStage, string> = {
  novo_lead: "#e2e8f0",
  contato_realizado: "#dbeafe",
  proposta_enviada: "#ede9fe",
  negociacao: "#fef3c7",
  fechado_ganho: "#d1fae5",
  fechado_perdido: "#ffe4e6",
};

interface KanbanCardProps {
  deal: Deal;
  lead: Lead | undefined;
  isDragging?: boolean;
  onEdit: (deal: Deal) => void;
  onDelete: (id: string) => void;
}

function getDueDateStatus(dueDateStr: string | undefined): "ok" | "warning" | "overdue" | null {
  if (!dueDateStr) return null;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due = new Date(dueDateStr + "T00:00:00");
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "warning";
  return "ok";
}

function formatDueDate(dueDateStr: string): string {
  const date = new Date(dueDateStr + "T00:00:00");
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

export function KanbanCard({ deal, lead, isDragging = false, onEdit, onDelete }: KanbanCardProps) {
  const dueDateStatus = getDueDateStatus(deal.due_date);
  const borderColor = STAGE_BORDER_COLOR[deal.stage];
  const avatarBg = AVATAR_BG_COLOR[deal.stage];
  const leadName = lead?.name ?? "Lead removido";
  const leadCompany = lead?.company;

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing select-none",
        isDragging && "opacity-50"
      )}
      style={{ borderLeft: `3px solid ${borderColor}` }}
    >
      {/* Title row with menu */}
      <div className="flex items-start justify-between gap-1 mb-2">
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2 flex-1">
          {deal.title}
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex size-6 shrink-0 -mr-1 -mt-0.5 items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            aria-label="Ações do negócio"
          >
            <MoreHorizontalIcon className="size-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem
              onClick={() => onEdit(deal)}
              className="gap-2 cursor-pointer"
            >
              <PencilIcon className="size-3.5" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(deal.id)}
              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2Icon className="size-3.5" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Lead row */}
      <div className="flex items-center gap-1.5 mb-2.5">
        <span
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-foreground"
          style={{ backgroundColor: avatarBg }}
        >
          {getInitials(leadName)}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate leading-tight">
            {leadName}
          </p>
          {leadCompany && (
            <p className="text-xs text-muted-foreground truncate leading-tight">
              {leadCompany}
            </p>
          )}
        </div>
      </div>

      {/* Bottom row: value + due date */}
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary" className="text-xs font-semibold shrink-0">
          {formatCurrency(deal.value)}
        </Badge>

        {deal.due_date && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs shrink-0",
              dueDateStatus === "overdue" && "text-rose-500",
              dueDateStatus === "warning" && "text-amber-600",
              dueDateStatus === "ok" && "text-muted-foreground"
            )}
          >
            {dueDateStatus === "overdue" || dueDateStatus === "warning" ? (
              <AlertTriangleIcon className="size-3 shrink-0" />
            ) : (
              <CalendarIcon className="size-3 shrink-0" />
            )}
            <span>{formatDueDate(deal.due_date)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
