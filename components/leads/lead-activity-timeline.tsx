"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PhoneCall,
  CalendarDays,
  StickyNote,
  AtSign,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";
import type { Activity, ActivityType } from "@/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createActivity, deleteActivity } from "@/app/actions/activities";
import { createClient } from "@/lib/supabase/client";

const ACTIVITY_CONFIG: Record<
  ActivityType,
  { label: string; icon: React.ElementType; className: string }
> = {
  call: {
    label: "Ligação",
    icon: PhoneCall,
    className: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  email: {
    label: "E-mail",
    icon: AtSign,
    className: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
  },
  meeting: {
    label: "Reunião",
    icon: CalendarDays,
    className: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  note: {
    label: "Nota",
    icon: StickyNote,
    className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  },
};

const schema = z.object({
  type: z.enum(["call", "email", "meeting", "note"] as const),
  description: z.string().min(1, "Descrição obrigatória").max(2000, "Máximo de 2000 caracteres"),
});

type FormData = z.infer<typeof schema>;

interface LeadActivityTimelineProps {
  leadId: string;
  initialActivities: Activity[];
  currentUserId: string;
}

export function LeadActivityTimeline({
  leadId,
  initialActivities,
  currentUserId,
}: LeadActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isCreating, startCreateTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`activities-lead-${leadId}`)
      .on("broadcast", { event: "activity_inserted" }, ({ payload }) => {
        const incoming = payload.activity as Activity;
        setActivities((prev) =>
          prev.some((a) => a.id === incoming.id) ? prev : [incoming, ...prev]
        );
      })
      .on("broadcast", { event: "activity_deleted" }, ({ payload }) => {
        setActivities((prev) => prev.filter((a) => a.id !== payload.id));
      })
      .subscribe();

    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
    };
  }, [leadId]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "call", description: "" },
  });

  function handleDelete(id: string) {
    const toRestore = activities.find((a) => a.id === id);
    setDeletingId(id);
    setActivities((prev) => prev.filter((a) => a.id !== id));

    deleteActivity(id).then((result) => {
      if (!result.success && toRestore) {
        setActivities((prev) =>
          [...prev, toRestore].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        );
      } else if (result.success) {
        channelRef.current?.send({
          type: "broadcast",
          event: "activity_deleted",
          payload: { id },
        });
      }
      setDeletingId(null);
    });
  }

  function handleOpen() {
    reset({ type: "call", description: "" });
    setServerError(null);
    setOpen(true);
  }

  function onSubmit(data: FormData) {
    setServerError(null);

    const tempId = `optimistic-${Date.now()}`;
    const optimisticItem: Activity = {
      id: tempId,
      workspace_id: "",
      lead_id: leadId,
      type: data.type,
      description: data.description,
      author_id: currentUserId,
      created_at: new Date().toISOString(),
    };

    setActivities((prev) => [optimisticItem, ...prev]);
    setOpen(false);

    startCreateTransition(async () => {
      const result = await createActivity({
        leadId,
        type: data.type,
        description: data.description,
      });

      if (!result.success) {
        setActivities((prev) => prev.filter((a) => a.id !== tempId));
        setServerError(result.error ?? "Erro ao registrar atividade");
        reset(data);
        setOpen(true);
        return;
      }

      if (result.activity) {
        // Replace optimistic item with real one before broadcasting to avoid
        // self-deduplication race: the channel receives our own broadcast and
        // the real ID must already be in state when dedup runs.
        setActivities((prev) =>
          prev.map((a) => (a.id === tempId ? result.activity! : a))
        );
        channelRef.current?.send({
          type: "broadcast",
          event: "activity_inserted",
          payload: { activity: result.activity },
        });
      }
    });
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="font-medium text-foreground">
          Atividades
          {activities.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({activities.length})
            </span>
          )}
        </h3>
        <Button size="sm" variant="outline" onClick={handleOpen}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Registrar atividade
        </Button>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12">
          <StickyNote className="h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            Nenhuma atividade registrada.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {activities.map((activity) => {
            const config = ACTIVITY_CONFIG[activity.type];
            const Icon = config.icon;
            return (
              <div key={activity.id} className="group flex gap-3 px-5 py-4">
                <div
                  className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                    config.className
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {config.label}
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                        {formatRelativeDate(activity.created_at)}
                      </span>
                      {activity.author_id === currentUserId && (
                        <button
                          onClick={() => handleDelete(activity.id)}
                          disabled={deletingId === activity.id}
                          aria-label="Excluir atividade"
                          className="rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-destructive focus-visible:text-destructive sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                        >
                          {deletingId === activity.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {activity.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registrar atividade</DialogTitle>
            <DialogDescription>
              Preencha o tipo, descrição e data para registrar uma nova atividade.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="activity-type">Tipo</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="activity-type" className="w-full text-base sm:text-sm">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      <SelectItem value="call">Ligação</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="meeting">Reunião</SelectItem>
                      <SelectItem value="note">Nota</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                placeholder="Descreva o que aconteceu…"
                rows={3}
                aria-invalid={!!errors.description}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {serverError && (
              <p className="text-xs text-destructive">{serverError}</p>
            )}

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Salvando…
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
