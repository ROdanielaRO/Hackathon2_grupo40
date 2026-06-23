import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTropels } from '../hooks/useTropels'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { api } from '../lib/api'
import type { SectorListItem, Species, VitalState, TropelSort } from '../lib/types'
import { Loading, ErrorView, Empty } from '../components/StateView'

const SPECIES: Species[] = ['BLOBITO', 'CHISPA', 'GRUNON', 'DORMILON', 'GLITCHY']
const VITALS: VitalState[] = ['ESTABLE', 'HAMBRIENTO', 'AGITADO', 'MUTANDO', 'CRITICO']
const SORTS: TropelSort[] = ['updatedAt,desc', 'name,asc', 'chaosIndex,desc']
const SIZES = ['10', '20', '50']

// Construye el querystring para el backend desde la URL (con defaults/validación).
function buildQuery(sp: URLSearchParams): string {
  const out = new URLSearchParams()
  out.set('page', sp.get('page') ?? '0')
  const size = sp.get('size') ?? '20'
  out.set('size', SIZES.includes(size) ? size : '20')
  out.set('sort', SORTS.includes((sp.get('sort') ?? '') as TropelSort) ? sp.get('sort')! : 'updatedAt,desc')
  for (const k of ['species', 'vitalState', 'sectorId', 'q'] as const) {
    const v = sp.get(k)
    if (v) out.set(k, v)
  }
  return out.toString()
}

export function TropelsPage() {
  const [sp, setSp] = useSearchParams()
  const query = useMemo(() => buildQuery(sp), [sp])
  const { status, data, error } = useTropels(query)

  const [sectors, setSectors] = useState<SectorListItem[]>([])
  useEffect(() => {
    const c = new AbortController()
    api.sectors(c.signal).then((r) => setSectors(r.items)).catch(() => {})
    return () => c.abort()
  }, [])

  // Búsqueda con debounce: la URL es la fuente de verdad.
  const [qInput, setQInput] = useState(sp.get('q') ?? '')
  const debouncedQ = useDebouncedValue(qInput, 350)
  useEffect(() => {
    setSp((prev) => {
      const next = new URLSearchParams(prev)
      if (debouncedQ) next.set('q', debouncedQ); else next.delete('q')
      next.set('page', '0')
      return next
    }, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ])

  function patch(key: string, value: string) {
    setSp((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value); else next.delete(key)
      if (key !== 'page') next.set('page', '0') // resetear página al filtrar/ordenar
      return next
    })
  }

  const page = Number(sp.get('page') ?? '0')

  const selectCls = 'rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm'

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Atlas de Tropeles</h1>

      <div className="flex flex-wrap gap-2">
        <input
          className={selectCls + ' min-w-[180px] flex-1'}
          placeholder="Buscar…" value={qInput} maxLength={80}
          onChange={(e) => setQInput(e.target.value)} />
        <select className={selectCls} value={sp.get('species') ?? ''} onChange={(e) => patch('species', e.target.value)}>
          <option value="">Especie</option>
          {SPECIES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={selectCls} value={sp.get('vitalState') ?? ''} onChange={(e) => patch('vitalState', e.target.value)}>
          <option value="">Estado vital</option>
          {VITALS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={selectCls} value={sp.get('sectorId') ?? ''} onChange={(e) => patch('sectorId', e.target.value)}>
          <option value="">Sector</option>
          {sectors.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select className={selectCls} value={sp.get('sort') ?? 'updatedAt,desc'} onChange={(e) => patch('sort', e.target.value)}>
          {SORTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className={selectCls} value={sp.get('size') ?? '20'} onChange={(e) => patch('size', e.target.value)}>
          {SIZES.map((s) => <option key={s} value={s}>{s} / pág</option>)}
        </select>
      </div>

      {/* Contenedor de altura mínima fija: el layout no salta entre estados */}
      <div className="min-h-[420px]">
        {status === 'loading' && <Loading label="Cargando tropeles…" />}
        {status === 'error' && <ErrorView message={error!} onRetry={() => patch('page', String(page))} />}
        {status === 'success' && data && data.content.length === 0 && <Empty />}
        {status === 'success' && data && data.content.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900/60 text-zinc-400">
                <tr>
                  <th className="p-3">Nombre</th><th className="p-3">Especie</th>
                  <th className="p-3">Estado</th><th className="p-3">Caos</th>
                  <th className="p-3">Sector</th><th className="p-3">Guardián</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((t) => (
                  <tr key={t.id} className="border-t border-zinc-800/60">
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3 text-zinc-400">{t.species}</td>
                    <td className="p-3">{t.vitalState}</td>
                    <td className="p-3 font-mono text-indigo-300">{t.chaosIndex}</td>
                    <td className="p-3 text-zinc-400">{t.sector.name}</td>
                    <td className="p-3 text-zinc-400">{t.guardianName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && (
        <div className="flex items-center justify-between text-sm text-zinc-400">
          <span>{data.totalElements} tropeles · página {data.currentPage + 1} de {data.totalPages}</span>
          <div className="flex gap-2">
            <button
              disabled={page <= 0}
              onClick={() => patch('page', String(page - 1))}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 disabled:opacity-40">Anterior</button>
            <button
              disabled={page >= data.totalPages - 1}
              onClick={() => patch('page', String(page + 1))}
              className="rounded-lg border border-zinc-700 px-3 py-1.5 disabled:opacity-40">Siguiente</button>
          </div>
        </div>
      )}
    </div>
  )
}
