'use server'
import { createServiceClient } from '@/lib/supabase/server'
import { notifyTeamProtocolPublished } from '@/lib/notifications/email'
import { sendTelegramMessage } from '@/lib/notifications/telegram'

export async function approveProtocolDraft(
  protocolId: string,
  versionId: string
): Promise<{ success: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createServiceClient() as any
  const { data: { user } } = await supabase.auth.getUser()
  const now = new Date().toISOString()

  const { error: versionError } = await supabase
    .from('protocol_versions')
    .update({ approved_by: user!.id, approved_at: now, published_at: now })
    .eq('id', versionId)

  if (versionError) return { success: false, error: versionError.message }

  const { error: protocolError } = await supabase
    .from('protocols')
    .update({ status: 'published', current_version_id: versionId })
    .eq('id', protocolId)

  if (protocolError) return { success: false, error: protocolError.message }

  await supabase
    .from('protocol_update_jobs')
    .update({ status: 'approved', completed_at: now })
    .eq('draft_version_id', versionId)

  const { data: protocol } = await supabase
    .from('protocols')
    .select('title, slug')
    .eq('id', protocolId)
    .single()

  if (protocol) {
    await notifyTeamProtocolPublished(protocol.title, protocol.slug)
    await sendTelegramMessage(
      `✅ Protocolo aprobado: *${protocol.title}*\n\nRevisa la versión actualizada en la app CIDAL.`
    )
  }

  return { success: true }
}

export async function rejectProtocolDraft(
  protocolId: string,
  versionId: string
): Promise<{ success: boolean; error?: string }> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createServiceClient() as any
  const now = new Date().toISOString()

  const { error } = await supabase
    .from('protocol_versions')
    .update({ search_summary: 'RECHAZADO POR REVISOR' })
    .eq('id', versionId)

  if (error) return { success: false, error: error.message }

  await supabase
    .from('protocol_update_jobs')
    .update({ status: 'rejected', completed_at: now })
    .eq('draft_version_id', versionId)

  return { success: true }
}
