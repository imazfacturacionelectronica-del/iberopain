import { Resend } from 'resend'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cidal.vercel.app'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}
const ADMIN_EMAIL = 'imaz.facturacionelectronica@gmail.com'
// TODO: add team member emails (Dra. Castillo, Dr. Guette, Enfermera) once confirmed
const TEAM_EMAILS = [ADMIN_EMAIL]

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function validateSlug(slug: string): void {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`Invalid slug: ${slug}`)
}

export async function notifyAdminDraftReady(protocolTitle: string, slug: string) {
  validateSlug(slug)
  const title = escapeHtml(protocolTitle)
  const { error } = await getResend().emails.send({
    from: 'IberoPain <noreply@cidal.app>',
    to: [ADMIN_EMAIL],
    subject: `[IberoPain] Borrador listo para revisión: ${protocolTitle}`,
    html: `
      <h2>Protocolo actualizado — revisión requerida</h2>
      <p>El sistema de actualización automática generó un borrador actualizado para:</p>
      <p><strong>${title}</strong></p>
      <p>Revisa el borrador y apruébalo o recházalo en la app IberoPain:</p>
      <a href="${APP_URL}/protocolos/${slug}/revision" style="
        background:#1e3a6b;color:white;padding:10px 20px;
        border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px
      ">
        Revisar borrador
      </a>
    `,
  })
  if (error) console.error('Resend error (notifyAdminDraftReady):', error)
}

export async function notifyTeamProtocolPublished(protocolTitle: string, slug: string) {
  validateSlug(slug)
  const title = escapeHtml(protocolTitle)
  const { error } = await getResend().emails.send({
    from: 'IberoPain <noreply@cidal.app>',
    to: TEAM_EMAILS,
    subject: `[IberoPain] Protocolo actualizado: ${protocolTitle}`,
    html: `
      <h2>Protocolo publicado</h2>
      <p>El siguiente protocolo ha sido revisado y publicado con nueva evidencia:</p>
      <p><strong>${title}</strong></p>
      <a href="${APP_URL}/protocolos/${slug}" style="
        background:#1e7b40;color:white;padding:10px 20px;
        border-radius:6px;text-decoration:none;display:inline-block;margin-top:12px
      ">
        Ver protocolo actualizado
      </a>
    `,
  })
  if (error) console.error('Resend error (notifyTeamProtocolPublished):', error)
}
