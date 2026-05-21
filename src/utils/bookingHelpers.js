import { getToday } from './dateFormatters'
import { getAmenityIconComponent } from './amenityIconRegistry'

/**
 * Mapea el array `field.amenities` (objetos {key,label,icon_name,color_class}
 * provenientes del backend joined con amenities_catalog) a un array listo para
 * renderizar como íconos: {Icon, color, label, key}.
 *
 * Sin hardcoding de labels ni íconos: todo viene del catálogo.
 * Limita a 6 entradas para no saturar la UI del cliente.
 */
export const getMainAmenities = (field) => {
  if (!field?.amenities || !Array.isArray(field.amenities)) return []
  return field.amenities
    .filter((a) => a && a.key && a.label)
    .slice(0, 6)
    .map((a) => ({
      key: a.key,
      label: a.label,
      color: a.color_class,
      Icon: getAmenityIconComponent(a.icon_name),
    }))
}

/**
 * Calcula los rangos horarios seleccionados basados en hora inicio y fin
 * @param {string} startTime - Hora de inicio (ej: "06:00")
 * @param {string} endTime - Hora de fin (ej: "09:00")
 * @param {Array} timeRanges - Array de rangos horarios disponibles
 * @returns {Array} Array de IDs de rangos horarios seleccionados
 */
export const calculateSelectedTimeRanges = (startTime, endTime, timeRanges) => {
  if (!startTime || !endTime) return []

  const result = timeRanges
    .filter((tr) => {
      const slotStart = tr.startTime
      const isAfterOrAtStart = slotStart >= startTime
      const isBeforeLimit = slotStart < endTime
      return isAfterOrAtStart && isBeforeLimit
    })
    .map((tr) => tr.id)

  return result
}

/**
 * Normaliza un string horario a formato canónico "HH:MM" (5 chars).
 * PostgreSQL TIME(6) devuelve "HH:MM:SS" via node-postgres; los slots de
 * UI usan "HH:MM". Sin esta normalización, comparaciones lexicográficas
 * tipo "13:00:00" > "13:00" devuelven true incorrectamente.
 */
const normalizeTime = (value) => {
  if (typeof value !== 'string') return ''
  return value.slice(0, 5)
}

/**
 * Verifica si hay conflicto de horario entre una reserva y un rango horario.
 * Fórmula: hay conflicto si `resStart < slotEnd` AND `resEnd > slotStart`
 * (intervalos abiertos en los extremos: 12:00-13:00 NO colisiona con 13:00-14:00).
 *
 * @param {Object} reservation - Reserva existente (startTime/endTime o start_time/end_time)
 * @param {Object} timeRange - Slot a verificar { startTime, endTime } en HH:MM
 * @returns {boolean} true si hay conflicto
 */
const hasTimeConflict = (reservation, timeRange) => {
  const resStartTime = normalizeTime(reservation.startTime || reservation.start_time)
  const resEndTime = normalizeTime(reservation.endTime || reservation.end_time)
  const slotStart = normalizeTime(timeRange.startTime)
  const slotEnd = normalizeTime(timeRange.endTime)

  if (!resStartTime || !resEndTime || !slotStart || !slotEnd) return false

  return resStartTime < slotEnd && resEndTime > slotStart
}

/**
 * Normaliza la fecha para comparación (elimina tiempo)
 * @param {string} dateString - Fecha en cualquier formato
 * @returns {string} Fecha en formato YYYY-MM-DD
 */
const normalizeDate = (dateString) => {
  if (!dateString) return ''
  if (dateString.includes('T')) {
    return dateString.split('T')[0]
  }
  return dateString
}

/**
 * Verifica si un horario específico está disponible para una cancha
 * @param {Object} field - Campo a verificar
 * @param {string} timeRangeId - ID del rango horario
 * @param {string} selectedDate - Fecha seleccionada
 * @param {Array} timeRanges - Array de rangos horarios
 * @param {Array} existingReservations - Reservas existentes
 * @returns {boolean} true si está disponible
 */
export const isTimeSlotAvailable = (
  field,
  timeRangeId,
  selectedDate,
  timeRanges,
  existingReservations
) => {
  if (!field || !selectedDate) return false

  const timeRange = timeRanges.find((tr) => tr.id === timeRangeId)
  if (!timeRange) return false

  const normalizedSelectedDate = normalizeDate(selectedDate)

  // Si la fecha seleccionada es hoy, descartar slots cuyo inicio ya pasó.
  if (normalizedSelectedDate === getToday()) {
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const [slotHour, slotMin] = timeRange.startTime.split(':').map(Number)
    const slotStartMinutes = slotHour * 60 + slotMin
    if (slotStartMinutes <= currentMinutes) return false
  }

  // Verificar horario de operación
  const dayOfWeek = new Date(selectedDate + 'T12:00:00')
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase()
  const schedule = field.schedule?.[dayOfWeek]

  // Si no tiene schedule configurado, solo verificar reservas existentes
  if (!field.schedule || !schedule) {
    const hasReservation = existingReservations.some((reservation) => {
      // Solo considerar reservas activas (no canceladas, no no_show)
      const status = reservation.status?.toLowerCase()
      if (status === 'cancelled' || status === 'no_show') return false

      const fieldId = reservation.fieldId || reservation.field_id
      const resDate = normalizeDate(reservation.date)

      return (
        fieldId === field.id &&
        resDate === normalizedSelectedDate &&
        hasTimeConflict(reservation, timeRange)
      )
    })
    return !hasReservation
  }

  // Si tiene schedule pero no está abierto ese día
  if (!schedule.isOpen) return false

  // Comparación lexicográfica entre strings 'HH:MM' es correcta (mismo ancho, 0-padded).
  // openTime/closeTime pueden ser null (sin límite para ese extremo).
  const slotStart = timeRange.startTime
  const slotEnd = timeRange.endTime
  if (schedule.openTime && slotStart < schedule.openTime.slice(0, 5)) return false
  if (schedule.closeTime && slotEnd > schedule.closeTime.slice(0, 5)) return false

  // Verificar si hay una reserva existente
  const hasReservation = existingReservations.some((reservation) => {
    // Solo considerar reservas activas (no canceladas, no no_show)
    const status = reservation.status?.toLowerCase()
    if (status === 'cancelled' || status === 'no_show') return false

    const fieldId = reservation.fieldId || reservation.field_id
    const resDate = normalizeDate(reservation.date)

    return (
      fieldId === field.id &&
      resDate === normalizedSelectedDate &&
      hasTimeConflict(reservation, timeRange)
    )
  })

  return !hasReservation
}

