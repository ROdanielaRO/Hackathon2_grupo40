import type { SectorStory } from './types'

// Datos de prueba con la MISMA forma que /sectors/:id/story.
// Sirve para pulir CP5 antes de tener backend. Se activa con ?mock=1
export const MOCK_STORY: SectorStory = {
  sector: { id: 'sec_mock', name: 'Bosque Norte', climate: 'PIXEL_FOREST' },
  stages: [
    { id: 's0', order: 0, title: 'Primer pulso', dominantEvent: 'HAMBRE',
      narrative: 'La actividad despierta entre pixeles verdes. Los primeros tropeles emiten señales tenues que apenas rozan el umbral.',
      metrics: { stability: 68, energy: 72, alerts: 4 }, assetKey: 'pixel-forest-dawn', colorToken: 'emerald', progress: 0 },
    { id: 's1', order: 1, title: 'Hambre creciente', dominantEvent: 'HAMBRE',
      narrative: 'Los niveles de energía caen. Varias criaturas reclaman atención y el sector empieza a tensarse.',
      metrics: { stability: 61, energy: 58, alerts: 9 }, assetKey: 'pixel-forest-noon', colorToken: 'violet', progress: 0.14 },
    { id: 's2', order: 2, title: 'Primer abandono', dominantEvent: 'ABANDONO',
      narrative: 'Un guardián deja su puesto. La carga se redistribuye y la estabilidad sufre su primera caída brusca.',
      metrics: { stability: 52, energy: 55, alerts: 14 }, assetKey: 'pixel-forest-dusk', colorToken: 'cyan', progress: 0.28 },
    { id: 's3', order: 3, title: 'Mutaciones', dominantEvent: 'MUTACION',
      narrative: 'Patrones inestables recorren el sector. Algunas criaturas entran en fase de mutación acelerada.',
      metrics: { stability: 47, energy: 63, alerts: 21 }, assetKey: 'pixel-forest-glitch', colorToken: 'amber', progress: 0.42 },
    { id: 's4', order: 4, title: 'Conflicto', dominantEvent: 'CONFLICTO',
      narrative: 'Dos colonias chocan por territorio. La energía se dispara mientras la estabilidad se desploma.',
      metrics: { stability: 38, energy: 81, alerts: 33 }, assetKey: 'pixel-forest-storm', colorToken: 'rose', progress: 0.57 },
    { id: 's5', order: 5, title: 'Fuga masiva', dominantEvent: 'FUGA',
      narrative: 'Un grupo escapa del perímetro. Los sensores pierden rastro y las alertas se multiplican.',
      metrics: { stability: 33, energy: 70, alerts: 41 }, assetKey: 'pixel-forest-night', colorToken: 'indigo', progress: 0.71 },
    { id: 's6', order: 6, title: 'Contención', dominantEvent: 'REPRODUCCION_MASIVA',
      narrative: 'Los operadores recuperan el control. La población se estabiliza y las señales corruptas disminuyen.',
      metrics: { stability: 54, energy: 66, alerts: 18 }, assetKey: 'pixel-forest-recover', colorToken: 'lime', progress: 0.85 },
    { id: 's7', order: 7, title: 'Nuevo equilibrio', dominantEvent: 'HAMBRE',
      narrative: 'El sector vuelve a respirar. La estabilidad se asienta en un nivel sostenible y el ciclo se cierra.',
      metrics: { stability: 72, energy: 69, alerts: 6 }, assetKey: 'pixel-forest-balance', colorToken: 'sky', progress: 1 },
  ],
}
