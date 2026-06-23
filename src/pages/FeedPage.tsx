import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSignalFeed } from '../hooks/useSignalFeed'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import type { SignalType, Severity, SignalStatus, Signal } from '../lib/types'
import { Loading, ErrorView, Empty } from '../components/StateView'
import { SignalDetail } from './SignalDetail'

const TYPES: SignalType[] = ['HAMBRE', 'ABANDONO', 'MUTACION', 'FUGA', 'CONFLICTO', 'REPRODUCCION_MASIVA', 'SENAL_CORRUPTA']
const SEVERITIES: Severity[] = ['LEVE', 'MODERADO', 'GRAVE', 'CRITICO']
const STATUSES: SignalStatus[] = ['RECIBIDA', 'PROCESANDO', 'ATENDIDA']

function buildQuery(sp: URLSearchParams): string {
  const out = new URLSearchParams()
  out.set('limit', '15')
  for (const k of ['signalType', 'severity', 'status', 'q'] as const) {
    const v = sp.get(k)
    if (v) out.set(k, v)
  }
  return out.toString()
}

const sevColor: Record<Severity, string> = {
  LEVE: 'text-emerald-300', MODERADO: 'text-amber-300',
  GRAVE: 'text-orange-300', CRITICO: 'text-rose-300',
}

export function FeedPage() {
  const [sp, setSp] = useSearchParams()
  // El cursor NO va en la URL; solo los filtros afectan la query del feed.
  const filterKey = useMemo(() => buildQuery(sp), [sp])
  const { items, hasMore, total, status, error, loadMore, retry, patchItem } = useSignalFeed(filterKey)

  const sentinel = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) loadMore()
    }, { rootMargin: '300px' })
    io.observe(el)
    return () => io.disconnect()
  }, [loadMore])

  const [qInput, setQInput] = useState(sp.get('q') ?? '')
  const debouncedQ = useDebouncedValue(qInput, 350)
  useEffect(() => {
    setSp((prev) => {
      const next = new URLSearchParams(prev)
      if (debouncedQ) next.set('q', debouncedQ); else next.delete('q')
      return next
    }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ])

  function patchFilter(key: string, value: string) {
    setSp((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value); else next.delete(key)
      next.delete('signal')
      return next
    })
  }

  const openId = sp.get('signal')
  function openDetail(id: string) {
    setSp((prev) => { const n = new URLSearchParams(prev); n.set('signal', id); return n })
  }
  function closeDetail() {
    setSp((prev) => { const n = new URLSearchParams(prev); n.delete('signal'); return n })
  }
  function onUpdated(s: Signal) { patchItem(s) }

  const selectCls = 'rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm'

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold">Feed de Señales</h1>
        <span className="text-sm text-zinc-500">~{total} señales</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <input className={selectCls + ' min-w-[160px] flex-1'} placeholder="Buscar…" maxLength={80}
          value={qInput} onChange={(e) => setQInput(e.target.value)} />
        <select className={selectCls} value={sp.get('signalType') ?? ''} onChange={(e) => patchFilter('signalType', e.target.value)}>
          <option value="">Tipo</option>{TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className={selectCls} value={sp.get('severity') ?? ''} onChange={(e) => patchFilter('severity', e.target.value)}>
          <option value="">Severidad</option>{SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={selectCls} value={sp.get('status') ?? ''} onChange={(e) => patchFilter('status', e.target.value)}>
          <option value="">Estado</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {status === 'loading' && items.length === 0 && <Loading label="Cargando feed…" />}
      {status === 'error' && items.length === 0 && <ErrorView message={error!} onRetry={retry} />}
      {status === 'success' && items.length === 0 && <Empty label="No hay señales con esos filtros" />}

      <div className="space-y-2">
        {items.map((s) => (
          <button key={s.id} onClick={() => openDetail(s.id)}
            className="block w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-left hover:border-indigo-700">
            <div className="flex items-center justify-between">
              <span className="font-medium">{s.signalType}</span>
              <span className={`text-xs font-semibold ${sevColor[s.severity]}`}>{s.severity}</span>
            </div>
            <p className="mt-1 line-clamp-1 text-sm text-zinc-400">{s.rawContent}</p>
            <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
              <span>{s.tropel.name}</span><span>·</span><span>{s.status}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Sentinela para auto-cargar (infinite scroll real, sin botón) */}
      <div ref={sentinel} className="h-px" />

      {status === 'loadingMore' && <p className="py-3 text-center text-sm text-zinc-500">Cargando más…</p>}
      {status === 'error' && items.length > 0 && (
        <div className="py-3 text-center">
          <p className="text-sm text-rose-400">⚠ {error}</p>
          <button onClick={retry} className="mt-2 rounded-lg border border-zinc-700 px-4 py-1.5 text-sm">Reintentar</button>
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <p className="py-4 text-center text-sm text-zinc-600">— Fin del feed —</p>
      )}

      {/* Detalle como overlay: el feed sigue montado debajo => no se pierde el scroll */}
      {openId && <SignalDetail id={openId} onClose={closeDetail} onUpdated={onUpdated} />}
    </div>
  )
}
