"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bell, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fetchUpcomingDeals, type NotificationDeal } from "@/app/actions/notifications";

const STAGE_LABELS: Record<string, string> = {
  novo_lead: "Novo Lead",
  contato_realizado: "Contato Realizado",
  proposta_enviada: "Proposta Enviada",
  negociacao: "Negociação",
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [deals, setDeals] = useState<NotificationDeal[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [isPending, startTransition] = useTransition();

  function load(markUnread = false) {
    startTransition(async () => {
      const result = await fetchUpcomingDeals();
      setDeals(result);
      if (markUnread && result.length > 0) setHasUnread(true);
    });
  }

  useEffect(() => { load(true); }, []);

  function handleOpenChange(next: boolean) {
    if (next) setHasUnread(false);
    setOpen(next);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        aria-label="Notificações"
        onMouseEnter={() => load(false)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none"
      >
        <Bell className={cn("h-4 w-4", isPending && "opacity-50")} />
        {hasUnread && deals.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white leading-none">
            {deals.length}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Prazos próximos</p>
        </div>

        {isPending ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10">
            <Bell className="h-7 w-7 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum prazo nos próximos 7 dias</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {deals.map((deal) => {
              const days = daysUntil(deal.due_date);
              return (
                <Link
                  key={deal.id}
                  href="/pipeline"
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {truncate(deal.title, 32)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {STAGE_LABELS[deal.stage] ?? deal.stage}
                      {" · "}
                      <span className={cn(days === 0 && "font-medium text-rose-500")}>
                        {days === 0 ? "vence hoje" : days === 1 ? "vence amanhã" : `${days} dias`}
                      </span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
