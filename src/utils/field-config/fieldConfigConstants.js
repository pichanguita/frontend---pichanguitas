export const daysOfWeek = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
]

export const fieldTypes = [
  { value: 'futbol11', label: 'Fútbol 11 vs 11' },
  { value: 'futbol9', label: 'Fútbol 9 vs 9' },
  { value: 'futbol7', label: 'Fútbol 7 vs 7' },
  { value: 'futbol6', label: 'Fútbol 6 vs 6' },
  { value: 'futsal', label: 'Futsal/Fútbol 5 vs 5' },
  { value: 'basquet', label: 'Básquet 5 vs 5' },
  { value: 'voley', label: 'Vóley 6 vs 6' },
  { value: 'tenis', label: 'Tenis 1 vs 1 / 2 vs 2' },
  { value: 'estadio', label: 'Estadio (Múltiples deportes)' },
  { value: 'multiuso', label: 'Multiuso (Configurable)' },
]

export const getFieldTypeInfo = (fieldType) => {
  const info = {
    futbol11:
      '⚽ Campo de fútbol profesional (100x64m aprox). Ideal para partidos de 11 vs 11. Requiere césped natural o sintético de alta calidad.',
    futbol9:
      '⚽ Campo de fútbol reducido (70x50m aprox). Perfect para partidos de 9 vs 9. Muy popular para competencias locales.',
    futbol7:
      '⚽ Campo de fútbol 7 (65x45m aprox). Ideal para partidos de 7 vs 7. Formato muy dinámico y entretenido.',
    futbol6:
      '⚽ Campo de fútbol 6 (60x40m aprox). Perfecto para partidos de 6 vs 6. Formato compacto y ágil.',
    futsal:
      '⚽ Cancha de futsal (40x20m). Superficie dura, partidos de 5 vs 5. Muy técnico y de alta velocidad.',
    basquet:
      '🏀 Cancha de básquet (28x15m). Superficie de concreto o parquet. Partidos de 5 vs 5 con canastas a 3.05m.',
    voley:
      '🏐 Cancha de vóley (18x9m). Con red a 2.43m (hombres) o 2.24m (mujeres). Partidos de 6 vs 6.',
    tenis:
      '🎾 Cancha de tenis (23.77x10.97m). Superficie de arcilla, césped o cemento. Individual (1v1) o dobles (2v2).',
    estadio:
      '🏟️ Estadio multideportivo. Puede albergar diferentes deportes según configuración y necesidades.',
    multiuso:
      '🏟️ Cancha configurable para múltiples deportes. Adaptable según requerimientos específicos.',
  }
  return info[fieldType] || 'Selecciona un tipo de cancha para ver más información.'
}

export const getSuggestedCapacity = (fieldType) => {
  const capacities = {
    futbol11: 50,
    futbol9: 35,
    futbol7: 30,
    futbol6: 25,
    futsal: 20,
    basquet: 30,
    voley: 25,
    tenis: 10,
    estadio: 500,
    multiuso: 40,
  }
  return capacities[fieldType] || 22
}

// Defaults UX del formulario admin de creación de cancha.
// Solo son valores pre-rellenados: el admin los ajusta antes de guardar.
// El comparador del backend interpreta HH:MM literal (no se asume "cierre al día siguiente"),
// por eso no usamos '00:00' como closeTime — sería ambiguo y bloquearía reservas nocturnas.
export const DEFAULT_SCHEDULE_OPEN_TIME = '17:00'
export const DEFAULT_SCHEDULE_OPEN_TIME_WEEKEND = '08:00'
export const DEFAULT_SCHEDULE_CLOSE_TIME = '23:00'

const buildDefaultDay = (openTime) => ({
  isOpen: true,
  openTime,
  closeTime: DEFAULT_SCHEDULE_CLOSE_TIME,
})

export const INITIAL_CONFIG = {
  schedule: {
    monday: buildDefaultDay(DEFAULT_SCHEDULE_OPEN_TIME),
    tuesday: buildDefaultDay(DEFAULT_SCHEDULE_OPEN_TIME),
    wednesday: buildDefaultDay(DEFAULT_SCHEDULE_OPEN_TIME),
    thursday: buildDefaultDay(DEFAULT_SCHEDULE_OPEN_TIME),
    friday: buildDefaultDay(DEFAULT_SCHEDULE_OPEN_TIME),
    saturday: buildDefaultDay(DEFAULT_SCHEDULE_OPEN_TIME_WEEKEND),
    sunday: buildDefaultDay(DEFAULT_SCHEDULE_OPEN_TIME_WEEKEND),
  },
  maintenanceSchedule: [],
  specialPricing: [],
  amenities: [],
  rules: [],
  capacity: 22,
  fieldType: 'football',
  isActive: true,
  requiresManualConfirmation: false,
  customImages: [],
  cancellationPolicy: {
    allowCancellation: true,
    hoursBeforeEvent: 24,
    refundPercentage: 0,
  },
}
