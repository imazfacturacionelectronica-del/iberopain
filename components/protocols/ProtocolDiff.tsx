type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

type Props = {
  currentContent: Record<string, Json>
  draftContent: Record<string, Json>
  searchSummary: string | null
}

export function ProtocolDiff({ currentContent, draftContent, searchSummary }: Props) {
  return (
    <div className="space-y-6">
      {searchSummary && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Resumen de nueva evidencia encontrada</h3>
          <p className="text-sm text-blue-800 whitespace-pre-wrap">{searchSummary}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2 text-sm">Versión actual</h3>
          <pre className="bg-gray-50 border rounded-lg p-4 text-xs overflow-auto max-h-96 text-gray-600 whitespace-pre-wrap">
            {JSON.stringify(currentContent, null, 2)}
          </pre>
        </div>
        <div>
          <h3 className="font-semibold text-green-700 mb-2 text-sm">Borrador actualizado (IA)</h3>
          <pre className="bg-green-50 border border-green-200 rounded-lg p-4 text-xs overflow-auto max-h-96 text-green-900 whitespace-pre-wrap">
            {JSON.stringify(draftContent, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}
