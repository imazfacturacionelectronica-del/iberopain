import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/types'

type Protocol = Database['public']['Tables']['protocols']['Row']
type ProtocolVersion = Database['public']['Tables']['protocol_versions']['Row']

export type ProtocolWithVersion = Protocol & {
  protocol_versions: ProtocolVersion[]
}

export async function getPublishedProtocols(): Promise<Protocol[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('protocols')
    .select('*')
    .eq('status', 'published')
    .order('title')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAllProtocols(): Promise<Protocol[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('protocols')
    .select('*')
    .order('title')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getProtocolBySlug(slug: string): Promise<ProtocolWithVersion | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('protocols')
    .select('*, protocol_versions(*)')
    .eq('slug', slug)
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) throw new Error(error.message)
  return data as ProtocolWithVersion
}

export async function getProtocolVersionHistory(protocolId: string): Promise<ProtocolVersion[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('protocol_versions')
    .select('*')
    .eq('protocol_id', protocolId)
    .order('version_number', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getProtocolDraft(protocolId: string): Promise<ProtocolVersion | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('protocol_versions')
    .select('*')
    .eq('protocol_id', protocolId)
    .is('published_at', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) throw new Error(error.message)
  return data
}

export async function getPendingReviewJobs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('protocol_update_jobs')
    .select('*, protocols(title, slug)')
    .eq('status', 'draft_ready')
    .order('triggered_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getAllUpdateJobs() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('protocol_update_jobs')
    .select('*, protocols(title, slug)')
    .order('triggered_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}
