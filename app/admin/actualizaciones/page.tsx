import { createClient } from '@/lib/supabase/server'
import { getAllUpdateJobs, getPendingReviewJobs } from '@/lib/protocols/queries'
import { NavBar } from '@/components/ui/NavBar'
import Link from 'next/link'

type UpdateJob = {
  id: string
  triggered_at: string
  status: string
  error_message?: string | null
  protocols?: { title?: string; slug?: string } | null
}

const JOB_STATUS: Record<string, { label: string; classes: string }> = {
  running:     { label: 'Ejecutando',          classes: 'bg-blue-100 text-blue-800' },
  draft_ready: { label: 'Listo para revisión', classes: 'bg-yellow-100 text-yellow-800' },
  approved:    { label: 'Aprobado',            classes: 'bg-green-100 text-green-800' },
  rejected:    { label: 'Rechazado',           classes: 'bg-gray-100 text-gray-600' },
  error:       { label: 'Error',               classes: 'bg-red-100 text-red-700' },
}

export default async function ActualizacionesPage() {
  const pendingJobs = await getPendingReviewJobs()
  const allJobs = await getAllUpdateJobs()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  void user

  return (
    <>
      <NavBar role="admin" />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Actualizaciones automáticas</h1>

        {pendingJobs.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-semibold text-yellow-800 mb-3">
              ⚠ Pendientes de revisión ({pendingJobs.length})
            </h2>
            <div className="space-y-3">
              {(pendingJobs as UpdateJob[]).map((job) => (
                <div key={job.id} className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800">{job.protocols?.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(job.triggered_at).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <Link
                    href={`/protocolos/${job.protocols?.slug}/revision`}
                    className="bg-blue-800 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-900"
                  >
                    Revisar
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-base font-semibold text-gray-700 mb-3">Historial de jobs</h2>
        <div className="space-y-2">
          {allJobs.length === 0 && (
            <p className="text-gray-400 text-center py-8">No hay jobs registrados aún.</p>
          )}
          {(allJobs as UpdateJob[]).map((job) => {
            const s = JOB_STATUS[job.status] ?? { label: job.status, classes: 'bg-gray-100 text-gray-600' }
            return (
              <div key={job.id} className="border border-gray-200 rounded-xl p-4 bg-white flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{job.protocols?.title}</p>
                  <p className="text-xs text-gray-400">{new Date(job.triggered_at).toLocaleString('es-CO')}</p>
                  {job.error_message && <p className="text-xs text-red-600 mt-1">{job.error_message}</p>}
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${s.classes}`}>{s.label}</span>
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}
