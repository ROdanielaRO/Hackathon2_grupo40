import { useCallback, useEffect, useRef, useState } from 'react'
import { api, errorMessage } from '../lib/api'
import type { Signal } from '../lib/types'

type Status = 'loading' | 'loadingMore' | 'success' | 'error'

interface FeedResult {
  items: Signal[]
  hasMore: boolean
  total: number
  status: Status
  error: string | null
  loadMore: () => void
  retry: () => void
  patchItem: (s: Signal) => void
}

/**
 * Feed infinito basado en cursor.
 * - Deduplica por id (Set).
 * - Solo una carga en vuelo (inFlight ref).
 * - Al cambiar `query` (filtros desde la URL) resetea y aborta lo anterior.
 * - `token` evita aplicar páginas de filtros obsoletos.
 * - En error conserva las páginas ya cargadas y permite reintentar.
 */
export function useSignalFeed(query: string): FeedResult {
  const [items, setItems] = useState<Signal[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  const [status, setStatus] = useState<Status>('loading')
  const [error, setError] = useState<string | null>(null)

  const seen = useRef<Set<string>>(new Set())
  const inFlight = useRef(false)
  const token = useRef(0)
  const controllerRef = useRef<AbortController | null>(null)
  const cursorRef = useRef<string | null>(null)

  const fetchPage = useCallback(
    async (cur: string | null, myToken: number, isFirst: boolean) => {
      if (inFlight.current) return
      inFlight.current = true
      const controller = new AbortController()
      controllerRef.current = controller
      setError(null)
      setStatus(isFirst ? 'loading' : 'loadingMore')
      try {
        const sep = query ? '&' : ''
        const q = cur ? `${query}${sep}cursor=${encodeURIComponent(cur)}` : query
        const res = await api.signalFeed(q, controller.signal)
        if (myToken !== token.current) return // filtros cambiaron -> descartar
        const fresh = res.items.filter((i) => !seen.current.has(i.id))
        fresh.forEach((i) => seen.current.add(i.id))
        setItems((prev) => (isFirst ? fresh : [...prev, ...fresh]))
        cursorRef.current = res.nextCursor
        setHasMore(res.hasMore)
        setTotal(res.totalEstimate)
        setStatus('success')
      } catch (e) {
        if (controller.signal.aborted) return
        if (myToken !== token.current) return
        setError(errorMessage(e))
        setStatus('error') // se conservan los items ya cargados
      } finally {
        if (myToken === token.current) inFlight.current = false
      }
    },
    [query],
  )

  // Reset + primera carga cuando cambian los filtros
  useEffect(() => {
    token.current++
    const myToken = token.current
    controllerRef.current?.abort()
    inFlight.current = false
    seen.current = new Set()
    setItems([])
    cursorRef.current = null
    setHasMore(true)
    setTotal(0)
    void fetchPage(null, myToken, true)
    return () => controllerRef.current?.abort()
  }, [query, fetchPage])

  const loadMore = useCallback(() => {
    if (inFlight.current || !hasMore || status === 'loading') return
    void fetchPage(cursorRef.current, token.current, false)
  }, [hasMore, status, fetchPage])

  const retry = useCallback(() => {
    void fetchPage(cursorRef.current, token.current, items.length === 0)
  }, [items.length, fetchPage])

  const patchItem = useCallback((s: Signal) => {
    setItems((prev) => prev.map((i) => (i.id === s.id ? s : i)))
  }, [])

  return { items, hasMore, total, status, error, loadMore, retry, patchItem }
}
