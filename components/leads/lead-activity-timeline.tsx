"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  PhoneCall,
  CalendarDays,
  StickyNote,
  AtSign,
  Plus,
} from "lucide-react";
import type { Activity, ActivityType } from "@/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
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
import { createActivity } from "@/app/actions/activities";

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

const todayISO = () => new Date().toISOString().slice(0, 10);

const schema = z.object({
  type: z.enum(["call", "email", "meeting", "note"] as const),
  description: z.string().min(1, "Descrição obrigatória"),
  date: z
    .string()
    .optional()
    .refine(
      (v) => !v || new Date(v) <= new Date(todayISO()),
      "A data não pode ser no futuro"
    ),
});

type FormData = z.infer<typeof schema>;

interface LeadActivityTimelineProps {
  leadId: string;
  initialActivities: Activity[];
}

export function LeadActivityTimeline({
  leadId,
  initialActivities,
}: LeadActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: "call", description: "", date: todayISO() },
  });

  function handleOpen() {
    reset({ type: "call", description: "", date: todayISO() });
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
      author_id: "",
      created_at: new Date().toISOString(),
    };

    setActivities((prev) => [optimisticItem, ...prev]);
    setOpen(false);

    startTransition(async () => {
      const result = await createActivity({
        leadId,
        type: data.type,
        description: data.description,
      });

      if (!result.success) {
        setActivities((prev) => prev.filter((a) => a.id !== tempId));
        setServerError(result.error ?? "Erro ao registrar atividade");
        setOpen(true);
        return;
      }

      if (result.activity) {
        setActivities((prev) =>
          prev.map((a) => (a.id === tempId ? result.activity! : a))
        );
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
              <div key={activity.id} className="flex gap-3 px-5 py-4">
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
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeDate(activity.created_at)}
                    </span>
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
                    <SelectTrigger id="activity-type" className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
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

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                max={todayISO()}
                aria-invalid={!!errors.date}
                {...register("date")}
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
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
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando…" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
