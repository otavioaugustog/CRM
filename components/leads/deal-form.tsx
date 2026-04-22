"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STAGE_LABELS } from "@/components/kanban/kanban-column";
import type { Deal, DealStage, Lead } from "@/types";

// All fields stay as strings; we coerce value manually in onSubmit
const schema = z.object({
  title: z.string().min(2, "Título deve ter ao menos 2 caracteres"),
  value: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
    message: "Valor inválido",
  }),
  lead_id: z.string().min(1, "Selecione um lead"),
  due_date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface DealFormProps {
  stage: DealStage;
  leads: Lead[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (deal: Deal) => void;
}

export function DealForm({ stage, leads, open, onOpenChange, onSuccess }: DealFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      value: "0",
      lead_id: "",
      due_date: "",
    },
  });

  const leadId = watch("lead_id");

  function onSubmit(data: FormValues) {
    const now = new Date().toISOString();
    const newDeal: Deal = {
      id: `deal-${Date.now()}`,
      workspace_id: "ws-1",
      title: data.title,
      lead_id: data.lead_id,
      stage,
      value: parseFloat(data.value),
      owner_id: "user-1",
      due_date: data.due_date || undefined,
      created_at: now,
      updated_at: now,
    };

    onSuccess(newDeal);
    reset();
    onOpenChange(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-full flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle>Novo Negócio</SheetTitle>
          <SheetDescription>
            Criando na etapa{" "}
            <span className="font-semibold text-foreground">{STAGE_LABELS[stage]}</span>.
          </SheetDescription>
        </SheetHeader>

        <form
          id="deal-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 px-6 py-5 flex-1 overflow-y-auto"
        >
          {/* Etapa (informativo) */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Etapa</Label>
            <p className="text-sm font-medium text-foreground">{STAGE_LABELS[stage]}</p>
          </div>

          {/* Título */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deal-title">Título do negócio</Label>
            <Input
              id="deal-title"
              placeholder="Ex: Implementação de CRM"
              {...register("title")}
              aria-invalid={!!errors.title}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Valor */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deal-value">Valor (R$)</Label>
            <Input
              id="deal-value"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              {...register("value")}
              aria-invalid={!!errors.value}
            />
            {errors.value && (
              <p className="text-xs text-destructive">{errors.value.message}</p>
            )}
          </div>

          {/* Lead */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deal-lead">Lead</Label>
            <Select
              value={leadId}
              onValueChange={(val) => setValue("lead_id", val ?? "", { shouldValidate: true })}
            >
              <SelectTrigger
                id="deal-lead"
                className="w-full"
                aria-invalid={!!errors.lead_id}
              >
                <SelectValue placeholder="Selecione um lead" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    <span>{lead.name}</span>
                    {lead.company && (
                      <span className="text-muted-foreground ml-1">— {lead.company}</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.lead_id && (
              <p className="text-xs text-destructive">{errors.lead_id.message}</p>
            )}
          </div>

          {/* Prazo */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deal-due-date">Prazo</Label>
            <Input
              id="deal-due-date"
              type="date"
              {...register("due_date")}
            />
          </div>
        </form>

        <SheetFooter className="px-6 py-4 border-t border-border flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => handleOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            form="deal-form"
            className="flex-1"
            disabled={isSubmitting}
          >
            Criar negócio
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
