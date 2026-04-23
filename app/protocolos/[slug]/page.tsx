import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProtocolBySlug } from '@/lib/protocols/queries'
import { ProtocolViewer } from '@/components/protocols/ProtocolViewer'
import { NavBar } from '@/components/ui/NavBar'
import Link from 'next/link'

export default async function ProtocolDetailPage({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: roleData } = await supabase
    .from('user_roles').select('role').eq('user_id', user!.id).single() as { data: { role: string } | null }

  const protocol = await getProtocolBySlug(params.slug)
  if (!protocol) notFound()

  const currentVersion = protocol.protocol_versions.find(
    v => v.id === protocol.current_version_id
  )

  return (
    <>
      <NavBar role={roleData?.role ?? 'medico'} />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <Link href="/protocolos" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
              ← Protocolos
            </Link>
            <h1 className="text-2xl font-bold text-blue-900">{protocol.title}</h1>
            {currentVersion && (
              <p className="text-gray-400 text-xs mt-1">
                Versión {currentVersion.version_number} ·{' '}
                {currentVersion.published_at
                  ? new Date(currentVersion.published_at).toLocaleDateString('es-CO')
                  : 'Sin publicar'}
              </p>
            )}
          </div>
          <div className="flex gap-3 items-center">
            <Link href={`/protocolos/${params.slug}/historial`} className="text-sm text-blue-600 hover:underline">
              Ver historial
            </Link>
            {roleData?.role === 'admin' && protocol.status === 'review_pending' && (
              <Link
                href={`/protocolos/${params.slug}/revision`}
                className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full font-medium hover:bg-yellow-200"
              >
                ⚠ Revisar borrador
              </Link>
            )}
          </div>
        </div>
        {currentVersion ? (
          <ProtocolViewer
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content={currentVersion.content as any}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            bibliography={currentVersion.bibliography as any}
          />
        ) : (
          <p className="text-gray-400">Este protocolo no tiene una versión publicada aún.</p>
        )}
      </main>
    </>
  )
}
