// Estados de loading / error / vacío que NO mueven el layout.
export function CenteredBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-[200px] place-items-center rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 text-center text-sm text-zinc-400">
      {children}
    </div>
  )
}

export function Loading({ label = 'Cargando…' }: { label?: string }) {
  return <CenteredBox><span className="animate-pulse">{label}</span></CenteredBox>
}

export function Empty({ label = 'Sin resultados' }: { label?: string }) {
  return <CenteredBox>{label}</CenteredBox>
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <CenteredBox>
      <div className="space-y-3">
        <p className="text-rose-400">⚠ {message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="rounded-lg bg-rose-500/20 px-4 py-2 text-rose-200 hover:bg-rose-500/30"
          >
            Reintentar
          </button>
        )}
      </div>
    </CenteredBox>
  )
}
