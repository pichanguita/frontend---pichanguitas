/**
 * RESERVATION SERVICE
 *
 * Servicio para crear, actualizar y gestionar reservas.
 * Maneja la validación, creación y actualización de estados de reservas.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Transforma datos de reserva del formato backend (snake_case) al frontend (camelCase)
 * @param {Object} reservation - Reserva en formato backend
 * @returns {Object} Reserva en formato frontend
 */
const transformReservationFromAPI = (reservation) => {
  if (!reservation) return null

  // El backend ya hace la transformación, solo agregamos campos derivados
  const transformed = {
    ...reservation,
    time: `${reservation.startTime} - ${reservation.endTime}`,
    createdAt: reservation.dateTimeRegistration,
    updatedAt: reservation.dateTimeModification,
  }

  return transformed
}

/**
 * Genera un ID único para una reserva
 * @returns {string} ID único
 */
const generateReservationId = () => {
  return `res-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Crea una nueva reserva
 * @param {Object} reservationData - Datos de la reserva
 * @returns {Object} Reserva creada
 */
export const createReservation = (reservationData) => {
  const {
    fieldId,
    fieldName,
    date,
    timeSlots,
    customerName,
    phoneNumber,
    paymentMethod,
    totalPrice,
    advancePayment,
    remainingPayment,
    customerId = null,
    type = 'customer_booking',
  } = reservationData

  // Validaciones básicas
  if (!fieldId || !fieldName || !date || !timeSlots || timeSlots.length === 0) {
    throw new Error('Faltan datos obligatorios para crear la reserva')
  }

  if (!customerName || !phoneNumber) {
    throw new Error('Se requiere nombre y teléfono del cliente')
  }

  // Crear objeto de reserva
  const newReservation = {
    id: generateReservationId(),
    fieldId,
    fieldName,
    date,
    time: timeSlots.join(', '),
    timeSlots,
    customerName,
    phoneNumber,
    customerId,
    totalPrice: totalPrice || 0,
    advancePayment: advancePayment || 0,
    remainingPayment: remainingPayment || 0,
    paymentMethod: paymentMethod || 'pending',
    paymentStatus: advancePayment >= totalPrice ? 'fully_paid' : 'partially_paid',
    status: 'confirmed',
    type,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return newReservation
}

/**
 * Actualiza el estado de una reserva
 * @param {Object} reservation - Reserva a actualizar
 * @param {string} newStatus - Nuevo estado
 * @param {Object} additionalData - Datos adicionales
 * @returns {Object} Reserva actualizada
 */
export const updateReservationStatus = (reservation, newStatus, additionalData = {}) => {
  const updatedReservation = {
    ...reservation,
    status: newStatus,
    updatedAt: new Date().toISOString(),
    ...additionalData,
  }

  // Lógica específica por estado
  switch (newStatus) {
    case 'cancelled':
      updatedReservation.cancelledAt = new Date().toISOString()
      break
    case 'completed':
      updatedReservation.completedAt = new Date().toISOString()
      break
    case 'no_show':
      updatedReservation.noShowDate = new Date().toISOString()
      break
  }

  return updatedReservation
}

/**
 * Valida si una reserva puede ser cancelada
 * @param {Object} reservation - Reserva
 * @param {Object} cancellationPolicy - Política de cancelación de la cancha (opcional)
 * @returns {Object} { canCancel, reason, hoursUntilEvent, refundPercentage }
 */
export const canCancelReservation = (reservation, cancellationPolicy = null) => {
  // Obtener política de cancelación de la cancha o usar valores por defecto
  const policy = cancellationPolicy ||
    reservation.cancellationPolicy || {
      allowCancellation: true,
      hoursBeforeEvent: 24,
      refundPercentage: 0,
    }

  // Verificar si la cancha permite cancelaciones
  if (!policy.allowCancellation) {
    return {
      canCancel: false,
      reason: 'Esta cancha no permite cancelaciones',
      hoursUntilEvent: 0,
      refundPercentage: 0,
    }
  }

  // Ya está cancelada
  if (reservation.status === 'cancelled') {
    return {
      canCancel: false,
      reason: 'La reserva ya está cancelada',
      hoursUntilEvent: 0,
      refundPercentage: 0,
    }
  }

  // Ya completada
  if (reservation.status === 'completed') {
    return {
      canCancel: false,
      reason: 'La reserva ya fue completada',
      hoursUntilEvent: 0,
      refundPercentage: 0,
    }
  }

  // Pago ya aprobado/verificado por el admin
  // Solo bloquear si paymentStatus es explícitamente 'fully_paid'
  const paymentStatus = reservation.paymentStatus || reservation.payment_status
  if (paymentStatus === 'fully_paid') {
    return {
      canCancel: false,
      reason:
        'El pago ya fue aprobado por el administrador. Contacta al administrador para solicitar cancelación.',
      hoursUntilEvent: 0,
      refundPercentage: 0,
    }
  }

  // NOTA: Ya no verificamos remainingPayment === 0 porque puede ser undefined
  // y causar falsos positivos. Confiamos en paymentStatus como fuente de verdad.

  // Calcular tiempo hasta el evento
  const now = new Date()
  // Soportar ambos formatos: camelCase y snake_case
  const startTime = reservation.startTime || reservation.start_time || '00:00'

  // Parsear la fecha correctamente (puede venir como ISO '2026-01-12T05:00:00.000Z' o 'YYYY-MM-DD')
  let reservationDateStr = reservation.date
  if (reservationDateStr && reservationDateStr.includes('T')) {
    // Es formato ISO, extraer solo la parte de la fecha
    reservationDateStr = reservationDateStr.split('T')[0]
  }

  // Construir fecha del evento
  const eventDateStr = `${reservationDateStr}T${startTime}`
  const eventDate = new Date(eventDateStr)

  // Verificar que la fecha sea válida
  if (isNaN(eventDate.getTime())) {
    // Si no podemos calcular la fecha, permitir cancelar por defecto
    return {
      canCancel: true,
      reason: null,
      hoursUntilEvent: 999,
      refundPercentage: policy.refundPercentage || 0,
    }
  }

  const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60)
  const hoursRequired = policy.hoursBeforeEvent || 24

  if (hoursUntilEvent < hoursRequired) {
    return {
      canCancel: false,
      reason: `Debes cancelar con al menos ${hoursRequired} horas de anticipación`,
      hoursUntilEvent,
      refundPercentage: 0,
    }
  }

  return {
    canCancel: true,
    reason: null,
    hoursUntilEvent,
    refundPercentage: policy.refundPercentage || 0,
  }
}

/**
 * Calcula el reembolso para una cancelación
 * @param {Object} reservation - Reserva
 * @param {number} refundPercentage - Porcentaje de reembolso (0-100)
 * @returns {Object} { refundAmount, refundPercentage }
 */
export const calculateRefund = (reservation, refundPercentage = 50) => {
  const totalPaid = reservation.advancePayment || 0
  const refundAmount = (totalPaid * refundPercentage) / 100

  return {
    refundAmount: Math.round(refundAmount * 100) / 100,
    refundPercentage,
  }
}

/**
 * Filtra reservas por estado
 * @param {Array} reservations - Array de reservas
 * @param {string} status - Estado a filtrar
 * @returns {Array} Reservas filtradas
 */
export const filterReservationsByStatus = (reservations, status) => {
  return reservations.filter((r) => r.status === status)
}

/**
 * Filtra reservas por cancha
 * @param {Array} reservations - Array de reservas
 * @param {string} fieldId - ID de la cancha
 * @returns {Array} Reservas filtradas
 */
export const filterReservationsByField = (reservations, fieldId) => {
  return reservations.filter((r) => r.fieldId === fieldId)
}

/**
 * Filtra reservas por cliente
 * @param {Array} reservations - Array de reservas
 * @param {string} customerId - ID del cliente
 * @returns {Array} Reservas filtradas
 */
export const filterReservationsByCustomer = (reservations, customerId) => {
  return reservations.filter((r) => r.customerId === customerId || r.phoneNumber === customerId)
}

/**
 * Filtra reservas por rango de fechas
 * @param {Array} reservations - Array de reservas
 * @param {string} startDate - Fecha inicio
 * @param {string} endDate - Fecha fin
 * @returns {Array} Reservas filtradas
 */
export const filterReservationsByDateRange = (reservations, startDate, endDate) => {
  return reservations.filter((r) => {
    const resDate = new Date(r.date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return resDate >= start && resDate <= end
  })
}

/**
 * Verifica si hay conflicto de horario
 * @param {Array} existingReservations - Reservas existentes
 * @param {string} fieldId - ID de cancha
 * @param {string} date - Fecha
 * @param {Array} timeSlots - Slots de tiempo
 * @returns {boolean} true si hay conflicto
 */
export const hasTimeConflict = (existingReservations, fieldId, date, timeSlots) => {
  return existingReservations.some(
    (reservation) =>
      reservation.fieldId === fieldId &&
      reservation.date === date &&
      reservation.status !== 'cancelled' &&
      timeSlots.some((slot) => reservation.timeSlots && reservation.timeSlots.includes(slot))
  )
}

// ==================== API CALLS ====================

/**
 * Obtener todas las reservas desde el backend
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de reservas
 */
export const fetchReservations = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.field_id) queryParams.append('field_id', filters.field_id)
    if (filters.customer_id) queryParams.append('customer_id', filters.customer_id)
    if (filters.date) queryParams.append('date', filters.date)
    if (filters.date_from) queryParams.append('date_from', filters.date_from)
    if (filters.date_to) queryParams.append('date_to', filters.date_to)
    if (filters.status) queryParams.append('status', filters.status)
    if (filters.payment_status) queryParams.append('payment_status', filters.payment_status)
    if (filters.type) queryParams.append('type', filters.type)

    const url = `${API_CONFIG.RESERVATIONS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener reservas')
    }

    // Transformar cada reserva al formato frontend
    const transformedReservations = (data.data || []).map(transformReservationFromAPI)
    return transformedReservations
  } catch (error) {
    throw new Error(error.message || 'Error al obtener reservas')
  }
}

