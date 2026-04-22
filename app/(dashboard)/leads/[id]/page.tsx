"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Phone,
  Mail,
  Building2,
  Briefcase,
  PhoneCall,
  CalendarDays,
  StickyNote,
  AtSign,
} from "lucide-react";
import type { ActivityType } from "@/types";
import { MOCK_LEADS, MOCK_ACTIVITIES, MOCK_USER } from "@/lib/mock-data";
import { cn, formatDate, formatRelativeDate, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LeadStatusBadge } from "@/components/leads/lead-list";

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

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const lead = MOCK_LEADS.find((l) => l.id === id);
  const activities = MOCK_ACTIVITIES.filter((a) => a.lead_id === id).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-muted-foreground">Lead não encontrado.</p>
        <Button variant="outline" onClick={() => router.push("/leads")}>
          <ArrowLeft className="h-4 w-4" />
          Voltar para leads
        </Button>
      </div>
    );
  }

  const initials = getInitials(lead.name);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => router.push("/leads")}
          aria-label="Voltar"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-foreground">{lead.name}</h2>
          <p className="text-sm text-muted-foreground">Detalhe do lead</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Perfil */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          <div className="rounded-lg border border-border bg-card p-5">
            {/* Avatar */}
            <div className="mb-4 flex flex-col items-center gap-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                {initials}
              </div>
              <div>
                <p className="font-semibold text-foreground">{lead.name}</p>
                {lead.role && (
                  <p className="text-sm text-muted-foreground">{lead.role}</p>
                )}
                <div className="mt-1.5 flex justify-center">
                  <LeadStatusBadge status={lead.status} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-border pt-4">
              {lead.company && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">{lead.company}</span>
                </div>
              )}
              {lead.role && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="text-foreground">{lead.role}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <a
                  href={`mailto:${lead.email}`}
                  className="truncate text-foreground hover:text-primary hover:underline"
                >
                  {lead.email}
                </a>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <a
                    href={`tel:${lead.phone}`}
                    className="text-foreground hover:text-primary hover:underline"
                  >
                    {lead.phone}
                  </a>
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                Criado em {formatDate(lead.created_at)}
              </p>
              {lead.updated_at !== lead.created_at && (
                <p className="text-xs text-muted-foreground">
                  Atualizado em {formatDate(lead.updated_at)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline de atividades */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <h3 className="font-medium text-foreground">
                Atividades
                {activities.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({activities.length})
                  </span>
                )}
              </h3>
            </div>

            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <StickyNote className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma atividade registrada.
                </p>
                <p className="text-xs text-muted-foreground">
                  As atividades serão exibidas aqui quando implementadas.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {activities.map((activity, idx) => {
                  const config = ACTIVITY_CONFIG[activity.type];
                  const Icon = config.icon;
                  return (
                    <div
                      key={activity.id}
                      className={cn(
                        "flex gap-3 px-5 py-4",
                        idx === 0 && "rounded-t-none"
                      )}
                    >
                      {/* Ícone do tipo */}
                      <div
                        className={cn(
                          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                          config.className
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>

                      <div className="flex flex-1 flex-col gap-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-foreground">
                            {config.label}
                          </span>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatRelativeDate(activity.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          por {MOCK_USER.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
