import { useMemo } from 'react'
import { RESERVATION_STATUS, PAYMENT_STATUS, SCHEDULE_CONFIG, PAYMENT_CONFIG } from '../constants'
import { parseLocalDate } from '../utils/dateFormatters'

/**
 * Función auxiliar para calcular ingresos de una reserva
 * Incluye reservas completadas y confirmadas (asumiendo que fueron pagadas)
 */
const calculateReservationIncome = (res, fields) => {
  // Determinar si la reserva debe contar como ingreso
  const isCompleted = res.status === RESERVATION_STATUS.COMPLETED || res.status === 'completed'
  const isConfirmed = res.status === RESERVATION_STATUS.CONFIRMED || res.status === 'confirmed'
  const isPaid =
    res.paymentStatus === PAYMENT_STATUS.PAID ||
    res.paymentStatus === PAYMENT_STATUS.FULLY_PAID ||
    res.paymentStatus === PAYMENT_STATUS.VERIFIED
  const isPartialPaid =
    res.paymentStatus === PAYMENT_STATUS.PARTIAL ||
    res.paymentStatus === PAYMENT_STATUS.PARTIALLY_PAID

  // Helper para convertir a número (maneja strings y números)
  const toNumber = (val) => {
    if (typeof val === 'number') return val
    if (typeof val === 'string') return parseFloat(val) || 0
    return 0
  }

  // Obtener los valores como números
  const totalPrice = toNumber(res.totalPrice) || toNumber(res.total_price)
  const advancePayment = toNumber(res.advancePayment) || toNumber(res.advance_payment)

  // Si tiene totalPrice, usar ese valor
  if (totalPrice > 0) {
    // Reservas completadas o pagadas: contar el total recibido
    if (isCompleted || isPaid) {
      // Preferir advancePayment si está disponible (dinero real recibido)
      return advancePayment > 0 ? advancePayment : totalPrice
    }
    // Reservas confirmadas: asumir que tienen pago (al menos parcial)
    if (isConfirmed) {
      return advancePayment > 0 ? advancePayment : totalPrice
    }
    // Pagos parciales
    if (isPartialPaid) {
      return advancePayment > 0
        ? advancePayment
        : totalPrice * PAYMENT_CONFIG.PARTIAL_PAYMENT_PERCENTAGE
    }
    return 0
  }

  // Fallback: calcular basado en pricePerHour (solo si no hay totalPrice)
  const field = fields.find((f) => f.id === (res.fieldId || res.field_id))
  const hours = res.hours || res.timeSlots?.length || SCHEDULE_CONFIG.DEFAULT_SLOT_DURATION
  const pricePerHour = field?.pricePerHour || 0

  if (isCompleted || isPaid) {
    return pricePerHour * hours
  } else if (isConfirmed) {
    return pricePerHour * hours
  } else if (isPartialPaid) {
    return pricePerHour * hours * PAYMENT_CONFIG.PARTIAL_PAYMENT_PERCENTAGE
  }

  return 0
}

/**
 * Función auxiliar para calcular horas de una reserva
 */
const calculateReservationHours = (res) => {
  if (res.hours && typeof res.hours === 'number') {
    return res.hours
  }
  return res.timeSlots?.length || SCHEDULE_CONFIG.DEFAULT_SLOT_DURATION
}

/**
 * Períodos de tiempo disponibles para filtrar
 */
export const TIME_PERIODS = {
  THIS_WEEK: 'this_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  LAST_3_MONTHS: 'last_3_months',
  LAST_6_MONTHS: 'last_6_months',
  THIS_YEAR: 'this_year',
  ALL_TIME: 'all_time',
}

export const TIME_PERIOD_LABELS = {
  [TIME_PERIODS.THIS_WEEK]: 'Esta semana',
  [TIME_PERIODS.THIS_MONTH]: 'Este mes',
  [TIME_PERIODS.LAST_MONTH]: 'Mes pasado',
  [TIME_PERIODS.LAST_3_MONTHS]: 'Últimos 3 meses',
  [TIME_PERIODS.LAST_6_MONTHS]: 'Últimos 6 meses',
  [TIME_PERIODS.THIS_YEAR]: 'Este año',
  [TIME_PERIODS.ALL_TIME]: 'Todo el tiempo',
}

/**
 * Obtiene el rango de fechas según el período seleccionado
 */
