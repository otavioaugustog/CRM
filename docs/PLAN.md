# PipeFlow CRM — Plano de Execução

> Estratégia: **interface primeiro, backend depois**. Cada milestone entrega uma fatia vertical funcional — UI construída com dados mock/estáticos, depois conectada ao Supabase. Isso permite validar o produto visualmente antes de investir em banco e lógica de negócio.

---

## Visão Geral

| # | Milestone | Branch | Foco |
|---|---|---|---|
| 1 | Setup & Fundação ✅ | `feat/setup` | Projeto, design system, layout shell |
| 2 | Auth — UI ✅ | `feat/auth-ui` | Telas de login/signup com dados mock |
| 3 | Auth — Backend ✅ | `feat/auth-backend` | Supabase Auth + middleware + sessão real |
| 4 | Leads — UI ✅ | `feat/leads-ui` | Listagem, formulário e detalhe com mock |
| 5 | Leads — Backend ✅ | `feat/leads-data` | CRUD real + RLS + filtros no banco (PR #5) |
| 6 | Kanban — UI ✅ | `feat/kanban-ui` | Board drag-and-drop com dados mock |
| 7 | Kanban — Backend ✅ | `feat/leads-data` | Deals reais + persistência de stage (PR #5) |
| 8 | Atividades — UI ✅ | `feat/collaboration` | Timeline e formulário de atividade mock |
| 9 | Atividades — Backend ✅ | `feat/collaboration` | CRUD de atividades + RLS |
| 10 | Dashboard — UI ✅ | `feat/dashboard-ui` | Cards de métricas e gráfico com mock |
| 11 | Dashboard — Backend ✅ | `feat/leads-data` | Queries reais de agregação (PR #5) |
| 12 | Workspace — UI | `feat/workspace-ui` | Switcher, settings e convite mock |
| 13 | Workspace — Backend | `feat/workspace-backend` | Multi-workspace real + Resend + RLS |
| 14 | Monetização | `feat/monetization` | Stripe Checkout + webhook + planos |
| 15 | Landing Page ✅ | `feat/landing-page` | Página pública de apresentação |
| 16 | Polish & Deploy | `chore/deploy` | Responsividade, SEO, Vercel + Supabase Cloud |

---

## M1 — Setup & Fundação ✅

**Branch:** `feat/setup` → merged em `main`
**Objetivo:** Projeto Next.js 14 configurado com Tailwind, shadcn/ui, tipos globais e layout shell da área autenticada (sem lógica real).

### Entregas

- [x] `npx create-next-app@latest` com TypeScript, Tailwind, App Router
- [x] Instalar e configurar shadcn/ui (`npx shadcn-ui@latest init`)
- [x] Configurar fonte Inter via `next/font/google`
- [x] Tokens de cor customizados no `globals.css` (Tailwind v4 — indigo, slate, emerald, rose, amber)
- [x] Criar `types/index.ts` com tipos: `Lead`, `Deal`, `Activity`, `Workspace`, `WorkspaceMember`, `Invitation`
- [x] Criar `lib/utils.ts` com `cn()`, `formatCurrency()` e `getInitials()`
- [x] Criar estrutura de pastas completa conforme PRD (vazia, com `.gitkeep`)
- [x] Criar `app/(dashboard)/layout.tsx` com `Sidebar` e `Header` estáticos
- [x] Criar `components/shared/sidebar.tsx` com links de navegação (sem auth)
- [x] Criar `components/shared/header.tsx` com avatar placeholder
- [x] Criar `.env.example` com todas as variáveis necessárias
- [x] Criar `app/(dashboard)/page.tsx` com placeholder "Dashboard em breve"
- [x] Verificar que `npm run dev` sobe sem erros e layout shell é visível

**Commit final:**
```
feat: setup inicial — Next.js 14, shadcn/ui, design tokens e layout shell
```

> **Nota:** create-next-app instalou Next.js 16 e Tailwind v4 (latest). Tokens de cor definidos em `globals.css` via CSS custom properties em vez de `tailwind.config.ts` (padrão Tailwind v4).

---

## M2 — Auth — UI ✅

**Branch:** `feat/auth-ui` → merged em `main`
**Objetivo:** Telas de login, cadastro e recuperação de senha com formulários validados, sem conexão com Supabase ainda.

### Entregas

- [x] Criar `app/(auth)/login/page.tsx` com form e-mail + senha
- [x] Criar `app/(auth)/signup/page.tsx` com form nome + e-mail + senha + confirmação
- [x] Criar `app/(auth)/forgot-password/page.tsx` com form e-mail
- [x] Validação dos formulários com React Hook Form + Zod
- [x] Feedback visual: loading state no botão, mensagens de erro inline
- [x] Redirecionar para `/` (dashboard) ao submeter (mock — sem auth real)
- [x] Layout da área de auth: logo PipeFlow, card centralizado, fundo slate-50
- [x] Link "Já tem conta? Entrar" / "Não tem conta? Cadastre-se" entre páginas
- [x] Responsivo: funcional em mobile e desktop

**Commit final:**
```
feat: telas de auth (login, signup, forgot-password) com validação Zod
```

---

## M3 — Auth — Backend ✅

**Branch:** `feat/auth-backend` → merged em `main`
**Objetivo:** Conectar formulários de auth ao Supabase Auth. Sessão persistente, middleware de proteção de rotas, redirect automático.

### Entregas

- [x] Instalar `@supabase/ssr` e `@supabase/supabase-js` *(feat/supabase-core — PR #3)*
- [x] Criar `lib/supabase/client.ts` (`createBrowserClient`) *(feat/supabase-core — PR #3)*
- [x] Criar `lib/supabase/server.ts` (`createServerClient` com cookies) *(feat/supabase-core — PR #3)*
- [x] Migrations & RLS — schema completo aplicado no Supabase *(feat/supabase-core — PR #4)*
  - [x] `001_workspaces.sql`: workspaces + workspace_members, trigger bootstrap admin, `get_user_workspace_ids()`
  - [x] `002_leads.sql`: leads, índice GIN full-text, RLS CRUD para membros
  - [x] `003_deals.sql`: deals, índice por stage (kanban), RLS — DELETE restrito a admins
  - [x] `004_activities.sql`: activities, índice de timeline, RLS — DELETE restrito ao autor
  - [x] `005_invitations.sql`: invitations, token hex, `accept_invitation()` SECURITY DEFINER, partial unique index
  - [x] `types/supabase.ts`: Database type (Row/Insert/Update) para supabase-js v2
  - [x] Clientes `lib/supabase/{client,server}.ts` tipados com `Database`
- [x] Criar `proxy.ts` com proteção de rotas (Next.js 16 — substitui `middleware.ts` depreciado)
- [x] Conectar form de signup → `supabase.auth.signUp()` + tela "verifique seu e-mail"
- [x] Conectar form de login → `supabase.auth.signInWithPassword()`
- [x] Conectar form de forgot-password → `supabase.auth.resetPasswordForEmail()`
- [x] Redirect pós-login para `/dashboard`
- [x] Redirect pós-logout para `/login` via Server Action `signOut()`
- [x] Botão "Sair" no Header conectado ao `signOut()` Server Action
- [x] Exibir nome e e-mail do usuário logado no Header
- [x] Criar `/api/auth/callback` — troca PKCE code por sessão, respeita `?next=`
- [x] Criar `/onboarding` — criação de workspace + trigger insere admin automaticamente
- [x] Guard no `app/(dashboard)/layout.tsx` — sem workspace → redirect `/onboarding`
- [x] `007_perf_and_security.sql` — RLS com `(select auth.uid())` + índices FK faltantes
- [x] Testar fluxo completo: registro → confirmação → onboarding → dashboard → logout
- [x] Verificado no Supabase: usuário confirmado, workspace e membro admin criados

**Commit final:**
```
feat: auth backend — Supabase Auth, proxy, onboarding e proteção de rotas
```

---

## M4 — Leads — UI ✅

**Branch:** `feat/leads-ui` → merged em `main`
**Objetivo:** Listagem de leads com filtros, formulário de criação/edição e página de detalhe — tudo com dados mock estáticos.

### Entregas

- [x] Criar `app/(dashboard)/leads/page.tsx` com tabela de leads
- [x] Criar `components/leads/lead-list.tsx` com colunas: Nome, Empresa, E-mail, Status, Responsável, Data
- [x] Filtros na listagem: por status (dropdown), busca por nome/empresa (input)
- [x] Botão "Novo Lead" abre `Sheet` (shadcn) com `LeadForm`
- [x] Criar `components/leads/lead-form.tsx` com campos: nome, e-mail, telefone, empresa, cargo, status
- [x] Validação do form com Zod + React Hook Form
- [x] Criar `app/(dashboard)/leads/[id]/page.tsx` com perfil do lead
- [x] Seção de perfil: avatar com iniciais, nome, empresa, cargo, e-mail, telefone, status badge
- [x] Placeholder de timeline de atividades (sem dados ainda — "Nenhuma atividade registrada")
- [x] Navegação: clicar em lead na listagem vai para detalhe; botão "Voltar"
- [x] Dados mock: array de 5–10 leads hardcoded para visualização
- [x] Badge de status com cores: Ativo (emerald), Inativo (slate), Perdido (rose)

**Commit final:**
```
feat: leads UI — listagem com filtros, formulário e página de detalhe (mock)
```

---

## M5 — Leads — Backend ✅

**Branch:** `feat/leads-data` → merged em `main` (PR #5)
**Objetivo:** Substituir dados mock por CRUD real no Supabase com RLS por workspace.

### Entregas

- [x] Migrations aplicadas: `leads` com RLS (SELECT/INSERT/UPDATE/DELETE por workspace_id)
- [x] Criar `app/actions/leads.ts` — Server Actions: `fetchLeads`, `fetchLeadById`, `createLead`, `updateLead`, `deleteLead`
- [x] `fetchLeads`: busca com `.or(ilike)` em nome/empresa/email + filtro por status
- [x] Conectar `leads/page.tsx` — substituiu MOCK_LEADS, carrega via Server Action
- [x] Conectar `lead-form.tsx` ao `createLead` e `updateLead` (onSuccess assíncrono)
- [x] Implementar filtro por status com query no Supabase
- [x] Implementar busca full-text (ilike) com debounce de 350ms
- [x] Estado de loading: `TableSkeleton` (5 linhas) enquanto carrega
- [x] Estado vazio diferenciado: sem dados vs sem resultados de filtro
- [x] `leads/[id]/page.tsx` convertido para Server Component com `fetchLeadById`
- [x] Criado `lib/get-workspace-id.ts` — resolve workspace via cookie ou query Supabase
- [x] Testado: lead criado persiste após reload; filtros funcionam no banco

**Commit final:**
```
feat: leads backend — CRUD real, RLS por workspace, filtros e busca
```

---

## M6 — Kanban — UI ✅

**Branch:** `feat/kanban-ui` → merged em `main`
**Objetivo:** Board Kanban com drag-and-drop visual entre colunas usando dados mock.

### Entregas

- [x] Instalar `@dnd-kit/core` e `@dnd-kit/sortable`
- [x] Criar `app/(dashboard)/pipeline/page.tsx`
- [x] Criar `components/kanban/kanban-board.tsx` com `DndContext`
- [x] Criar `components/kanban/kanban-column.tsx` com `useDroppable` — 6 colunas fixas
- [x] Criar `components/kanban/kanban-card.tsx` com `useDraggable` — título, valor, lead, prazo
- [x] Criar `components/kanban/kanban-drag-overlay.tsx` — clone do card durante drag
- [x] Cores de header por coluna conforme design tokens (slate, blue, violet, amber, emerald, rose)
- [x] Scroll horizontal no board quando colunas excedem a tela
- [x] Contador de cards por coluna no header da coluna
- [x] Botão "+" em cada coluna abre `Sheet` com form de novo deal
- [x] Criar `components/leads/deal-form.tsx` com campos: título, valor (R$), lead vinculado, prazo
- [x] Dados mock: 8–10 deals distribuídos entre colunas
- [x] Drag funcional entre colunas (estado local, sem persistência ainda)

**Commit final:**
```
feat: kanban UI — board drag-and-drop com 6 colunas e cards (mock)
```

---

## M7 — Kanban — Backend ✅

**Branch:** `feat/leads-data` → merged em `main` (PR #5)
**Objetivo:** Persistir deals e mudanças de stage no Supabase. Kanban reflete dados reais.

### Entregas

- [x] Migrations aplicadas: `deals` com RLS (SELECT/INSERT/UPDATE por membros; DELETE por admin)
- [x] Criar `app/actions/deals.ts` — Server Actions: `fetchDeals`, `createDeal`, `moveDeal`
- [x] `moveDeal`: atualiza `stage` + `updated_at` no banco, guardado por `workspace_id`
- [x] Conectar `kanban-board.tsx` — substituiu MOCK_DEALS, carrega via `Promise.all([fetchDeals, fetchLeads])`
- [x] Conectar `deal-form.tsx` ao `createDeal` (onSuccess assíncrono)
- [x] Optimistic update: card move imediatamente na UI, rollback com `previousStageRef` se query falhar
- [x] Estado de loading: 6 colunas placeholder skeleton durante fetch inicial
- [x] Testado: criar deal no board persiste após reload; arrastar entre colunas persiste stage

**Commit final:**
```
feat: kanban backend — deals reais, persistência de stage com otimistic update
```

---

## M8 — Atividades — UI ✅

**Branch:** `feat/collaboration` → merged em `main`
**Objetivo:** Timeline de atividades na página de detalhe do lead e formulário de registro.

### Entregas

- [x] Criar `components/leads/lead-activity-timeline.tsx`
- [x] Exibir atividades em ordem cronológica decrescente
- [x] Ícone por tipo: telefone (ligação), envelope (e-mail), calendário (reunião), nota (nota)
- [x] Cada item: tipo, descrição, data formatada ("há 2 horas", "ontem")
- [x] Botão "Registrar atividade" abre `Dialog` com form inline
- [x] Form: tipo (Select), descrição (Textarea), data (input date com max=hoje)
- [x] Validação com Zod: descrição obrigatória, data não pode ser futura
- [x] Integrar timeline na `app/(dashboard)/leads/[id]/page.tsx`

**Notas:**
- Backend conectado diretamente (migração `004_activities.sql` já existia desde M3)
- Dados mock substituídos por dados reais — padrão adotado em M5/M7
- Bug corrigido: `lib/limits.ts` importava `next/headers` no bundle cliente; constante `FREE_LIMITS` extraída para `lib/plan-config.ts`

**Commit final:**
```
feat: atividades UI — timeline cronológica e formulário de registro (mock)
```

---

## M9 — Atividades — Backend ✅

**Branch:** `feat/collaboration` → merged em `main` (junto com M8)
**Objetivo:** Persistir atividades no Supabase e exibi-las em tempo real na timeline.

### Entregas

- [x] Migration `004_activities.sql`: tabela `activities` + RLS policies (aplicada em M3)
- [x] RLS: membros do workspace podem `SELECT` e `INSERT`; autor pode `DELETE`
- [x] `app/actions/activities.ts`: `fetchActivitiesByLead` + `createActivity`
- [x] Timeline carrega atividades reais do lead via Server Action
- [x] Formulário conectado ao `createActivity` com estado otimista
- [x] `useTransition` para loading state no submit

**Commit final:**
```
feat: atividades backend — CRUD real com RLS e timeline conectada ao Supabase
```

---

## M10 — Dashboard — UI ✅

**Branch:** `feat/dashboard-ui` → merged em `main`
**Objetivo:** Dashboard com cards de métricas e gráfico de funil de vendas usando dados mock.

### Entregas

- [x] Criar `components/dashboard/metric-card.tsx` — card com título, valor, ícone e variação %
- [x] 4 cards na `app/(dashboard)/page.tsx`: Total de Leads, Negócios Abertos, Valor do Pipeline (R$), Taxa de Conversão
- [x] Instalar `recharts`
- [x] Criar `components/dashboard/funnel-chart.tsx` com `BarChart` horizontal mostrando volume por etapa
- [x] Seção "Meus Negócios com Prazo Próximo" — lista de até 5 deals com badge de urgência
- [x] Cores do gráfico alinhadas aos tokens das etapas do Kanban
- [x] Dados mock realistas: valores, percentuais e deals hardcoded
- [x] Layout responsivo: 2 colunas em desktop, 1 em mobile para os cards

**Commit final:**
```
feat: dashboard UI — metric cards, gráfico de funil e deals com prazo (mock)
```

---

## M11 — Dashboard — Backend ✅

**Branch:** `feat/leads-data` → merged em `main` (PR #5)
**Objetivo:** Substituir mock por queries reais de agregação no Supabase.

### Entregas

- [x] `dashboard/page.tsx` convertido para Server Component com `getDashboardData()`
- [x] Query: `COUNT(leads)` por workspace → "Total de Leads"
- [x] Query: deals abertos (excluindo fechado_ganho e fechado_perdido) → "Negócios Abertos"
- [x] Query: `SUM(deals.value)` de todos os deals do workspace → "Valor do Pipeline"
- [x] Taxa de conversão = `fechado_ganho / (fechado_ganho + fechado_perdido) * 100`
- [x] `COUNT(deals) GROUP BY stage` para o gráfico de funil (via JS aggregation)
- [x] Deals com `due_date` nos próximos 7 dias para "Negócios com Prazo Próximo"
- [x] `parseLocalDate` para evitar shift de fuso horário (UTC vs UTC-3) em datas YYYY-MM-DD
- [x] `Promise.all` para 3 queries paralelas sem waterfall
- [x] `FunnelChart` e `UpcomingDeals` convertidos para aceitar props dinâmicas
- [x] `MetricCard.change` tornado opcional — trend só renderiza quando definido

**Commit final:**
```
feat: dashboard backend — métricas e funil com queries reais de agregação
```

---

## M12 — Workspace — UI

**Branch:** `feat/workspace-ui`
**Objetivo:** Interface de multi-workspace: switcher na sidebar, página de settings e fluxo de convite mock.

### Entregas

- [ ] Criar `components/shared/workspace-switcher.tsx` — dropdown com lista de workspaces + "Criar workspace"
- [ ] Integrar switcher no topo da `Sidebar`
- [ ] Criar `app/(dashboard)/settings/page.tsx` — form de edição do workspace (nome, slug)
- [ ] Criar `app/(dashboard)/settings/billing/page.tsx` — exibir plano atual, botão "Fazer upgrade"
- [ ] Seção "Membros" em settings: tabela com nome, e-mail, papel (Admin/Membro) e botão remover
- [ ] Botão "Convidar membro" abre Dialog com input de e-mail e seletor de papel
- [ ] Criar `app/(dashboard)/invite/[token]/page.tsx` — página de aceite de convite com nome do workspace
- [ ] Mock: aceitar convite redireciona para `/` sem lógica real
- [ ] Criar `app/(public)/page.tsx` placeholder para a landing (será desenvolvida em M15)

**Commit final:**
```
feat: workspace UI — switcher, settings de membros e fluxo de convite (mock)
```

---

## M13 — Workspace — Backend

**Branch:** `feat/workspace-backend`
**Objetivo:** Multi-workspace real: criar, alternar, convidar colaboradores por e-mail com Resend, RLS completo.

### Entregas

- [ ] Criar migration `004_workspaces.sql`: tabelas `workspaces`, `workspace_members`, `invitations` + RLS
- [ ] RLS: todos os dados (leads, deals, activities) filtrados por `workspace_id` do membro logado
- [ ] Criar hook `hooks/use-workspace.ts`: `getWorkspaces`, `createWorkspace`, `switchWorkspace`
- [ ] `WorkspaceSwitcher` carrega workspaces reais do usuário
- [ ] "Criar workspace" → cria registro + adiciona criador como Admin
- [ ] Instalar `resend` e criar `lib/resend/emails/invite-email.tsx` (React Email)
- [ ] Criar `app/api/invites/route.ts` — envia e-mail de convite via Resend com link + token único
- [ ] Página `/invite/[token]` valida token, exibe workspace, confirma aceite e cria `workspace_member`
- [ ] Settings: remover membro deleta `workspace_member`
- [ ] Controle de plano Free: bloquear convite se já houver 2 membros (exibir upgrade CTA)
- [ ] Testar: criar workspace, convidar por e-mail, aceitar convite, alternar entre workspaces

**Commit final:**
```
feat: workspace backend — multi-tenant real, convites por email com Resend e RLS
```

---

## M14 — Monetização ✅

**Branch:** `feat/billing-nextjs` → merged em `main` (PR #6)
**Objetivo:** Stripe Checkout, webhook para ativar plano Pro, Customer Portal para gerenciar assinatura.

### Entregas

- [x] Instalar `stripe`
- [x] Criar `lib/stripe/client.ts` — instância do Stripe
- [x] Criar produto e preço no Stripe Dashboard (R$49/mês recorrente)
- [x] Criar `app/api/webhooks/stripe/route.ts` — Route Handler com verificação de assinatura HMAC
- [x] Eventos: `checkout.session.completed` → Pro; `customer.subscription.deleted` → Free; `invoice.payment_failed` → log
- [x] Webhook atualiza `workspaces.plan`, `stripe_customer_id` e `stripe_subscription_id`
- [x] `subscription_data.metadata` propaga `workspace_id` e `user_id` para invoices
- [x] Checkout e Portal via Server Actions (`app/actions/stripe.ts`) — padrão do projeto
- [x] Botão "Assinar Pro" na billing page dispara checkout
- [x] Botão "Gerenciar assinatura" aparece para plano Pro e abre Customer Portal
- [x] Página de billing exibe plano atual, usage meters (leads/membros) e comparação Free vs Pro
- [x] `lib/limits.ts` — `FREE_LIMITS`, `canAddLead()`, `canAddMember()` como fonte única da verdade
- [x] `createLead` guarda `canAddLead()`; retorna `limitReached: true` ao atingir 50
- [x] Banners amarelo (≥80%) e vermelho (100%) na página de leads com link para billing
- [x] Modal de upgrade ao tentar criar lead no limite
- [x] `canAddMember()` no route de convites substituiu código duplicado
- [x] Sidebar badge FREE/PRO dinâmico via `onPlanChange` no `WorkspaceSwitcher`
- [x] Testado: checkout com cartão de teste Stripe, ativação do Pro via webhook

**Notas:**
- Bug encontrado e corrigido: `BILLING_URL` apontava para `/dashboard/settings/billing` (404) — corrigido para `/settings/billing`
- Bug encontrado e corrigido: `STRIPE_WEBHOOK_SECRET` salvo com typo (`hsec_` em vez de `whsec_`) causava `[400]` em todos os eventos

**Commit final:**
```
feat: billing — Stripe webhook, limites de plano e sidebar dinâmica
```

---

## M15 — Landing Page ✅

**Branch:** `feat/landing-page` → merged em `main`
**Objetivo:** Página pública de apresentação do PipeFlow CRM com hero, features, pricing e CTA.

### Entregas

- [x] Criar `app/(public)/page.tsx` com layout próprio (sem sidebar)
- [x] Seção **Hero**: headline, subtítulo, CTA "Começar grátis" → `/signup`, imagem/screenshot do app
- [x] Seção **Funcionalidades**: 6 cards com ícone, título e descrição (Kanban, Leads, Dashboard, Multi-empresa, Atividades, Integração)
- [x] Seção **Planos/Preços**: comparação Free vs Pro com tabela de features e botões de CTA
- [x] Seção **CTA final**: banner de conversão com botão "Criar conta grátis"
- [x] Navbar pública: logo + links âncora + botão "Entrar" → `/login`
- [x] Footer: nome do produto, links legais placeholder
- [x] SEO: `metadata` com title, description e og:image na página
- [x] Responsivo: layout adaptado para mobile
- [x] Verificar que `/login` e `/signup` linkam corretamente a partir da landing

**Extras entregues:**
- Seção Stats com 4 métricas de impacto (+47% conversão, 3.2x leads, −62% ciclo, 1200+ times)
- Dark mode completo via tokens CSS do design system
- Dashboard movido de `/` → `/dashboard` para liberar a raiz para a landing
- Redirects corrigidos em login, onboarding e header

**Commit final:**
```
feat: landing page — hero, features, pricing e CTA com SEO básico
```

---

## M16 — Polish & Deploy

**Branch:** `chore/deploy`
**Objetivo:** Finalização de qualidade, responsividade e deploy em produção no Vercel + Supabase Cloud.

### Entregas

- [ ] **Responsividade:** testar e corrigir Kanban, listagem de leads e dashboard em mobile (< 768px)
- [ ] **Acessibilidade:** verificar contraste de cores, labels em todos os inputs, navegação por teclado nos modais
- [ ] **Estados de erro:** tratar erros de rede nas queries (toast de erro com `sonner`)
- [ ] **Toasts de feedback:** confirmação de ações (lead criado, deal movido, convite enviado)
- [ ] **Favicon e metadados:** criar `app/icon.tsx` e `app/layout.tsx` com metadata global
- [ ] **Variáveis de ambiente:** configurar todas as env vars no Vercel Dashboard
- [ ] **Supabase Cloud:** aplicar todas as migrations, verificar RLS em produção
- [ ] **Deploy Vercel:** conectar repositório GitHub, configurar domínio custom (opcional)
- [ ] **Stripe produção:** trocar chaves de teste pelas de produção, registrar webhook URL do Vercel
- [ ] **Smoke test em produção:** criar conta, workspace, lead, deal, atividade, convidar membro, fazer upgrade
- [ ] **Atualizar `docs/PLAN.md`** com status final de cada milestone

**Commit final:**
```
chore: polish final e deploy em produção — Vercel + Supabase Cloud
```

---

## Referência Rápida de Branches

```
main                          ← produção, só recebe merge de milestones concluídos
feat/setup
feat/auth-ui
feat/auth-backend
feat/leads-ui
feat/leads-backend
feat/kanban-ui
feat/kanban-backend
feat/activities-ui
feat/activities-backend
feat/dashboard-ui
feat/dashboard-backend
feat/workspace-ui
feat/workspace-backend
feat/monetization
feat/landing-page
chore/deploy
```

---

## Regras do Processo

1. **Interface antes do banco** — nunca criar migration antes da UI do milestone correspondente estar validada
2. **Cada milestone = 1 branch** — abrir PR para `main` ao concluir, nunca commitar direto
3. **Commit final padrão** — todo milestone termina com o commit descrito acima
4. **Testar o golden path** antes de fechar o milestone — o caminho principal do usuário deve funcionar de ponta a ponta
5. **Mock → Real** — dados mock são substituídos, não coexistem com dados reais na mesma tela
