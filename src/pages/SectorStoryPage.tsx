import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { api, errorMessage } from '../lib/api'
import type { SectorStory, StoryStage } from '../lib/types'
import { MOCK_STORY } from '../lib/mockStory'
import { Loading, ErrorView } from '../components/StateView'
import './story.css'

// colorToken -> color CSS. Completar si el backend devuelve tokens nuevos.
// Los 8 tokens que genera el backend (uno por etapa), en orden:
// emerald, violet, cyan, amber, rose, indigo, lime, sky
const TOKENS: Record<string, string> = {
  emerald: '#10b981', violet: '#8b5cf6', cyan: '#06b6d4', amber: '#f59e0b',
  rose: '#f43f5e', indigo: '#6366f1', lime: '#84cc16', sky: '#0ea5e9',
}
const colorOf = (t: string) => TOKENS[t] ?? '#6366f1'

export function SectorStoryPage() {
  const { id } = useParams<{ id: string }>()
  const [sp] = useSearchParams()
  const isMock = sp.get('mock') === '1' // dev sin backend ni login
  const navigate = useNavigate()

  const [story, setStory] = useState<SectorStory | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)
  const [active, setActive] = useState(0)

  const stageRefs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    if (isMock) { setStory(MOCK_STORY); setStatus('success'); return }
    if (!id) return
    const c = new AbortController()
    setStatus('loading')
    api.sectorStory(id, c.signal)
      .then((s) => { setStory(s); setStatus('success') })
      .catch((e) => { if (!c.signal.aborted) { setError(errorMessage(e)); setStatus('error') } })
    return () => c.abort()
  }, [id, nonce, isMock])

  // Etapa activa por scroll (también funciona con reduced-motion)
  useEffect(() => {
    if (status !== 'success') return
    const ratios = new Map<number, number>()
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const idx = Number((e.target as HTMLElement).dataset.idx)
        ratios.set(idx, e.isIntersecting ? e.intersectionRatio : 0)
      }
      let best = 0, max = -1
      ratios.forEach((r, i) => { if (r > max) { max = r; best = i } })
      setActive(best)
    }, { threshold: [0.25, 0.5, 0.75], rootMargin: '-20% 0px -20% 0px' })
    stageRefs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [status])

  const goToStage = useCallback((idx: number) => {
    const el = stageRefs.current[idx]
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }) }
  }, [])

  // Navegación por teclado: flechas mueven de etapa sin perder contenido
  useEffect(() => {
    if (status !== 'success' || !story) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault(); goToStage(Math.min(active + 1, story.stages.length - 1))
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault(); goToStage(Math.max(active - 1, 0))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, status, story, goToStage])

  function back() {
    const nav = () => navigate('/sectors')
    if (document.startViewTransition) document.startViewTransition(nav)
    else nav()
  }

  if (status === 'loading') return <Loading label="Cargando historia…" />
  if (status === 'error') return <ErrorView message={error!} onRetry={() => setNonce((n) => n + 1)} />
  if (!story) return null

  const current: StoryStage = story.stages[active] ?? story.stages[0]!
  const accent = colorOf(current.colorToken)
  const progress = story.stages.length > 1 ? active / (story.stages.length - 1) : 1

  return (
    <div className="-mx-4 -my-6">
      <div className="fixed left-0 top-0 z-40 h-1 w-full bg-zinc-800">
        <div className="scroll-progress-bar h-full" style={{ background: accent, width: `${progress * 100}%` }} />
      </div>

      <div className="grid gap-0 md:grid-cols-2">
        {/* Visual persistente sticky que cambia con la etapa activa */}
        <aside
          className="sticky top-0 flex h-[60vh] flex-col justify-between p-8 transition-colors duration-500 md:h-screen"
          style={{ background: `radial-gradient(circle at 30% 30%, ${accent}33, #0a0a0f 70%)` }}
          aria-hidden="true"
        >
          <div>
            <button onClick={back} className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/80 hover:bg-white/10">
              ← Sectores
            </button>
            <p className="mt-6 text-sm uppercase tracking-widest text-white/50">{story.sector.name}</p>
            <p className="text-xs text-white/40">{story.sector.climate}</p>
          </div>
          <div
            className="grid aspect-square w-full max-w-xs place-items-center self-center rounded-3xl transition-all duration-500"
            style={{ background: `linear-gradient(135deg, ${accent}, #0a0a0f)`, boxShadow: `0 0 80px ${accent}55` }}
          >
            <span className="font-mono text-5xl font-bold text-white/90">{active + 1}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <Metric label="Estabilidad" value={current.metrics.stability} accent={accent} />
            <Metric label="Energía" value={current.metrics.energy} accent={accent} />
            <Metric label="Alertas" value={current.metrics.alerts} accent={accent} />
          </div>
        </aside>

        {/* Narrativa por etapas activada por scroll */}
        <div className="px-6 py-[20vh]">
          <nav aria-label="Etapas" className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 md:flex">
            {story.stages.map((s, i) => (
              <button key={s.id} onClick={() => goToStage(i)} aria-label={`Ir a etapa ${i + 1}`}
                className="h-2.5 w-2.5 rounded-full transition-all"
                style={{ background: i === active ? accent : '#3f3f46', transform: i === active ? 'scale(1.4)' : 'scale(1)' }} />
            ))}
          </nav>

          {story.stages.map((s, i) => (
            <section
              key={s.id}
              data-idx={i}
              ref={(el) => { stageRefs.current[i] = el }}
              tabIndex={0}
              aria-label={`Etapa ${i + 1}: ${s.title}`}
              className="story-stage mb-[30vh] max-w-prose scroll-mt-24 outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              <p className="mb-2 font-mono text-sm" style={{ color: colorOf(s.colorToken) }}>
                Etapa {i + 1} / {story.stages.length} · {s.dominantEvent}
              </p>
              <h2 className="text-2xl font-bold">{s.title}</h2>
              <p className="mt-3 leading-relaxed text-zinc-300">{s.narrative}</p>
              <div className="mt-4 flex gap-4 text-xs text-zinc-500">
                <span>Estabilidad {s.metrics.stability}</span>
                <span>Energía {s.metrics.energy}</span>
                <span>Alertas {s.metrics.alerts}</span>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-2">
      <p className="font-mono text-xl font-bold" style={{ color: accent }}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-white/50">{label}</p>
    </div>
  )
}
