export type LeadStatus = "ativo" | "inativo" | "perdido";

export interface Lead {
  id: string;
  workspace_id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  role?: string;
  status: LeadStatus;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export type DealStage =
  | "novo_lead"
  | "contato_realizado"
  | "proposta_enviada"
  | "negociacao"
  | "fechado_ganho"
  | "fechado_perdido";

export interface Deal {
  id: string;
  workspace_id: string;
  title: string;
  lead_id: string;
  stage: DealStage;
  value: number;
  owner_id: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export type ActivityType = "call" | "email" | "meeting" | "note";

export interface Activity {
  id: string;
  workspace_id: string;
  lead_id: string;
  type: ActivityType;
  description: string;
  author_id: string;
  created_at: string;
}

export type WorkspacePlan = "free" | "pro";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  plan: WorkspacePlan;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
}

export type WorkspaceMemberRole = "admin" | "member";

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceMemberRole;
  created_at: string;
}

export interface Invitation {
  id: string;
  workspace_id: string;
  email: string;
  token: string;
  role: WorkspaceMemberRole;
  expires_at: string;
  accepted_at?: string;
  created_at: string;
}
