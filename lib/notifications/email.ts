import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cidal.vercel.app'
const ADMIN_EMAIL = 'imaz.facturacionelectronica@gmail.com'
const TEAM_EMAILS = [ADMIN_EMAIL]

export async function notifyAdminDraftReady(protocolTitle: string, slug: string) {
  await resend.emails.send({
    from: 'CIDAL App <noreply@cidal.app>',
    to: [ADMIN_EMAIL],
    subject: `[CIDAL] Borrador listo para revisión: ${protocolTitle}`,
    html: `
      <h2>Protocolo actualizado — revisión requerida</h2>
      <p>El sistema de actualización automática generó un borrador actualizado para:</p>
      <p><strong>${protocolTitle}</strong></p>
      <p>Revisa el borrador y apruébalo o recházalo en la app CIDAL:</p>
      <a href="${APP_URL}/protocolos/${slug}/revision" style="
        background:#1e3a6b;color:white;padding:10px 20px;
        border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px
      ">
        Revisar borrador
      </a>
    `,
  })
}

export async function notifyTeamProtocolPublished(protocolTitle: string, slug: string) {
  await resend.emails.send({
    from: 'CIDAL App <noreply@cidal.app>',
    to: TEAM_EMAILS,
    subject: `[CIDAL] Protocolo actualizado: ${protocolTitle}`,
    html: `
      <h2>Protocolo publicado</h2>
      <p>El siguiente protocolo ha sido revisado y publicado con nueva evidencia:</p>
      <p><strong>${protocolTitle}</strong></p>
      <a href="${APP_URL}/protocolos/${slug}" style="
        background:#1e7b40;color:white;padding:10px 20px;
        border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px
      ">
        Ver protocolo actualizado
      </a>
    `,
  })
}
