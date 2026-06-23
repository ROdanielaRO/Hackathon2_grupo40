import { useEffect, useRef, useState } from 'react'
import { api, errorMessage } from '../lib/api'
import type { Page, Tropel } from '../lib/types'

type Status = 'loading' | 'success' | 'error'

interface Result {
  status: Status
  data: Page<Tropel> | null
  error: string | null
}

/**
 * `query` es el querystring derivado de la URL (page,size,filtros,sort).
 * Protección anti race-condition: cada request lleva un id incremental;
 * solo se aplica el resultado si sigue siendo la request más reciente.
 * Además se aborta la request anterior con AbortController.
 */
export function useTropels(query: string): Result {
  const [status, setStatus] = useState<Status>('loading')
  const [data, setData] = useState<Page<Tropel> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const latest = useRef(0)

  useEffect(() => {
    const id = ++latest.current
    const controller = new AbortController()
    setStatus('loading')
    setError(null)
    api.tropels(query, controller.signal)
      .then((res) => {
        if (id !== latest.current) return // respuesta vieja -> descartar
        setData(res)
        setStatus('success')
      })
      .catch((e) => {
        if (controller.signal.aborted) return
        if (id !== latest.current) return
        setError(errorMessage(e))
        setStatus('error')
      })
    return () => controller.abort()
  }, [query])

  return { status, data, error }
}
