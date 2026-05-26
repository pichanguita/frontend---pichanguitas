export const daysOfWeek = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
]

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
