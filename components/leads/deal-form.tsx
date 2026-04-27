"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { cn } from "@/lib/utils";
import { STAGE_LABELS } from "@/components/kanban/kanban-column";
import type { Deal, DealStage, Lead } from "@/types";

// Converte número para exibição PT-BR: 1234567.89 → "1.234.567,89"
function toDisplay(value: number): string {
  if (value === 0) return "";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Converte string formatada PT-BR de volta para número: "1.234.567,89" → 1234567.89
function fromDisplay(display: string): number {
  const clean = display.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(clean);
  return isNaN(n) ? 0 : n;
}

// Formata o input enquanto o usuário digita
function formatInput(raw: string): string {
  // Aceita apenas dígitos e vírgula
  const cleaned = raw.replace(/[^\d,]/g, "");
  const [intPart, ...rest] = cleaned.split(",");
  const decPart = rest.join("").slice(0, 2); // máx 2 casas decimais

  // Adiciona pontos como separador de milhar no inteiro
  const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

  return cleaned.includes(",") ? `${intFormatted},${decPart}` : intFormatted;
}

const schema = z.object({
  title: z.string().min(2, "Título deve ter ao menos 2 caracteres"),
  value: z.string().refine((v) => {
    const n = fromDisplay(v);
    return !isNaN(n) && n >= 0;
  }, { message: "Valor inválido" }),
  lead_id: z.string().min(1, "Selecione um lead"),
  due_date: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface DealFormProps {
  stage: DealStage;
  leads: Lead[];
  open: boolean;
  deal?: Deal;
  onOpenChange: (open: boolean) => void;
  onSuccess: (data: {
    title: string;
    lead_id: string;
    value: number;
    due_date?: string;
  }) => Promise<void>;
}

export function DealForm({ stage, leads, open, deal, onOpenChange, onSuccess }: DealFormProps) {
  const isEditing = !!deal;

  const [displayValue, setDisplayValue] = useState<string>(
    deal?.value ? toDisplay(deal.value) : ""
  );

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    deal?.due_date ? parseISO(deal.due_date) : undefined
  );
  const [calendarOpen, setCalendarOpen] = useState(false);

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
      title: deal?.title ?? "",
      value: deal?.value != null ? toDisplay(deal.value) : "",
      lead_id: deal?.lead_id ?? "",
      due_date: deal?.due_date ?? "",
    },
  });

  const leadId = watch("lead_id");

  function handleValueChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatInput(e.target.value);
    setDisplayValue(formatted);
    setValue("value", formatted, { shouldValidate: true });
  }

  function handleDateSelect(date: Date | undefined) {
    setSelectedDate(date);
    setValue("due_date", date ? format(date, "yyyy-MM-dd") : "", { shouldValidate: true });
    setCalendarOpen(false);
  }

  function clearDate() {
    setSelectedDate(undefined);
    setValue("due_date", "");
  }

  async function onSubmit(data: FormValues) {
    await onSuccess({
      title: data.title,
      lead_id: data.lead_id,
      value: fromDisplay(data.value),
      due_date: data.due_date || undefined,
    });
    reset();
    setDisplayValue("");
    setSelectedDate(undefined);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      reset();
      setDisplayValue(deal?.value ? toDisplay(deal.value) : "");
      setSelectedDate(deal?.due_date ? parseISO(deal.due_date) : undefined);
    }
    onOpenChange(nextOpen);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="sm:max-w-md w-full flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <SheetTitle>{isEditing ? "Editar Negócio" : "Novo Negócio"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Atualize os dados do negócio."
              : <>Criando na etapa{" "}<span className="font-semibold text-foreground">{STAGE_LABELS[stage]}</span>.</>}
          </SheetDescription>
        </SheetHeader>

        <form
          id="deal-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 px-6 py-5 flex-1 overflow-y-auto"
        >
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

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deal-value">Valor (R$)</Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                R$
              </span>
              <Input
                id="deal-value"
                type="text"
                inputMode="decimal"
                placeholder="0"
                className="pl-9"
                value={displayValue}
                onChange={handleValueChange}
                onFocus={(e) => e.target.select()}
                aria-invalid={!!errors.value}
              />
            </div>
            {errors.value && (
              <p className="text-xs text-destructive">{errors.value.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="deal-lead">Lead</Label>
            <Select
              value={leadId}
              onValueChange={(val) => setValue("lead_id", val ?? "", { shouldValidate: true })}
            >
              <SelectTrigger id="deal-lead" className="w-full" aria-invalid={!!errors.lead_id}>
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

          <div className="flex flex-col gap-1.5">
            <Label>Prazo</Label>
            <div className="flex gap-2">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger
                  className={cn(
                    "flex h-9 flex-1 items-center justify-start gap-2 rounded-md border border-input bg-background px-3 text-sm",
                    "hover:bg-accent transition-colors",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="size-4 shrink-0" />
                  {selectedDate
                    ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : "Selecione uma data"}
                </PopoverTrigger>
                <PopoverContent side="bottom" align="start" className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {selectedDate && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={clearDate}
                  aria-label="Limpar prazo"
                >
                  <XIcon className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </form>

        <SheetFooter className="px-6 py-4 border-t border-border flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" form="deal-form" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (isEditing ? "Salvando…" : "Criando…") : (isEditing ? "Salvar" : "Criar negócio")}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
