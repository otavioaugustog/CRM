import { notFound } from "next/navigation";
import { Phone, Mail, Building2, Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { fetchLeadById } from "@/app/actions/leads";
import { fetchActivitiesByLead } from "@/app/actions/activities";
import { formatDate, getInitials } from "@/lib/utils";
import { LeadStatusBadge } from "@/components/leads/lead-list";
import { LeadActivityTimeline } from "@/components/leads/lead-activity-timeline";

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
  return (
    <div className="flex flex-col gap-6">
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
          <LeadActivityTimeline leadId={id} initialActivities={activities} />
        </div>
      </div>
    </div>
  );
}
