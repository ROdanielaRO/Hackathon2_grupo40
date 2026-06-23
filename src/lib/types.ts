// ===== Enums del contrato (sin `any`) =====
export type Species = 'BLOBITO' | 'CHISPA' | 'GRUNON' | 'DORMILON' | 'GLITCHY'
export type VitalState = 'ESTABLE' | 'HAMBRIENTO' | 'AGITADO' | 'MUTANDO' | 'CRITICO'
export type SignalType =
  | 'HAMBRE' | 'ABANDONO' | 'MUTACION' | 'FUGA'
  | 'CONFLICTO' | 'REPRODUCCION_MASIVA' | 'SENAL_CORRUPTA'
export type Severity = 'LEVE' | 'MODERADO' | 'GRAVE' | 'CRITICO'
export type SignalStatus = 'RECIBIDA' | 'PROCESANDO' | 'ATENDIDA'
export type Climate = 'PIXEL_FOREST' | 'NEON_CAVE' | 'CLOUD_AQUARIUM' | 'RETRO_ARCADE'
export type TropelSort = 'name,asc' | 'updatedAt,desc' | 'chaosIndex,desc'

// Solo se pueden setear estos dos vía PATCH
export type PatchableStatus = 'PROCESANDO' | 'ATENDIDA'

// ===== Auth =====
export interface User {
  id: string
  displayName: string
  email: string
  teamCode: string
  role: string
}
export interface LoginResponse {
  token: string
  expiresAt: string
  user: User
}
export interface LoginRequest {
  teamCode: string
  email: string
  password: string
}

// ===== Dashboard =====
export interface DashboardSummary {
  totalTropels: number
  criticalTropels: number
  openSignals: number
  sectorStabilityAvg: number
  signalsBySeverity: Record<Severity, number>
  generatedAt: string
}

// ===== Tropel =====
export interface TropelSectorRef {
  id: string
  name: string
  sectorCode: string
}
export interface Tropel {
  id: string
  name: string
  species: Species
  vitalState: VitalState
  energyLevel: number
  chaosIndex: number
  mutationStage: number
  guardianName: string
  sector: TropelSectorRef
  createdAt: string
  updatedAt: string
}
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  currentPage: number
  size: number
}

// ===== Signal =====
export interface SignalTropelRef {
  id: string
  name: string
  species: Species
}
export interface Signal {
  id: string
  signalType: SignalType
  severity: Severity
  status: SignalStatus
  rawContent: string
  tropel: SignalTropelRef
  createdAt: string
  updatedAt: string
}
export interface SignalFeedResponse {
  items: Signal[]
  nextCursor: string | null
  hasMore: boolean
  totalEstimate: number
}

// ===== Sectores y Story =====
export interface SectorListItem {
  id: string
  sectorCode: string
  name: string
  climate: Climate
  capacity: number
  currentLoad: number
  stabilityLevel: number
}
export interface SectorListResponse {
  items: SectorListItem[]
}
export interface StoryStageMetrics {
  stability: number
  energy: number
  alerts: number
}
export interface StoryStage {
  id: string
  order: number
  title: string
  narrative: string
  dominantEvent: SignalType
  metrics: StoryStageMetrics
  assetKey: string
  colorToken: string
  progress: number
}
export interface SectorStory {
  sector: { id: string; name: string; climate: Climate }
  stages: StoryStage[]
}

// ===== Error =====
export interface ApiErrorEnvelope {
  error: string
  message: string
  timestamp: string
  path: string
  details?: unknown
}
