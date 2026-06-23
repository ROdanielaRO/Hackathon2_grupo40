import { getToken } from './token'
import type {
  ApiErrorEnvelope, LoginRequest, LoginResponse, User, DashboardSummary,
  Page, Tropel, Signal, SignalFeedResponse, SectorListResponse, SectorStory,
  PatchableStatus,
} from './types'

const BASE = import.meta.env.VITE_API_BASE_URL

export class ApiError extends Error {
  status: number
  code: string
  details?: unknown
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

interface RequestOpts {
  method?: 'GET' | 'POST' | 'PATCH'
  body?: unknown
  signal?: AbortSignal
  auth?: boolean
}

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { method = 'GET', body, signal, auth = true } = opts
  const headers: Record<string, string> = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth) {
    const t = getToken()
    if (t) headers['Authorization'] = `Bearer ${t}`
  }
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })
  if (!res.ok) {
    let payload: ApiErrorEnvelope | null = null
    try { payload = (await res.json()) as ApiErrorEnvelope } catch { /* sin cuerpo */ }
    throw new ApiError(
      res.status,
      payload?.error ?? 'UNKNOWN',
      payload?.message ?? res.statusText,
      payload?.details,
    )
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

// ===== Endpoints tipados =====
export const api = {
  login: (data: LoginRequest) =>
    request<LoginResponse>('/auth/login', { method: 'POST', body: data, auth: false }),

  me: (signal?: AbortSignal) =>
    request<User>('/auth/me', { signal }),

  dashboard: (signal?: AbortSignal) =>
    request<DashboardSummary>('/dashboard/summary', { signal }),

  tropels: (query: string, signal?: AbortSignal) =>
    request<Page<Tropel>>(`/tropels${query ? `?${query}` : ''}`, { signal }),

  tropel: (id: string, signal?: AbortSignal) =>
    request<Tropel>(`/tropels/${id}`, { signal }),

  signalFeed: (query: string, signal?: AbortSignal) =>
    request<SignalFeedResponse>(`/signals/feed${query ? `?${query}` : ''}`, { signal }),

  signal: (id: string, signal?: AbortSignal) =>
    request<Signal>(`/signals/${id}`, { signal }),

  updateSignalStatus: (id: string, status: PatchableStatus, signal?: AbortSignal) =>
    request<Signal>(`/signals/${id}/status`, { method: 'PATCH', body: { status }, signal }),

  sectors: (signal?: AbortSignal) =>
    request<SectorListResponse>('/sectors', { signal }),

  sectorStory: (id: string, signal?: AbortSignal) =>
    request<SectorStory>(`/sectors/${id}/story`, { signal }),
}

export function errorMessage(e: unknown): string {
  if (e instanceof ApiError) return e.message
  if (e instanceof Error) return e.message
  return 'Error desconocido'
}