/**
 * Obtener una reserva por ID desde el backend
 * @param {string} reservationId - ID de la reserva
 * @returns {Promise<Object>} Reserva
 */
export const fetchReservationById = async (reservationId) => {
  try {
    const response = await fetch(API_CONFIG.RESERVATIONS.GET_BY_ID(reservationId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener reserva')
    }

    // Transformar la reserva al formato frontend
    return transformReservationFromAPI(data.data)
  } catch (error) {
    throw new Error(error.message || 'Error al obtener reserva')
  }
}

/**
 * Crear una nueva reserva en el backend
 * @param {Object} reservationData - Datos de la reserva
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Reserva creada
 */
export const createReservationAPI = async (reservationData, token) => {
  try {
    const response = await fetch(API_CONFIG.RESERVATIONS.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(reservationData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear reserva')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al crear reserva')
  }
}

/**
 * Actualizar una reserva en el backend
 * @param {string} reservationId - ID de la reserva
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Reserva actualizada
 */
export const updateReservationAPI = async (reservationId, updates, token) => {
  try {
    const response = await fetch(API_CONFIG.RESERVATIONS.UPDATE(reservationId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar reserva')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar reserva')
  }
}

/**
 * Cancelar una reserva en el backend
 * @param {string} reservationId - ID de la reserva
 * @param {string} cancellation_reason - Motivo de cancelación
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Reserva cancelada
 */
export const cancelReservationAPI = async (reservationId, cancellation_reason, token) => {
  try {
    const response = await fetch(API_CONFIG.RESERVATIONS.CANCEL(reservationId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ cancellation_reason }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al cancelar reserva')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al cancelar reserva')
  }
}

/**
 * Completar una reserva en el backend
 * @param {string} reservationId - ID de la reserva
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Reserva completada
 */
export const completeReservationAPI = async (reservationId, token) => {
  try {
    const response = await fetch(API_CONFIG.RESERVATIONS.COMPLETE(reservationId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al completar reserva')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al completar reserva')
  }
}

/**
 * Marcar una reserva como no show en el backend
 * @param {string} reservationId - ID de la reserva
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Reserva marcada como no show
 */
export const markNoShowAPI = async (reservationId, token) => {
  try {
    const response = await fetch(API_CONFIG.RESERVATIONS.NO_SHOW(reservationId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al marcar no show')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al marcar no show')
  }
}

/**
 * Verificar disponibilidad de una cancha
 * @param {Object} params - Parámetros { field_id, date, time_slots }
 * @returns {Promise<Object>} { available, conflicting_slots }
 */
export const checkAvailabilityAPI = async (params) => {
  try {
    const queryParams = new URLSearchParams()

    if (params.field_id) queryParams.append('field_id', params.field_id)
    if (params.date) queryParams.append('date', params.date)
    if (params.time_slots) queryParams.append('time_slots', params.time_slots)

    const url = `${API_CONFIG.RESERVATIONS.CHECK_AVAILABILITY}?${queryParams.toString()}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al verificar disponibilidad')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al verificar disponibilidad')
  }
}

/**
 * Obtener estadísticas de reservas por cancha
 * @param {string} fieldId - ID de la cancha
 * @returns {Promise<Object>} Estadísticas
 */
export const fetchFieldStatsAPI = async (fieldId) => {
  try {
    const response = await fetch(API_CONFIG.RESERVATIONS.STATS(fieldId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener estadísticas')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al obtener estadísticas')
  }
}

/**
 * Crear una reserva pública (sin autenticación)
 * @param {Object} reservationData - Datos de la reserva
 * @returns {Promise<Object>} Reserva creada
 */
export const createPublicReservation = async (reservationData) => {
  const response = await fetch(API_CONFIG.RESERVATIONS.CREATE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // NO incluir Authorization header para usuarios públicos
    },
    body: JSON.stringify(reservationData),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Error al crear reserva')
  }

  return data.data
}

/**
 * Subir voucher de pago
 * @param {File} voucherFile - Archivo del voucher
 * @returns {Promise<Object>} { url, filename, originalName, size }
 */
export const uploadPaymentVoucher = async (voucherFile) => {
  const formData = new FormData()
  formData.append('voucher', voucherFile)

  const response = await fetch(API_CONFIG.RESERVATIONS.UPLOAD_VOUCHER, {
    method: 'POST',
    // NO incluir Content-Type header - el navegador lo establece automáticamente con boundary
    body: formData,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Error al subir voucher')
  }

  return data.data
}

// ==================== API PÚBLICA (Sin autenticación) ====================

/**
 * Obtener horarios ocupados de una cancha para una fecha específica (sin autenticación)
 * @param {number} fieldId - ID de la cancha
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @returns {Promise<Object>} { occupiedSlots, totalOccupied }
 */
export const fetchPublicFieldAvailability = async (fieldId, date) => {
  try {
    const url = `${API_CONFIG.RESERVATIONS.PUBLIC_FIELD_AVAILABILITY(fieldId)}?date=${date}`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener disponibilidad')
    }

    return data.data
  } catch (error) {
    return { occupiedSlots: [], totalOccupied: 0 }
  }
}

/**
 * Obtener información de cancelación de una reserva (sin autenticación)
 * @param {string|number} reservationId - ID de la reserva
 * @param {string} phoneNumber - Número de teléfono del cliente para verificar
 * @returns {Promise<Object>} Información de cancelación
 */
export const getCancellationInfoPublic = async (reservationId, phoneNumber) => {
  const url = `${API_CONFIG.RESERVATIONS.PUBLIC_CANCELLATION_INFO(reservationId)}?phone_number=${encodeURIComponent(phoneNumber)}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Error al obtener información de cancelación')
  }

  return data.data
}

/**
 * Cancelar una reserva públicamente (sin autenticación)
 * @param {string|number} reservationId - ID de la reserva
 * @param {string} phoneNumber - Número de teléfono del cliente para verificar
 * @param {string} cancellationReason - Motivo de la cancelación (opcional)
 * @returns {Promise<Object>} Resultado de la cancelación
 */
export const cancelReservationPublic = async (
  reservationId,
  phoneNumber,
  cancellationReason = ''
) => {
  try {
    const response = await fetch(API_CONFIG.RESERVATIONS.PUBLIC_CANCEL(reservationId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        cancellation_reason: cancellationReason,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al cancelar reserva')
    }

    return {
      success: true,
      message: data.message,
      refund: data.data?.refund,
      reservation: data.data?.reservation,
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Error al cancelar la reserva',
    }
  }
}
