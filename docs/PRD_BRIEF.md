# PipeFlow CRM — Claude Code Briefing

SaaS multi-empresa de gestão de vendas com pipeline Kanban. Stack: Next.js 14 App Router + Supabase + Stripe + TypeScript. PRD completo em `docs/PRD.md`.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS + shadcn/ui |
| Linguagem | TypeScript 5 |
| Banco / Auth | Supabase (PostgreSQL + RLS + Auth) |
| Pagamentos | Stripe (Checkout + Webhooks + Customer Portal) |
| E-mail | Resend |
| Drag-and-drop | @dnd-kit/core |
| Gráficos | Recharts |
| Formulários | React Hook Form + Zod |
| Deploy | Vercel (frontend) + Supabase Cloud (backend) |

---

## Estrutura de Pastas

```
pipeflow-crm/
├── app/
│   ├── (auth)/                     # login, signup, forgot-password
│   ├── (dashboard)/                # área autenticada
│   │   ├── layout.tsx              # Sidebar + WorkspaceSwitcher
│   │   ├── page.tsx                # Dashboard de métricas
│   │   ├── leads/[id]/             # Listagem e detalhe de leads
│   │   ├── pipeline/               # Kanban board
│   │   ├── settings/billing/       # Workspace settings + planos
│   │   └── invite/[token]/         # Aceite de convite
│   ├── (public)/                   # Landing page
│   └── api/
│       ├── webhooks/stripe/        # Webhook handler
│       └── invites/                # Envio de convites
├── components/
│   ├── ui/                         # shadcn/ui (auto-gerados)
│   ├── kanban/                     # Board, Column, Card, DragOverlay
│   ├── leads/                      # LeadForm, LeadList, ActivityTimeline
│   ├── dashboard/                  # MetricCard, FunnelChart
│   └── shared/                     # Sidebar, Header, WorkspaceSwitcher
├── lib/
│   ├── supabase/                   # client.ts, server.ts, middleware.ts
│   ├── stripe/                     # client.ts, webhooks.ts
│   ├── resend/emails/              # Templates React Email
│   └── utils.ts                    # cn(), formatCurrency()
├── hooks/                          # useLeads, usePipeline, useWorkspace
├── types/index.ts                  # Tipos globais: Lead, Deal, Activity, Workspace
├── supabase/
│   ├── migrations/                 # SQL migrations numeradas
│   └── functions/                  # Edge Functions
├── middleware.ts                   # Auth guard
└── docs/PRD.md                     # PRD completo
```

---

## Convenções

**Arquivos e pastas:** `kebab-case` → `lead-detail.tsx`, `use-pipeline.ts`

**Código:**
- Componentes: `PascalCase` → `LeadCard`, `KanbanBoard`
- Hooks: `camelCase` com prefixo `use` → `useLeads`, `useWorkspace`
- Funções: `camelCase` → `formatCurrency`, `getInitials`
- Tipos: `PascalCase` → `Lead`, `Deal`, `WorkspaceMember`
- Constantes: `SCREAMING_SNAKE_CASE` → `MAX_FREE_LEADS`
- Env vars: `SCREAMING_SNAKE_CASE` → `NEXT_PUBLIC_SUPABASE_URL`

**Commits (Conventional Commits):**
```
feat: adicionar drag-and-drop no kanban
fix: corrigir filtro de leads por responsável
chore: atualizar dependências
```

**Branches:** `feat/kanban-drag-drop`, `fix/stripe-webhook-signature`

---

## Identidade Visual

**Paleta de cores:**

| Token | Hex | Uso |
|---|---|---|
| Primária | `#4F46E5` indigo-600 | Botões, links, CTAs |
| Primária hover | `#4338CA` indigo-700 | Estado hover |
| Sucesso | `#10B981` emerald-500 | "Fechado Ganho" |
| Perigo | `#F43F5E` rose-500 | "Fechado Perdido", erros |
| Alerta | `#F59E0B` amber-500 | Prazos próximos |
| Background | `#F8FAFC` slate-50 | Fundo geral |
| Surface | `#FFFFFF` | Cards, modais, sidebar |
| Border | `#E2E8F0` slate-200 | Divisores, bordas |
| Texto | `#0F172A` slate-900 | Títulos e corpo |

**Tipografia:** Inter (Google Fonts via `next/font/google`)

**Border radius:** `rounded-lg` (8px) padrão; `rounded-md` para inputs; `rounded-full` para avatares

**Etapas do Kanban:**
- Novo Lead → `bg-slate-100`
- Contato Realizado → `bg-blue-50`
- Proposta Enviada → `bg-violet-50`
- Negociação → `bg-amber-50`
- Fechado Ganho → `bg-emerald-50`
- Fechado Perdido → `bg-rose-50`

---

## Modelo de Dados (Supabase)

```sql
workspaces        (id, name, slug, plan, stripe_customer_id, stripe_subscription_id)
workspace_members (id, workspace_id, user_id, role: 'admin'|'member')
leads             (id, workspace_id, name, email, phone, company, role, status, owner_id)
deals             (id, workspace_id, title, lead_id, stage, value, owner_id, due_date)
activities        (id, workspace_id, lead_id, type: 'call'|'email'|'meeting'|'note', description, author_id)
invitations       (id, workspace_id, email, token, role, expires_at, accepted_at)
```

RLS ativo em todas as tabelas — isolamento por `workspace_id`.

---

## Variáveis de Ambiente

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Planos

| Plano | Limite | Preço |
|---|---|---|
| Free | 2 colaboradores, 50 leads | Grátis |
| Pro | Ilimitado | R$49/mês |

---

## Milestones

1. Setup & Auth — Next.js + Supabase Auth + middleware
2. Multi-workspace — CRUD + convite por e-mail + troca de workspace
3. Gestão de Leads — CRUD + filtros + busca
4. Kanban Pipeline — drag-and-drop + persistência
5. Atividades — timeline no detalhe do lead
6. Dashboard — métricas + gráfico de funil
7. Monetização — Stripe Checkout + webhook + Customer Portal
8. Landing Page — hero, features, pricing, CTA
9. Polish & Deploy — responsividade, SEO, Vercel + Supabase Cloud
