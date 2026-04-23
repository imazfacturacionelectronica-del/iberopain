type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

function renderValue(value: Json, depth = 0): React.ReactNode {
  if (value === null) return null
  if (typeof value === 'string') return <p className="text-gray-700 text-sm mb-1">{value}</p>
  if (typeof value === 'number' || typeof value === 'boolean') {
    return <p className="text-gray-700 text-sm mb-1">{String(value)}</p>
  }
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside space-y-1 ml-4">
        {value.map((item, i) => (
          <li key={i} className="text-sm text-gray-700">
            {typeof item === 'string' ? item : JSON.stringify(item)}
          </li>
        ))}
      </ul>
    )
  }
  return (
    <div className={depth > 0 ? 'ml-4 space-y-3' : 'space-y-3'}>
      {Object.entries(value as Record<string, Json>).map(([k, v]) => (
        <div key={k}>
          <h4 className="font-medium text-blue-800 text-sm capitalize mb-1">
            {k.replace(/_/g, ' ')}
          </h4>
          {renderValue(v, depth + 1)}
        </div>
      ))}
    </div>
  )
}

export function ProtocolViewer({
  content,
  bibliography,
}: {
  content: Record<string, Json>
  bibliography: Json[]
}) {
  return (
    <div className="space-y-6">
      {Object.entries(content).map(([section, value]) => (
        <section key={section} className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 capitalize">
            {section.replace(/_/g, ' ')}
          </h3>
          {renderValue(value as Json)}
        </section>
      ))}
      {bibliography.length > 0 && (
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Referencias</h3>
          <ol className="space-y-2 list-decimal list-inside">
            {bibliography.map((ref, i) => (
              <li key={i} className="text-sm text-gray-600">
                {typeof ref === 'string' ? ref : JSON.stringify(ref)}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  )
}
