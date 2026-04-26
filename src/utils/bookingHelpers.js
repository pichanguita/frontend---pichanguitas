import { Car, Wifi, Droplet, Shield, Lightbulb } from 'lucide-react'
import { getToday } from './dateFormatters'

/**
 * Obtiene el ícono y color según el tipo de amenidad
 * @param {string} amenity - Nombre de la amenidad
 * @returns {Object|null} Objeto con Icon, color y label, o null si no se encuentra
 */
export const getAmenityIcon = (amenity) => {
  const normalizedAmenity = amenity.toLowerCase()

  if (normalizedAmenity.includes('estacionamiento') || normalizedAmenity.includes('parking')) {
    return { Icon: Car, color: 'bg-blue-600', label: 'Estacionamiento' }
  }
  if (normalizedAmenity.includes('wifi')) {
    return { Icon: Wifi, color: 'bg-purple-600', label: 'WiFi' }
  }
  if (normalizedAmenity.includes('ducha') || normalizedAmenity.includes('vestuario')) {
    return { Icon: Droplet, color: 'bg-cyan-600', label: 'Duchas/Vestuarios' }
  }
  if (normalizedAmenity.includes('seguridad') || normalizedAmenity.includes('vigilancia')) {
    return { Icon: Shield, color: 'bg-red-600', label: 'Seguridad' }
  }
  if (
    normalizedAmenity.includes('iluminación') ||
    normalizedAmenity.includes('luz') ||
    normalizedAmenity.includes('led')
  ) {
    return { Icon: Lightbulb, color: 'bg-yellow-500', label: 'Iluminación' }
  }

  return null
}

/**
 * Obtiene las principales amenidades de un campo con sus iconos
 * @param {Object} field - Campo con amenidades
 * @returns {Array} Array de objetos con Icon, color y label
 */
export const getMainAmenities = (field) => {
  if (!field.amenities || !Array.isArray(field.amenities)) return []

  const amenitiesWithIcons = field.amenities
    .map((amenity) => getAmenityIcon(amenity))
    .filter((item) => item !== null)
    .slice(0, 6) // Mostrar hasta 6 amenidades

  return amenitiesWithIcons
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
 * Verifica si hay conflicto de horario entre una reserva y un rango horario
 * @param {Object} reservation - Reserva existente
 * @param {Object} timeRange - Rango horario a verificar
 * @returns {boolean} true si hay conflicto
 */
const hasTimeConflict = (reservation, timeRange) => {
  // Obtener hora inicio/fin de la reserva
  const resStartTime = reservation.startTime || reservation.start_time
  const resEndTime = reservation.endTime || reservation.end_time

  if (resStartTime && resEndTime) {
    // Comparar directamente los tiempos
    // Hay conflicto si: resStart < slotEnd AND resEnd > slotStart
    return resStartTime < timeRange.endTime && resEndTime > timeRange.startTime
  }

  // Fallback: comparar con el campo `time`
  if (reservation.time) {
    // El formato puede ser "HH:MM - HH:MM" o "HH:MM-HH:MM"
    const timeFormats = [
      `${timeRange.startTime} - ${timeRange.endTime}`,
      `${timeRange.startTime}-${timeRange.endTime}`,
      `${timeRange.startTime}:00 - ${timeRange.endTime}:00`,
    ]
    return timeFormats.some((format) => reservation.time === format)
  }

  return false
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
