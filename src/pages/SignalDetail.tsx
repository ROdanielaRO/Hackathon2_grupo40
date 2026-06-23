import { useEffect, useState } from 'react'
import { api, errorMessage } from '../lib/api'
import type { Signal, PatchableStatus } from '../lib/types'

interface Props {
  id: string
  onClose: () => void
  onUpdated: (s: Signal) => void
}

// Checkpoint 4: detalle + actualización de estado, como overlay sobre el feed.
export function SignalDetail({ id, onClose, onUpdated }: Props) {
  const [signal, setSignal] = useState<Signal | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [confirm, setConfirm] = useState<string | null>(null)

  useEffect(() => {
    const c = new AbortController()
    setStatus('loading'); setError(null)
    api.signal(id, c.signal)
      .then((s) => { setSignal(s); setStatus('success') })
      .catch((e) => { if (!c.signal.aborted) { setError(errorMessage(e)); setStatus('error') } })
    return () => c.abort()
  }, [id])

  // Cerrar con Escape (accesibilidad)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function update(next: PatchableStatus) {
    if (!signal) return
    const previous = signal
    setSaving(true); setSaveError(null); setConfirm(null)
    try {
      const updated = await api.updateSignalStatus(id, next)
      setSignal(updated)
      onUpdated(updated)            // refleja el cambio en el feed
      setConfirm(`Estado actualizado a ${updated.status}`)
    } catch (e) {
      setSignal(previous)           // conserva el estado anterior si falla
      setSaveError(errorMessage(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-30 flex justify-end bg-black/50" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-label="Detalle de señal"
        className="h-full w-full max-w-md overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Señal</h2>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-zinc-400 hover:bg-zinc-800">✕</button>
        </div>

        {status === 'loading' && <p className="text-zinc-400">Cargando…</p>}
        {status === 'error' && <p className="text-rose-400">⚠ {error}</p>}

        {status === 'success' && signal && (
          <div className="space-y-4">
            <Field label="Tipo" value={signal.signalType} />
            <Field label="Severidad" value={signal.severity} />
            <Field label="Estado actual" value={signal.status} />
            <Field label="Tropel" value={`${signal.tropel.name} (${signal.tropel.species})`} />
            <div>
              <p className="text-xs text-zinc-500">Contenido</p>
              <p className="mt-1 rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 text-sm">{signal.rawContent}</p>
            </div>

            <div className="space-y-2 border-t border-zinc-800 pt-4">
              <p className="text-xs text-zinc-500">Actualizar estado</p>
              <div className="flex gap-2">
                <button disabled={saving} onClick={() => update('PROCESANDO')}
                  className="flex-1 rounded-lg bg-amber-500/20 py-2 text-sm text-amber-200 disabled:opacity-50">
                  {saving ? '…' : 'PROCESANDO'}
                </button>
                <button disabled={saving} onClick={() => update('ATENDIDA')}
                  className="flex-1 rounded-lg bg-emerald-500/20 py-2 text-sm text-emerald-200 disabled:opacity-50">
                  {saving ? '…' : 'ATENDIDA'}
                </button>
              </div>
              {confirm && <p className="text-sm text-emerald-400">✓ {confirm}</p>}
              {saveError && (
                <div className="text-sm text-rose-400">
                  <p>⚠ {saveError}</p>
                  <p className="text-zinc-500">El estado anterior se conservó. Puedes reintentar.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="text-sm">{value}</p>
    </div>
  )
}
