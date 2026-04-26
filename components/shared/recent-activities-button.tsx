"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { History, CalendarDays, PhoneCall, AtSign, StickyNote } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatRelativeDate } from "@/lib/utils";
import { fetchRecentActivities, type NotificationActivity } from "@/app/actions/notifications";
import type { ActivityType } from "@/types";

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  call: PhoneCall,
  email: AtSign,
  meeting: CalendarDays,
  note: StickyNote,
};

const ACTIVITY_LABELS: Record<ActivityType, string> = {
  call: "Ligação",
  email: "E-mail",
  meeting: "Reunião",
  note: "Nota",
};

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + "…" : str;
}

export function RecentActivitiesButton() {
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState<NotificationActivity[]>([]);
  const [isPending, startTransition] = useTransition();

  function prefetch() {
    startTransition(async () => {
      const result = await fetchRecentActivities();
      setActivities(result);
    });
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        aria-label="Atividades recentes"
        onMouseEnter={prefetch}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none"
      >
        <History className={cn("h-4 w-4", isPending && "opacity-50")} />
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">Atividades recentes</p>
        </div>

        {isPending ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-muted" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10">
            <History className="h-7 w-7 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhuma atividade registrada</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {activities.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type];
              return (
                <Link
                  key={activity.id}
                  href={`/leads/${activity.lead_id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-foreground">
                        {activity.lead_name}
                      </p>
                      <span className="shrink-0 text-xs text-muted-foreground/60">
                        · {ACTIVITY_LABELS[activity.type]}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {truncate(activity.description, 40)}
                    </p>
                    <p className="text-xs text-muted-foreground/70" suppressHydrationWarning>
                      {formatRelativeDate(activity.created_at)}
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
