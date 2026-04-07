/**
 * Constantes de Tipos de Deporte
 *
 * Valores extraídos de bookingStore.js - sportTypes array
 */

export const SPORT_TYPES = {
  FUTBOL: 'futbol',
  FUTBOL7: 'futbol7',
  FUTSAL: 'futsal',
  VOLEY: 'voley',
  BASQUET: 'basquet',
  TENIS: 'tenis',
}

// Labels para UI
export const SPORT_TYPE_LABELS = {
  [SPORT_TYPES.FUTBOL]: 'Fútbol',
  [SPORT_TYPES.FUTBOL7]: 'Fútbol 7',
  [SPORT_TYPES.FUTSAL]: 'Futsal',
  [SPORT_TYPES.VOLEY]: 'Vóley',
  [SPORT_TYPES.BASQUET]: 'Básquet',
  [SPORT_TYPES.TENIS]: 'Tenis',
}

// Emojis para UI (opcional, para usar en cards/badges)
export const SPORT_TYPE_EMOJIS = {
  [SPORT_TYPES.FUTBOL]: '⚽',
  [SPORT_TYPES.FUTBOL7]: '⚽',
  [SPORT_TYPES.FUTSAL]: '⚽',
  [SPORT_TYPES.VOLEY]: '🏐',
  [SPORT_TYPES.BASQUET]: '🏀',
  [SPORT_TYPES.TENIS]: '🎾',
}

// Colores temáticos por deporte
export const SPORT_TYPE_COLORS = {
  [SPORT_TYPES.FUTBOL]: 'green',
  [SPORT_TYPES.FUTBOL7]: 'emerald',
  [SPORT_TYPES.FUTSAL]: 'lime',
  [SPORT_TYPES.VOLEY]: 'blue',
  [SPORT_TYPES.BASQUET]: 'orange',
  [SPORT_TYPES.TENIS]: 'yellow',
}

// Array de valores válidos
export const VALID_SPORT_TYPES = Object.values(SPORT_TYPES)

// Array de objetos para uso en selects (mantiene compatibilidad con código existente)
export const SPORT_TYPES_ARRAY = [
  { id: SPORT_TYPES.FUTBOL, name: SPORT_TYPE_LABELS[SPORT_TYPES.FUTBOL], emoji: '⚽' },
  { id: SPORT_TYPES.FUTBOL7, name: SPORT_TYPE_LABELS[SPORT_TYPES.FUTBOL7], emoji: '⚽' },
  { id: SPORT_TYPES.FUTSAL, name: SPORT_TYPE_LABELS[SPORT_TYPES.FUTSAL], emoji: '⚽' },
  { id: SPORT_TYPES.VOLEY, name: SPORT_TYPE_LABELS[SPORT_TYPES.VOLEY], emoji: '🏐' },
  { id: SPORT_TYPES.BASQUET, name: SPORT_TYPE_LABELS[SPORT_TYPES.BASQUET], emoji: '🏀' },
  { id: SPORT_TYPES.TENIS, name: SPORT_TYPE_LABELS[SPORT_TYPES.TENIS], emoji: '🎾' },
]
