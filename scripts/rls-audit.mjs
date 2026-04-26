/**
 * Auditoria de RLS — PipeFlow CRM
 *
 * 1. Verifica acesso anônimo em todas as tabelas (deve retornar 0 rows)
 * 2. Testa isolamento real entre dois usuários:
 *    - Usuário A = membro do workspace existente "wsA"
 *    - Usuário B = sem acesso a nenhum workspace
 *    - B tenta ler/alterar dados de wsA → deve falhar
 *
 * Uso: node --env-file=.env.local scripts/rls-audit.mjs
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const service = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

function sep(t) { console.log(`\n${'─'.repeat(62)}\n  ${t}\n${'─'.repeat(62)}`) }
const ok   = m => console.log(`  ✅  ${m}`)
const fail = m => console.log(`  ❌  ${m}`)
const info = m => console.log(`  ℹ️   ${m}`)

// ── 1. Acesso anônimo ─────────────────────────────────────────

async function checkAnonAccess() {
  sep('1 — ACESSO ANÔNIMO (sem autenticação)')
  const TABLES = [
    'workspaces','workspace_members',
    'leads','deals','activities',
    'invitations','workspace_invites',
  ]
  const anon = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } })
  let passed = 0
  for (const t of TABLES) {
    const { data, error } = await anon.from(t).select('id').limit(5)
    const count = data?.length ?? 0
    if (error || count === 0) {
      ok(`${t.padEnd(24)} bloqueado (${error ? 'err: ' + error.code : '0 rows'})`)
      passed++
    } else {
      fail(`${t.padEnd(24)} expõe ${count} row(s) sem autenticação! RLS ausente.`)
    }
  }
  console.log(`\n  Resultado: ${passed}/${TABLES.length} tabelas protegidas.`)
  return passed === TABLES.length
}

// ── 2. Isolamento real ────────────────────────────────────────

async function authedClient(email, password) {
  const c = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } })
  const { data: s, error } = await c.auth.signInWithPassword({ email, password })
  if (error || !s?.session) throw new Error(`login ${email}: ${error?.message}`)
  // Cria cliente com token explícito para garantir que o JWT é enviado
  return createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${s.session.access_token}` } },
  })
}

async function testIsolation() {
  sep('2 — ISOLAMENTO DE WORKSPACE (dois usuários reais)')

  const TS = Date.now()

  // Pegar workspace A existente no banco (criado pela app)
  const { data: workspaces } = await service.from('workspaces').select('id,name').limit(1).single()
  if (!workspaces) { fail('Nenhum workspace no banco — rode o app primeiro.'); return }
  const wsA = workspaces.id
  info(`Workspace A: "${workspaces.name}" (${wsA})`)

  // Buscar um membro admin existente para usar como owner_id
  const { data: adminMember } = await service
    .from('workspace_members')
    .select('user_id')
    .eq('workspace_id', wsA)
    .eq('role', 'admin')
    .limit(1)
    .single()
  const ownerForTest = adminMember?.user_id
  if (!ownerForTest) { fail('Sem admin no workspace A — não foi possível criar lead de teste.'); return }

  // Criar lead de teste no workspace A (limpo depois)
  const { data: testLead, error: leadErr } = await service
    .from('leads')
    .insert({ workspace_id: wsA, name: 'AUDIT_LEAD_TEST', email: 'audit@test.local', status: 'ativo', owner_id: ownerForTest })
    .select('id').single()
  if (!testLead) { fail(`Não criou lead de teste: ${leadErr?.message}`); return }
  ok(`Lead de teste criado em workspace A: ${testLead.id}`)

  // Criar usuário A (com acesso ao workspace A) e usuário B (sem acesso)
  const emailA = `rls_memberA_${TS}@example.com`
  const emailB = `rls_outsider_${TS}@example.com`
  const pw = 'RlsAudit@2026!'

  let uidA, uidB
  try {
    info(`Criando usuário A (será membro de wsA)…`)
    const { data: uA } = await service.auth.admin.createUser({ email: emailA, password: pw, email_confirm: true })
    uidA = uA.user.id
    // Adiciona A como membro de wsA
    await service.from('workspace_members').insert({ workspace_id: wsA, user_id: uidA, role: 'member' })
    ok(`Usuário A criado e adicionado ao workspace A`)

    info(`Criando usuário B (outsider sem acesso a wsA)…`)
    const { data: uB } = await service.auth.admin.createUser({ email: emailB, password: pw, email_confirm: true })
    uidB = uB.user.id
    ok(`Usuário B criado (sem membership em nenhum workspace)`)
  } catch (e) {
    fail(`Setup falhou: ${e.message}`)
    await cleanup(testLead?.id, uidA, uidB)
    return
  }

  // Obter clientes autenticados
  let clientA, clientB
  try {
    clientA = await authedClient(emailA, pw)
    ok(`Sessão A ativa`)
    clientB = await authedClient(emailB, pw)
    ok(`Sessão B ativa`)
  } catch (e) {
    fail(`Login falhou: ${e.message}`)
    await cleanup(testLead?.id, uidA, uidB)
    return
  }

  // ── Sanity: A lê os próprios leads ─────────────────────────
  console.log('\n  2.0  Sanity: A lê leads do workspace A')
  const { data: leadsA } = await clientA.from('leads').select('id').eq('workspace_id', wsA)
  leadsA && leadsA.length > 0
    ? ok(`A vê ${leadsA.length} lead(s) no próprio workspace ✓`)
    : fail('A não consegue ler os próprios dados! Problema de acesso.')

  // ── 2.1 B lê leads de A (filtro explícito) ────────────────
  console.log('\n  2.1  B tenta SELECT leads WHERE workspace_id = wsA')
  const { data: r21 } = await clientB.from('leads').select('id').eq('workspace_id', wsA)
  !r21 || r21.length === 0
    ? ok('0 rows — RLS bloqueou ✓')
    : fail(`${r21.length} row(s) de workspace A visíveis para B!`)

  // ── 2.2 B faz SELECT geral (sem filtro) ───────────────────
  console.log('\n  2.2  B faz SELECT geral — deve ver apenas o próprio workspace (vazio)')
  const { data: r22 } = await clientB.from('leads').select('id,workspace_id')
  const leaked22 = (r22 ?? []).filter(l => l.workspace_id === wsA)
  leaked22.length === 0
    ? ok('Nenhum lead de wsA apareceu no SELECT geral de B ✓')
    : fail(`${leaked22.length} lead(s) de wsA vazaram para B!`)

  // ── 2.3 B tenta UPDATE em lead de A ───────────────────────
  console.log('\n  2.3  B tenta UPDATE em lead de A')
  const { data: r23 } = await clientB.from('leads').update({ name: 'HACKED' }).eq('id', testLead.id).select('id')
  !r23 || r23.length === 0
    ? ok('UPDATE bloqueado ✓')
    : fail('UPDATE bem-sucedido — B alterou lead de A! RLS falhou.')

  // ── 2.4 B tenta DELETE em lead de A ───────────────────────
  console.log('\n  2.4  B tenta DELETE em lead de A')
  const { count: cnt24 } = await clientB.from('leads').delete({ count: 'exact' }).eq('id', testLead.id)
  !cnt24 || cnt24 === 0
    ? ok('DELETE bloqueado ✓')
    : fail('DELETE bem-sucedido — B deletou lead de A! RLS falhou.')

  // ── 2.5 Isolamento em workspaces ─────────────────────────
  console.log('\n  2.5  B tenta ler workspace A pelo id')
  const { data: r25 } = await clientB.from('workspaces').select('id,name').eq('id', wsA)
  !r25 || r25.length === 0
    ? ok('Workspace A invisível para B ✓')
    : fail(`B viu workspace A: "${r25[0]?.name}"`)

  // ── 2.6 Isolamento em workspace_members ──────────────────
  console.log('\n  2.6  B tenta ler workspace_members de A')
  const { data: r26 } = await clientB.from('workspace_members').select('id').eq('workspace_id', wsA)
  !r26 || r26.length === 0
    ? ok('workspace_members de A invisíveis para B ✓')
    : fail(`${r26.length} membro(s) de A visíveis para B!`)

  // ── 2.7 Isolamento em workspace_invites ──────────────────
  console.log('\n  2.7  B tenta ler workspace_invites de A')
  const { data: r27 } = await clientB.from('workspace_invites').select('id').eq('workspace_id', wsA)
  !r27 || r27.length === 0
    ? ok('workspace_invites de A invisíveis para B ✓')
    : fail(`${r27.length} convite(s) de A visíveis para B!`)

  await cleanup(testLead?.id, uidA, uidB)
}

async function cleanup(leadId, uidA, uidB) {
  console.log('\n  Limpando dados de teste…')
  if (leadId) await service.from('leads').delete().eq('id', leadId)
  if (uidA)   await service.auth.admin.deleteUser(uidA).catch(() => {})
  if (uidB)   await service.auth.admin.deleteUser(uidB).catch(() => {})
  ok('Dados de teste removidos.')
}

// ── Main ──────────────────────────────────────────────────────

async function main() {
  console.log('\n🔒  PipeFlow CRM — Auditoria de RLS')
  console.log(`    Projeto : ${SUPABASE_URL}`)
  console.log(`    Data    : ${new Date().toLocaleString('pt-BR')}`)

  const anonOk = await checkAnonAccess()
  await testIsolation()

  sep('RESUMO FINAL')
  if (anonOk) ok('7/7 tabelas bloqueiam acesso sem autenticação.')
  else        fail('Uma ou mais tabelas expõem dados sem autenticação!')
  console.log()
}

main().catch(e => { console.error('\n❌  Erro inesperado:', e.message); process.exit(1) })
