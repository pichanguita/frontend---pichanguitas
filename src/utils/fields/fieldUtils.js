/**
 * Utilidades para AvailableFieldsView
 *
 * Funciones auxiliares de filtrado, cálculo y generación de datos
 */

import { FIELD_HOURS, RESERVATION_CONFIG } from '../../constants/booking'

/**
 * Filtra canchas según criterios de búsqueda y deporte
 * VALIDACIÓN FRONTEND: Excluye canchas en mantenimiento para usuarios finales
 * @param {Array} fields - Lista completa de canchas
 * @param {string} searchTerm - Término de búsqueda
 * @param {string} selectedSport - Deporte seleccionado ('all' o nombre del deporte)
 * @returns {Array} - Canchas filtradas
 */
export const filterAvailableFields = (fields, searchTerm, selectedSport) => {
  return fields.filter((field) => {
    // VALIDACIÓN: Excluir canchas en mantenimiento
    // Los clientes NO deben ver canchas con status 'maintenance'
    if (field.status === 'maintenance') {
      return false
    }

    // Solo mostrar canchas aprobadas y disponibles
    if (field.approvalStatus !== 'approved' || field.status !== 'available') {
      return false
    }

    // Filtro por búsqueda
    if (
      searchTerm &&
      !field.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !field.location.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    // Filtro por deporte
    if (selectedSport !== 'all' && !field.sportNames?.includes(selectedSport)) {
      return false
    }

    return true
  })
}

/**
 * Extrae tipos de deporte únicos de las canchas
 * @param {Array} fields - Lista de canchas
 * @returns {Array} - Lista de deportes únicos
 */
export const extractSportTypes = (fields) => {
  const sports = new Set()
  fields.forEach((field) => {
    field.sportNames?.forEach((sport) => sports.add(sport))
  })
  return Array.from(sports)
}

/**
 * Genera slots de tiempo según configuración de horarios
 * @returns {Array} - Array de horarios en formato "HH:MM"
 */
export const generateTimeSlots = () => {
  const slots = []
  const { OPENING_HOUR, CLOSING_HOUR, SLOT_INTERVAL } = FIELD_HOURS

  for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`)
    if (SLOT_INTERVAL === 30) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
  }
  return slots
}

/**
 * Verifica si un slot de tiempo está disponible para una cancha
 * @param {string} fieldId - ID de la cancha
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {string} time - Hora en formato HH:MM
 * @param {Array} existingReservations - Lista de reservas existentes
 * @returns {boolean} - true si está disponible
 */
export const isSlotAvailable = (fieldId, date, time, existingReservations) => {
  if (!date || !time) return true

  return !existingReservations.some(
    (reservation) =>
      reservation.fieldId === fieldId &&
      reservation.date === date &&
      reservation.time?.includes(time) &&
      reservation.paymentStatus !== 'cancelled'
  )
}

/**
 * Cuenta cuántas veces un usuario ha reservado una cancha específica
 * @param {string} fieldId - ID de la cancha
 * @param {string} userId - ID del usuario
 * @param {Array} existingReservations - Lista de reservas
 * @returns {number} - Número de reservas
 */
export const getFieldReservationCount = (fieldId, userId, existingReservations) => {
  if (!userId) return 0
  return existingReservations.filter(
    (reservation) =>
      reservation.fieldId === fieldId &&
      reservation.customerId === userId &&
      reservation.status !== 'cancelled'
  ).length
}

/**
 * Calcula la hora de fin dada una hora de inicio y duración
 * @param {string} startTime - Hora de inicio en formato HH:MM
 * @param {number} duration - Duración en horas
 * @returns {string} - Hora de fin en formato HH:MM
 */
export const calculateEndTime = (startTime, duration) => {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const endTime = new Date()
  endTime.setHours(startHour)
  endTime.setMinutes(startMin)
  endTime.setHours(endTime.getHours() + duration)
  return `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`
}

/**
 * Calcula los montos de una reserva (total, adelanto, saldo)
 * @param {number} pricePerHour - Precio por hora
 * @param {number} duration - Duración en horas
 * @returns {Object} - { totalPrice, advancePayment, remainingPayment }
 */
export const calculateReservationPrices = (pricePerHour, duration) => {
  const totalPrice = pricePerHour * duration
  const advancePayment = totalPrice * RESERVATION_CONFIG.ADVANCE_PAYMENT_PERCENT
  const remainingPayment = totalPrice - advancePayment

  return {
    totalPrice,
    advancePayment,
    remainingPayment,
  }
}

/**
 * Verifica si una cancha está en mantenimiento
 * @param {Object} field - Cancha a verificar
 * @returns {boolean} - true si está en mantenimiento
 */
export const isFieldInMaintenance = (field) => {
  return field?.status === 'maintenance'
}

/**
 * Obtiene el mensaje de estado de mantenimiento de una cancha
 * @param {Object} field - Cancha a verificar
 * @returns {string|null} - Mensaje descriptivo o null
 */
export const getMaintenanceMessage = (field) => {
  if (!isFieldInMaintenance(field)) return null

  return 'Esta cancha se encuentra en mantenimiento programado y no está disponible para reservas en este momento.'
}