const getDateRange = (period) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (period) {
    case TIME_PERIODS.THIS_WEEK: {
      const dayOfWeek = today.getDay()
      const monday = new Date(today)
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
      return { start: monday, end: now }
    }
    case TIME_PERIODS.THIS_MONTH: {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return { start: startOfMonth, end: now }
    }
    case TIME_PERIODS.LAST_MONTH: {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start: startOfLastMonth, end: endOfLastMonth }
    }
    case TIME_PERIODS.LAST_3_MONTHS: {
      const start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
      return { start, end: now }
    }
    case TIME_PERIODS.LAST_6_MONTHS: {
      const start = new Date(now.getFullYear(), now.getMonth() - 6, 1)
      return { start, end: now }
    }
    case TIME_PERIODS.THIS_YEAR: {
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      return { start: startOfYear, end: now }
    }
    case TIME_PERIODS.ALL_TIME:
    default:
      return { start: null, end: null }
  }
}

/**
 * Hook para calcular estadísticas de reservas con filtro de tiempo
 *
 * @param {Array} reservations - Array de todas las reservas
 * @param {Array} userFieldIds - IDs de canchas a considerar
 * @param {Array} fields - Array de canchas (para obtener precios)
 * @param {string} timePeriod - Período de tiempo a filtrar
 *
 * @returns {Object} Objeto con estadísticas filtradas
 */
export const useMonthlyStats = (
  reservations,
  userFieldIds,
  fields,
  timePeriod = TIME_PERIODS.ALL_TIME
) => {
  return useMemo(() => {
    const { start: startDate, end: endDate } = getDateRange(timePeriod)

    // Filtrar todas las reservas válidas (no canceladas y de las canchas del usuario)
    // Convertir IDs a números para comparación segura
    const userFieldIdsAsNumbers = userFieldIds.map((id) => parseInt(id, 10))

    const allValidReservations = reservations.filter((reservation) => {
      const notCancelled = reservation.status !== RESERVATION_STATUS.CANCELLED
      // Si el array está vacío, significa que hay filtros activos pero ninguna cancha coincide
      if (userFieldIdsAsNumbers.length === 0) return false
      const reservationFieldId = parseInt(reservation.fieldId || reservation.field_id, 10)
      const matchesField = userFieldIdsAsNumbers.includes(reservationFieldId)
      return notCancelled && matchesField
    })

    // Filtrar por período de tiempo
    const filteredReservations = allValidReservations.filter((reservation) => {
      if (!startDate && !endDate) return true // ALL_TIME
      const resDate = parseLocalDate(reservation.date)
      if (startDate && resDate < startDate) return false
      if (endDate && resDate > endDate) return false
      return true
    })

    // Reservas completadas (del período filtrado)
    const completedReservations = filteredReservations.filter(
      (res) => res.status === RESERVATION_STATUS.COMPLETED || res.status === 'completed'
    )

    // Reservas confirmadas (pendientes)
    const confirmedReservations = filteredReservations.filter(
      (res) => res.status === RESERVATION_STATUS.CONFIRMED || res.status === 'confirmed'
    )

    // === ESTADÍSTICAS DEL PERÍODO ===
    const hoursRented = filteredReservations.reduce(
      (total, res) => total + calculateReservationHours(res),
      0
    )
    const totalIncome = filteredReservations.reduce(
      (total, res) => total + calculateReservationIncome(res, fields),
      0
    )
    const totalReservations = filteredReservations.length

    // Tasa de ocupación (calculada según el período)
    let occupancyRate = 0
    if (userFieldIds.length > 0 && startDate && endDate) {
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1
      const totalAvailableHours =
        userFieldIds.length * daysDiff * SCHEDULE_CONFIG.BUSINESS_HOURS_PER_DAY
      occupancyRate =
        totalAvailableHours > 0 ? Math.round((hoursRented / totalAvailableHours) * 100) : 0
    }

    return {
      hoursRented,
      totalIncome,
      totalReservations,
      occupancyRate,
      completedReservations: completedReservations.length,
      confirmedReservations: confirmedReservations.length,
      filteredReservations,
      // Info del período
      periodLabel: TIME_PERIOD_LABELS[timePeriod],
      startDate,
      endDate,
    }
  }, [reservations, userFieldIds, fields, timePeriod])
}
