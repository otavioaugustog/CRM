import { notFound } from "next/navigation";
import {
  Phone,
  Mail,
  Building2,
  Briefcase,
  PhoneCall,
  CalendarDays,
  StickyNote,
  AtSign,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import type { ActivityType } from "@/types";
import { fetchLeadById } from "@/app/actions/leads";
import { fetchActivitiesByLead } from "@/app/actions/activities";
import { cn, formatDate, formatRelativeDate, getInitials } from "@/lib/utils";
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

interface Props {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: Props) {
  const { id } = await params;
  const [lead, activities] = await Promise.all([
    fetchLeadById(id),
    fetchActivitiesByLead(id),
  ]);

  if (!lead) notFound();

  const initials = getInitials(lead.name);
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/leads"
          aria-label="Voltar"
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-semibold text-foreground">{lead.name}</h2>
          <p className="text-sm text-muted-foreground">Detalhe do lead</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Perfil */}
        <div className="flex flex-col gap-4 lg:col-span-1">
          <div className="rounded-lg border border-border bg-card p-5">
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
                {sortedActivities.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({sortedActivities.length})
                  </span>
                )}
              </h3>
            </div>

            {sortedActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <StickyNote className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma atividade registrada.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sortedActivities.map((activity, idx) => {
                  const config = ACTIVITY_CONFIG[activity.type];
                  const Icon = config.icon;
                  return (
                    <div
                      key={activity.id}
                      className={cn("flex gap-3 px-5 py-4", idx === 0 && "rounded-t-none")}
                    >
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
