import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProtocolBySlug, getProtocolVersionHistory } from '@/lib/protocols/queries'
import { NavBar } from '@/components/ui/NavBar'
import Link from 'next/link'

export default async function ProtocolHistoryPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: roleData } = await supabase
    .from('user_roles').select('role').eq('user_id', user!.id).single() as { data: { role: string } | null }

  const protocol = await getProtocolBySlug(params.slug)
  if (!protocol) notFound()

  const versions = await getProtocolVersionHistory(protocol.id)

  return (
    <>
      <NavBar role={roleData?.role ?? 'medico'} />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <Link href={`/protocolos/${params.slug}`} className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          ← {protocol.title}
        </Link>
        <h1 className="text-xl font-bold text-blue-900 mb-6">Historial de versiones</h1>
        <div className="space-y-3">
          {versions.map(v => (
            <div key={v.id} className="border border-gray-200 rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-blue-900">Versión {v.version_number}</span>
                <span className="text-xs text-gray-400">
                  {v.published_at
                    ? `Publicada: ${new Date(v.published_at).toLocaleDateString('es-CO')}`
                    : 'Borrador — pendiente de revisión'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Generado por: {v.generated_by === 'claude-api' ? 'Claude IA' : 'Manual'}
              </p>
              {v.search_summary && v.search_summary !== 'RECHAZADO POR REVISOR' && (
                <p className="text-xs text-gray-600 mt-2 line-clamp-2">{v.search_summary}</p>
              )}
            </div>
          ))}
          {versions.length === 0 && (
            <p className="text-gray-400 text-center py-8">Sin versiones registradas.</p>
          )}
        </div>
      </main>
    </>
  )
}
