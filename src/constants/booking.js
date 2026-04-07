/**
 * Constantes de configuración para reservas
 *
 * Centraliza valores de configuración para evitar hardcodeo en componentes
 */

// ==================== HORARIOS ====================

/**
 * Configuración de horarios de las canchas
 */
export const FIELD_HOURS = {
  OPENING_HOUR: 6, // 6:00 AM
  CLOSING_HOUR: 23, // 11:00 PM (23:00)
  SLOT_INTERVAL: 60, // Intervalos de 1 hora
}

/**
 * Rangos de tiempo disponibles para filtrado de reservas
 * Constante de UI - no es mock data del backend
 * Los horarios específicos de cada cancha se cargan desde la API
 */
export const DEFAULT_TIME_RANGES = [
  { id: '6am', label: '6:00 AM', startTime: '06:00', endTime: '07:00' },
  { id: '7am', label: '7:00 AM', startTime: '07:00', endTime: '08:00' },
  { id: '8am', label: '8:00 AM', startTime: '08:00', endTime: '09:00' },
  { id: '9am', label: '9:00 AM', startTime: '09:00', endTime: '10:00' },
  { id: '10am', label: '10:00 AM', startTime: '10:00', endTime: '11:00' },
  { id: '11am', label: '11:00 AM', startTime: '11:00', endTime: '12:00' },
  { id: '12pm', label: '12:00 PM', startTime: '12:00', endTime: '13:00' },
  { id: '1pm', label: '1:00 PM', startTime: '13:00', endTime: '14:00' },
  { id: '2pm', label: '2:00 PM', startTime: '14:00', endTime: '15:00' },
  { id: '3pm', label: '3:00 PM', startTime: '15:00', endTime: '16:00' },
  { id: '4pm', label: '4:00 PM', startTime: '16:00', endTime: '17:00' },
  { id: '5pm', label: '5:00 PM', startTime: '17:00', endTime: '18:00' },
  { id: '6pm', label: '6:00 PM', startTime: '18:00', endTime: '19:00' },
  { id: '7pm', label: '7:00 PM', startTime: '19:00', endTime: '20:00' },
  { id: '8pm', label: '8:00 PM', startTime: '20:00', endTime: '21:00' },
  { id: '9pm', label: '9:00 PM', startTime: '21:00', endTime: '22:00' },
  { id: '10pm', label: '10:00 PM', startTime: '22:00', endTime: '23:00' },
  { id: '11pm', label: '11:00 PM', startTime: '23:00', endTime: '00:00' },
]

/**
 * Obtiene un rango de tiempo por su ID
 */
export const getTimeRangeById = (id) => {
  return DEFAULT_TIME_RANGES.find((tr) => tr.id === id)
}

/**
 * Obtiene los rangos de tiempo por período del día
 */
export const getTimeRangesByPeriod = (period) => {
  const periodMap = {
    morning: ['6am', '7am', '8am', '9am', '10am', '11am'],
    afternoon: ['12pm', '1pm', '2pm', '3pm', '4pm', '5pm'],
    evening: ['6pm', '7pm', '8pm'],
    night: ['9pm', '10pm', '11pm'],
  }
  const ids = periodMap[period] || []
  return DEFAULT_TIME_RANGES.filter((tr) => ids.includes(tr.id))
}

// ==================== RESERVAS ====================

/**
 * Configuración de reservas
 */
export const RESERVATION_CONFIG = {
  MIN_DURATION: 1, // Mínimo 1 hora
  MAX_DURATION: 4, // Máximo 4 horas
  ADVANCE_PAYMENT_PERCENT: 0.3, // 30% de adelanto
  ADVANCE_PAYMENT_LABEL: '30%', // Label para mostrar en UI
}

// ==================== MÉTODOS DE PAGO ====================

/**
 * Métodos de pago disponibles
 */
export const PAYMENT_METHODS_LIST = [
  { value: 'Transferencia', label: 'Transferencia' },
  { value: 'Efectivo', label: 'Efectivo' },
  { value: 'Yape', label: 'Yape' },
  { value: 'Plin', label: 'Plin' },
  { value: 'Otro', label: 'Otro' },
]

// ==================== UTILIDADES ====================

/**
 * Genera array de duraciones permitidas
 * @returns {Array<number>} - Array de duraciones en horas
 */
export const getDurationOptions = () => {
  const options = []
  for (let i = RESERVATION_CONFIG.MIN_DURATION; i <= RESERVATION_CONFIG.MAX_DURATION; i++) {
    options.push(i)
  }
  return options
}

/**
 * Obtiene el label del porcentaje de adelanto
 * @returns {string} - Label formateado (ej: "30%")
 */
export const getAdvancePaymentLabel = () => {
  return `${RESERVATION_CONFIG.ADVANCE_PAYMENT_PERCENT * 100}%`
}
