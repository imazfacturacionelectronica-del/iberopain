import Link from 'next/link'

const TYPE_LABELS: Record<string, string> = {
  agudo: 'Dolor Agudo',
  cronico: 'Dolor Crónico',
  neuropatico: 'Neuropático',
  oncologico: 'Oncológico',
  intervencionismo: 'Intervencionismo',
}

type Props = {
  protocol: {
    slug: string
    title: string
    type: string
    status: string
    updated_at: string
  }
  showStatus?: boolean
}

export function ProtocolCard({ protocol, showStatus = false }: Props) {
  return (
    <Link href={`/protocolos/${protocol.slug}`}>
      <div className="border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-sm transition-all cursor-pointer bg-white">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold text-blue-900 text-base leading-tight">{protocol.title}</h2>
          {showStatus && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-800 shrink-0">
              {protocol.status === 'published' ? 'Publicado' : protocol.status}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{TYPE_LABELS[protocol.type] ?? protocol.type}</p>
        <p className="text-xs text-gray-400 mt-2">
          Actualizado: {new Date(protocol.updated_at).toLocaleDateString('es-CO')}
        </p>
      </div>
    </Link>
  )
}
