import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getActiveWorkspaceId } from '@/lib/get-workspace-id'
import { Resend } from 'resend'
import { render } from '@react-email/render'
import { InviteEmail } from '@/lib/resend/emails/invite-email'

const MAX_FREE_MEMBERS = 2

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  }

  const workspaceId = await getActiveWorkspaceId()
  if (!workspaceId) {
    return NextResponse.json({ error: 'Workspace não encontrado.' }, { status: 400 })
  }

  // Verifica se o usuário é admin
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: membership } = await (supabase as any)
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single()

  if (membership?.role !== 'admin') {
    return NextResponse.json({ error: 'Apenas admins podem convidar membros.' }, { status: 403 })
  }

  // Verifica limite do plano Free
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: workspace } = await (supabase as any)
    .from('workspaces')
    .select('name, plan')
    .eq('id', workspaceId)
    .single()

  if (workspace?.plan === 'free') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { count } = await (supabase as any)
      .from('workspace_members')
      .select('id', { count: 'exact', head: true })
      .eq('workspace_id', workspaceId)

    if ((count ?? 0) >= MAX_FREE_MEMBERS) {
      return NextResponse.json(
        { error: 'Limite de 2 membros atingido no plano Free. Faça upgrade para Pro.', limitReached: true },
        { status: 403 }
      )
    }
  }

  const body = await req.json()
  const { email, role } = body as { email: string; role: 'admin' | 'member' }

  if (!email || !role) {
    return NextResponse.json({ error: 'E-mail e papel são obrigatórios.' }, { status: 400 })
  }

  // Verifica se a pessoa já é membro
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingUser } = await (supabase as any).rpc('get_workspace_members_with_profile', {
    p_workspace_id: workspaceId,
  })
  const alreadyMember = (existingUser ?? []).some(
    (m: { email: string }) => m.email.toLowerCase() === email.toLowerCase()
  )
  if (alreadyMember) {
    return NextResponse.json({ error: 'Este e-mail já é membro do workspace.' }, { status: 409 })
  }

  // Cria o convite (unique index cuida de duplicatas pendentes)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invite, error: inviteError } = await (supabase as any)
    .from('workspace_invites')
    .insert({
      workspace_id: workspaceId,
      email: email.toLowerCase(),
      role,
      invited_by: user.id,
    })
    .select()
    .single()

  if (inviteError) {
    if (inviteError.code === '23505') {
      return NextResponse.json({ error: 'Já existe um convite pendente para este e-mail.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Erro ao criar convite.' }, { status: 500 })
  }

  // Envia e-mail via Resend
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const inviteLink = `${appUrl}/invite/${invite.token}`

  const resend = new Resend(process.env.RESEND_API_KEY)

  const fromAddress = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  const html = await render(InviteEmail({
    workspaceName: workspace.name,
    inviterName: user.user_metadata?.name ?? user.email ?? 'Alguém',
    role,
    inviteLink,
  }))

  const { error: emailError } = await resend.emails.send({
    from: `PipeFlow CRM <${fromAddress}>`,
    to: email,
    subject: `Você foi convidado para ${workspace.name} no PipeFlow`,
    html,
  })

  if (emailError) {
    console.error('[invites] Resend error:', emailError)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[invites] Link do convite (dev): ${inviteLink}`)
    }
    return NextResponse.json({ warning: 'Convite criado, mas o e-mail não pôde ser enviado.' }, { status: 201 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
