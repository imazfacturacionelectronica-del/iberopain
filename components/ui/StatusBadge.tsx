const STATUS_STYLES: Record<string, string> = {
  published: 'bg-green-100 text-green-800',
  draft: 'bg-gray-100 text-gray-600',
  review_pending: 'bg-yellow-100 text-yellow-800',
  archived: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  review_pending: 'Pendiente revisión',
  archived: 'Archivado',
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
