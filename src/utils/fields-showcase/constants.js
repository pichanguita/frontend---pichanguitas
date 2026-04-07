/**
 * Constantes para el componente FieldsShowcase
 */

// Variantes de animación para el contenedor
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

// Variantes de animación para las tarjetas
export const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

// Íconos de deportes
export const SPORT_ICONS = {
  futbol11: '⚽ F11',
  futbol: '⚽ Fútbol',
  futsal: '⚽ Futsal',
  voley: '🏐 Vóley',
  basquet: '🏀 Básquet',
  tenis: '🎾 Tenis',
  estadio: '🏟️ Estadio',
  multiuso: '🏟️ Multi',
}

// Íconos de deportes para modal (formato completo)
export const SPORT_ICONS_FULL = {
  futbol11: '⚽ Fútbol 11',
  futbol: '⚽ Fútbol',
  futsal: '⚽ Futsal',
  voley: '🏐 Vóley',
  basquet: '🏀 Básquet',
  tenis: '🎾 Tenis',
  estadio: '🏟️ Estadio',
  multiuso: '🏟️ Multideportiva',
}

// Nombres de días en español
export const DAY_NAMES = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

// Etiquetas de dimensiones
export const DIMENSION_LABELS = {
  length: 'Largo',
  width: 'Ancho',
  area: 'Área',
  goalSize: 'Tamaño de arco',
  netHeight: 'Altura de red',
  basketHeight: 'Altura de canasta',
  courtType: 'Tipo de cancha',
  surfaceType: 'Superficie',
  tribuneCapacity: 'Capacidad tribunas',
}
