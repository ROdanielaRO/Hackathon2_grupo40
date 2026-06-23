# TropelCare Control Room

Consola operativa en React + TypeScript para la hackathon *Pizza Protocol*.

## Integrantes
- A — <nombre> — <código>
- B — <nombre> — <código>
- C — <nombre> — <código>

## Stack
React 18 · TypeScript estricto · Vite · React Router · Tailwind CSS · Fetch API.
Sin React Query/SWR ni dashboards prefabricados. Fetch, cache y scroll infinito
están implementados a mano.

## Instalación
```bash
npm install
cp .env.example .env   # y poner la VITE_API_BASE_URL del equipo
npm run dev            # http://localhost:5173
```

## Comandos
| Comando | Uso |
|---------|-----|
| `npm run dev` | desarrollo |
| `npm run typecheck` | tsc sin errores |
| `npm run build` | build de producción |
| `npm run preview` | servir el build |

## Variables requeridas
```
VITE_API_BASE_URL=https://<backend-url>/api/v1
```

## Deploy
- Link: <pegar-link>
- SPA configurado para abrir cualquier ruta directa: `vercel.json` (Vercel) y
  `public/_redirects` (Netlify).

## Decisiones técnicas
- **Estado en la URL (CP2):** `useSearchParams` es la única fuente de verdad de
  filtros, búsqueda, orden, página y tamaño. Compartir/recargar restaura el estado.
- **Race conditions (CP2):** cada request lleva un id incremental + `AbortController`;
  solo se aplica la respuesta más reciente, descartando las que llegan tarde.
- **Feed infinito por cursor (CP3):** `IntersectionObserver` dispara la carga,
  deduplicación por `id` con `Set`, una sola carga en vuelo, y un `token` que
  descarta páginas de filtros obsoletos. En error se conservan las páginas cargadas.
- **Detalle como overlay (CP4):** se abre con `?signal=<id>` sin desmontar el feed,
  por lo que no se pierde el scroll; el PATCH refleja el cambio en la lista y hace
  rollback si falla.
- **Scrollytelling (CP5):** visual sticky persistente que cambia según la etapa
  activa (detectada con `IntersectionObserver`). CSS Scroll-driven Animations con
  `@supports` y fallback; View Transition API con fallback; soporte de
  `prefers-reduced-motion`; navegación por teclado (flechas) y secciones focusables.
