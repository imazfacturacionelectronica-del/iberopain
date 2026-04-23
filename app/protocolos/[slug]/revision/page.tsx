import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProtocolBySlug, getProtocolDraft } from '@/lib/protocols/queries'
import { ProtocolDiff } from '@/components/protocols/ProtocolDiff'
import { NavBar } from '@/components/ui/NavBar'
import { approveProtocolDraft, rejectProtocolDraft } from '@/lib/protocols/actions'
import Link from 'next/link'

export default async function ProtocolRevisionPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: roleData } = await supabase
    .from('user_roles').select('role').eq('user_id', user!.id).single() as { data: { role: string } | null }

  if (roleData?.role !== 'admin') redirect('/protocolos')

  const protocol = await getProtocolBySlug(params.slug)
  if (!protocol) notFound()

  const draft = await getProtocolDraft(protocol.id)
  if (!draft) redirect(`/protocolos/${params.slug}`)

  const currentVersion = protocol.protocol_versions.find(
    v => v.id === protocol.current_version_id
  )

  async function handleApprove() {
    'use server'
    await approveProtocolDraft(protocol!.id, draft!.id)
    redirect(`/protocolos/${params.slug}`)
  }

  async function handleReject() {
    'use server'
    await rejectProtocolDraft(protocol!.id, draft!.id)
    redirect(`/protocolos/${params.slug}`)
  }

  return (
    <>
      <NavBar role="admin" />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <Link href={`/protocolos/${params.slug}`} className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← {protocol.title}
        </Link>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-blue-900">
            Revisión — Borrador v{draft.version_number}
          </h1>
          <div className="flex gap-3">
            <form action={handleReject}>
              <button type="submit" className="px-4 py-2 border border-red-300 text-red-700 rounded-lg text-sm hover:bg-red-50">
                Rechazar borrador
              </button>
            </form>
            <form action={handleApprove}>
              <button type="submit" className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm hover:bg-green-800">
                Aprobar y publicar
              </button>
            </form>
          </div>
        </div>
        <ProtocolDiff
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentContent={(currentVersion?.content ?? {}) as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          draftContent={draft.content as any}
          searchSummary={draft.search_summary}
        />
      </main>
    </>
  )
}
