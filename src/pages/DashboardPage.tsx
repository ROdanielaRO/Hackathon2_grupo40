import { useEffect, useState } from 'react'
import { api, errorMessage } from '../lib/api'
import type { DashboardSummary } from '../lib/types'
import { Loading, ErrorView } from '../components/StateView'

export function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    setStatus('loading')
    api.dashboard(controller.signal)
      .then((d) => { setData(d); setStatus('success') })
      .catch((e) => { if (!controller.signal.aborted) { setError(errorMessage(e)); setStatus('error') } })
    return () => controller.abort()
  }, [nonce])

  if (status === 'loading') return <Loading label="Cargando indicadores…" />
  if (status === 'error') return <ErrorView message={error!} onRetry={() => setNonce((n) => n + 1)} />
  if (!data) return null

  const cards = [
    { label: 'Tropeles totales', value: data.totalTropels },
    { label: 'Tropeles críticos', value: data.criticalTropels },
    { label: 'Señales abiertas', value: data.openSignals },
    { label: 'Estabilidad media', value: `${data.sectorStabilityAvg}%` },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <p className="text-xs text-zinc-400">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-indigo-300">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <p className="mb-3 text-sm text-zinc-400">Señales por severidad</p>
        <div className="space-y-2">
          {Object.entries(data.signalsBySeverity).map(([sev, count]) => (
            <div key={sev} className="flex items-center gap-3 text-sm">
              <span className="w-24 text-zinc-400">{sev}</span>
              <span className="font-mono text-indigo-300">{count}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-zinc-600">Generado: {new Date(data.generatedAt).toLocaleString()}</p>
    </div>
  )
}
