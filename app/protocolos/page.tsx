import { createClient } from '@/lib/supabase/server'
import { getPublishedProtocols } from '@/lib/protocols/queries'
import { ProtocolCard } from '@/components/protocols/ProtocolCard'
import { NavBar } from '@/components/ui/NavBar'

export default async function ProtocolosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role, full_name')
    .eq('user_id', user!.id)
    .single() as { data: { role: string; full_name: string } | null }

  const protocols = await getPublishedProtocols()

  return (
    <>
      <NavBar role={roleData?.role ?? 'medico'} />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-blue-900">Protocolos Clínicos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Bienvenido, {roleData?.full_name ?? user?.email}
          </p>
        </div>
        {protocols.length === 0 ? (
          <p className="text-gray-400 text-center py-12">No hay protocolos publicados aún.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {protocols.map(p => (
              <ProtocolCard key={p.id} protocol={p} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
