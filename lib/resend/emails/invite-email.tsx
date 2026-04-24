import * as React from 'react'

interface InviteEmailProps {
  workspaceName: string
  inviterName: string
  role: 'admin' | 'member'
  inviteLink: string
}

const ROLE_LABEL: Record<InviteEmailProps['role'], string> = {
  admin: 'Administrador',
  member: 'Membro',
}

export function InviteEmail({ workspaceName, inviterName, role, inviteLink }: InviteEmailProps) {
  return (
    <div style={{ backgroundColor: '#F8FAFC', padding: '40px 16px', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E2E8F0', maxWidth: '520px', margin: '0 auto', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#4F46E5', padding: '24px 32px' }}>
          <span style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: '700', letterSpacing: '-0.5px' }}>PipeFlow</span>
        </div>
        <div style={{ padding: '32px' }}>
          <h1 style={{ color: '#0F172A', fontSize: '24px', fontWeight: '700', margin: '0 0 16px' }}>
            Você foi convidado!
          </h1>
          <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', margin: '0 0 16px' }}>
            <strong>{inviterName}</strong> convidou você para colaborar em{' '}
            <strong>{workspaceName}</strong> no PipeFlow CRM como{' '}
            <strong>{ROLE_LABEL[role]}</strong>.
          </p>
          <p style={{ color: '#475569', fontSize: '15px', lineHeight: '1.6', margin: '0 0 28px' }}>
            Clique no botão abaixo para aceitar o convite e acessar o workspace.
          </p>
          <div style={{ textAlign: 'center', margin: '0 0 28px' }}>
            <a
              href={inviteLink}
              style={{ backgroundColor: '#4F46E5', borderRadius: '8px', color: '#FFFFFF', display: 'inline-block', fontSize: '15px', fontWeight: '600', padding: '12px 28px', textDecoration: 'none' }}
            >
              Aceitar convite
            </a>
          </div>
          <p style={{ color: '#94A3B8', fontSize: '13px', margin: '0 0 4px' }}>
            Ou cole este link no seu navegador:
          </p>
          <p style={{ color: '#4F46E5', fontSize: '13px', margin: '0 0 24px', wordBreak: 'break-all' }}>
            {inviteLink}
          </p>
          <hr style={{ border: 'none', borderTop: '1px solid #E2E8F0', margin: '24px 0' }} />
          <p style={{ color: '#94A3B8', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
            Este convite expira em 7 dias. Se você não esperava este e-mail, pode ignorá-lo com segurança.
          </p>
        </div>
      </div>
    </div>
  )
}
