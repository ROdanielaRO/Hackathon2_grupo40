/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}
interface ImportMeta {
  readonly env: ImportMetaEnv
}

// View Transition API (no siempre tipada)
interface Document {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> }
}
