import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, errorMessage } from '../lib/api'
import type { SectorListItem } from '../lib/types'
import { Loading, ErrorView } from '../components/StateView'

export function SectorsPage() {
  const navigate = useNavigate()
  const [sectors, setSectors] = useState<SectorListItem[]>([])
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    const c = new AbortController()
    setStatus('loading')
    api.sectors(c.signal)
      .then((r) => { setSectors(r.items); setStatus('success') })
      .catch((e) => { if (!c.signal.aborted) { setError(errorMessage(e)); setStatus('error') } })
    return () => c.abort()
  }, [nonce])

  // View Transition API entre resumen e historia, con fallback.
  function goToStory(id: string) {
    const nav = () => navigate(`/sectors/${id}/story`)
    if (document.startViewTransition) document.startViewTransition(nav)
    else nav()
  }

  if (status === 'loading') return <Loading label="Cargando sectores…" />
  if (status === 'error') return <ErrorView message={error!} onRetry={() => setNonce((n) => n + 1)} />

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Sectores</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sectors.map((s) => (
          <button key={s.id} onClick={() => goToStory(s.id)}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-left hover:border-indigo-700"
            style={{ viewTransitionName: `sector-${s.id}` }}>
            <p className="font-medium">{s.name}</p>
            <p className="text-xs text-zinc-500">{s.sectorCode} · {s.climate}</p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-zinc-400">Carga {s.currentLoad}/{s.capacity}</span>
              <span className="font-mono text-indigo-300">{s.stabilityLevel}%</span>
            </div>
            <p className="mt-3 text-xs text-indigo-400">Ver historia →</p>
          </button>
        ))}
      </div>
    </div>
  )
}