/**
 * Obtiene TODOS los horarios disponibles de una cancha en el día seleccionado
 * @param {Object} field - Campo a verificar
 * @param {string} selectedDate - Fecha seleccionada
 * @param {Array} timeRanges - Array de rangos horarios
 * @param {Array} existingReservations - Reservas existentes
 * @returns {Array} Array de IDs de horarios disponibles
 */
export const getFieldAllAvailableHours = (
  field,
  selectedDate,
  timeRanges,
  existingReservations
) => {
  if (!field || !selectedDate) return []

  const available = []

  // Usar la función isTimeSlotAvailable que ya tiene toda la lógica correcta
  timeRanges.forEach((timeRange) => {
    if (isTimeSlotAvailable(field, timeRange.id, selectedDate, timeRanges, existingReservations)) {
      available.push(timeRange.id)
    }
  })

  return available
}

/**
 * Obtiene información detallada de un horario ocupado
 * @param {Object} field - Campo a verificar
 * @param {string} timeRangeId - ID del rango horario
 * @param {string} selectedDate - Fecha seleccionada
 * @param {Array} timeRanges - Array de rangos horarios
 * @param {Array} existingReservations - Reservas existentes
 * @returns {Object|null} Info de la reserva que ocupa el horario, o null si está libre
 */
export const getOccupiedSlotInfo = (
  field,
  timeRangeId,
  selectedDate,
  timeRanges,
  existingReservations
) => {
  if (!field || !selectedDate) return null

  const timeRange = timeRanges.find((tr) => tr.id === timeRangeId)
  if (!timeRange) return null

  const normalizedSelectedDate = normalizeDate(selectedDate)

  const blockingReservation = existingReservations.find((reservation) => {
    const status = reservation.status?.toLowerCase()
    if (status === 'cancelled' || status === 'no_show') return false

    const fieldId = reservation.fieldId || reservation.field_id
    const resDate = normalizeDate(reservation.date)

    return (
      fieldId === field.id &&
      resDate === normalizedSelectedDate &&
      hasTimeConflict(reservation, timeRange)
    )
  })

  if (blockingReservation) {
    return {
      status: blockingReservation.status,
      customerName:
        blockingReservation.customerName || blockingReservation.customer_name || 'Reservado',
      isPending: blockingReservation.status === 'pending',
    }
  }

  return null
}

/**
 * Obtiene horarios disponibles para una cancha en el rango seleccionado
 * @param {Object} field - Campo a verificar
 * @param {string} startTime - Hora de inicio
 * @param {string} endTime - Hora de fin
 * @param {string} selectedDate - Fecha seleccionada
 * @param {Array} timeRanges - Array de rangos horarios
 * @param {Array} existingReservations - Reservas existentes
 * @returns {Object} Objeto con arrays de available y occupied
 */
export const getFieldAvailableHoursInRange = (
  field,
  startTime,
  endTime,
  selectedDate,
  timeRanges,
  existingReservations
) => {
  const requestedRange = calculateSelectedTimeRanges(startTime, endTime, timeRanges)
  if (!requestedRange.length) return { available: [], occupied: [] }

  const available = []
  const occupied = []

  requestedRange.forEach((timeRangeId) => {
    if (isTimeSlotAvailable(field, timeRangeId, selectedDate, timeRanges, existingReservations)) {
      available.push(timeRangeId)
    } else {
      occupied.push(timeRangeId)
    }
  })

  return { available, occupied }
}

/**
 * Verifica si una cancha debe mostrarse basado en los filtros
 * @param {Object} field - Campo a verificar
 * @param {string} startTime - Hora de inicio del filtro
 * @param {string} endTime - Hora de fin del filtro
 * @param {string} selectedDate - Fecha seleccionada
 * @param {Array} timeRanges - Array de rangos horarios
 * @param {Array} existingReservations - Reservas existentes
 * @returns {boolean} true si debe mostrarse
 */
export const shouldShowField = (
  field,
  startTime,
  endTime,
  selectedDate,
  timeRanges,
  existingReservations
) => {
  if (!startTime || !endTime) return true

  const allAvailable = getFieldAllAvailableHours(
    field,
    selectedDate,
    timeRanges,
    existingReservations
  )

  if (allAvailable.length === 0) return false

  const requestedRange = calculateSelectedTimeRanges(startTime, endTime, timeRanges)

  const hasAvailableInRange = allAvailable.some((availableId) =>
    requestedRange.includes(availableId)
  )

  return hasAvailableInRange
}
