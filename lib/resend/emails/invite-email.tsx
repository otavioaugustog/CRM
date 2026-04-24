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
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Convite para {workspaceName}</title>
      </head>
      <body style={styles.body}>
        <div style={styles.container}>
          {/* Header */}
          <div style={styles.header}>
            <span style={styles.logo}>PipeFlow</span>
          </div>

          {/* Content */}
          <div style={styles.content}>
            <h1 style={styles.heading}>Você foi convidado!</h1>
            <p style={styles.text}>
              <strong>{inviterName}</strong> convidou você para colaborar em{' '}
              <strong>{workspaceName}</strong> no PipeFlow CRM como{' '}
              <strong>{ROLE_LABEL[role]}</strong>.
            </p>
            <p style={styles.text}>
              Clique no botão abaixo para aceitar o convite e acessar o workspace.
            </p>

            <div style={styles.buttonWrapper}>
              <a href={inviteLink} style={styles.button}>
                Aceitar convite
              </a>
            </div>

            <p style={styles.small}>
              Ou cole este link no seu navegador:
            </p>
            <p style={styles.link}>{inviteLink}</p>

            <hr style={styles.divider} />
            <p style={styles.footer}>
              Este convite expira em 7 dias. Se você não esperava este e-mail, pode ignorá-lo com segurança.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

const styles: Record<string, React.CSSProperties> = {
  body: {
    backgroundColor: '#F8FAFC',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    margin: 0,
    padding: '40px 16px',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    maxWidth: '520px',
    margin: '0 auto',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#4F46E5',
    padding: '24px 32px',
  },
  logo: {
    color: '#FFFFFF',
    fontSize: '20px',
    fontWeight: '700',
    letterSpacing: '-0.5px',
  },
  content: {
    padding: '32px',
  },
  heading: {
    color: '#0F172A',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 16px',
  },
  text: {
    color: '#475569',
    fontSize: '15px',
    lineHeight: '1.6',
    margin: '0 0 16px',
  },
  buttonWrapper: {
    margin: '28px 0',
    textAlign: 'center' as const,
  },
  button: {
    backgroundColor: '#4F46E5',
    borderRadius: '8px',
    color: '#FFFFFF',
    display: 'inline-block',
    fontSize: '15px',
    fontWeight: '600',
    padding: '12px 28px',
    textDecoration: 'none',
  },
  small: {
    color: '#94A3B8',
    fontSize: '13px',
    margin: '0 0 4px',
  },
  link: {
    color: '#4F46E5',
    fontSize: '13px',
    margin: '0 0 24px',
    wordBreak: 'break-all' as const,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #E2E8F0',
    margin: '24px 0',
  },
  footer: {
    color: '#94A3B8',
    fontSize: '12px',
    lineHeight: '1.5',
    margin: 0,
  },
}
