/**
 * Calculadora centralizada de ingresos para reportes
 * Elimina duplicación y garantiza consistencia en todos los cálculos
 */

/**
 * Calcula el precio total de una reserva
 * @param {Object} reservation - La reserva
 * @param {Object} field - La cancha asociada (opcional)
 * @returns {number} - Precio total de la reserva
 */
export const getReservationTotalPrice = (reservation, field = null) => {
  // total_price = 0 es un caso válido (reserva 100% cubierta por horas gratis).
  // No se debe confundir con "campo ausente": comparar contra null/undefined explícito.
  const stored = reservation.totalPrice ?? reservation.total_price
  if (stored !== null && stored !== undefined) {
    return parseFloat(stored) || 0
  }

  const pricePerHour = field?.pricePerHour ? parseFloat(field.pricePerHour) : 0
  const hours = parseFloat(reservation.hours) || 1

  return pricePerHour * hours
}

/**
 * Calcula el ingreso efectivo (lo que realmente se pagó) de una reserva
 * @param {Object} reservation - La reserva
 * @param {Object} field - La cancha asociada (opcional)
 * @returns {number} - Ingreso efectivo
 */
export const getReservationRevenue = (reservation, field = null) => {
  const totalPrice = getReservationTotalPrice(reservation, field)
  const paymentStatus = reservation.paymentStatus || reservation.payment_status

  // Pagado completamente
  if (paymentStatus === 'paid' || paymentStatus === 'fully_paid') {
    return totalPrice
  }

  // No se presentó: el adelanto fue recibido, pero si se procesó un reembolso
  // el ingreso neto es lo que el admin retuvo (advance - refund).
  if (paymentStatus === 'no_show') {
    const advance = parseFloat(reservation.advancePayment ?? reservation.advance_payment ?? 0) || 0
    const refundStatus = reservation.refundStatus ?? reservation.refund_status
    if (refundStatus === 'processed') {
      const refundAmount =
        parseFloat(reservation.refundAmount ?? reservation.refund_amount ?? 0) || 0
      return Math.max(advance - refundAmount, 0)
    }
    return advance
  }

  // Pagado parcialmente - usar lo que ya pagó
  if (paymentStatus === 'partial' || paymentStatus === 'partially_paid') {
    return parseFloat(reservation.advancePayment ?? reservation.advance_payment ?? 0) || 0
  }

  // No pagado
  return 0
}

/**
 * Calcula el monto pendiente de una reserva
 * @param {Object} reservation - La reserva
 * @param {Object} field - La cancha asociada (opcional)
 * @returns {number} - Monto pendiente
 */
export const getReservationPending = (reservation, field = null) => {
  const totalPrice = getReservationTotalPrice(reservation, field)
  const paymentStatus = reservation.paymentStatus || reservation.payment_status

  // Pagado completamente - nada pendiente
  if (paymentStatus === 'paid' || paymentStatus === 'fully_paid') {
    return 0
  }

  // No se presentó - no hay monto pendiente (el adelanto se retiene)
  if (paymentStatus === 'no_show') {
    return 0
  }

  // Pagado parcialmente
  if (paymentStatus === 'partial' || paymentStatus === 'partially_paid') {
    return reservation.remainingPayment
      ? parseFloat(reservation.remainingPayment)
      : totalPrice - (parseFloat(reservation.advancePayment) || 0)
  }

  // No pagado - todo pendiente
  return totalPrice
}

/**
 * Calcula los ingresos totales de un conjunto de reservas
 * @param {Array} reservations - Lista de reservas
 * @param {Array} fields - Lista de canchas
 * @returns {number} - Ingresos totales
 */
export const calculateTotalRevenue = (reservations, fields) => {
  return reservations.reduce((sum, reservation) => {
    const field = fields.find((f) => f.id === reservation.fieldId)
    return sum + getReservationRevenue(reservation, field)
  }, 0)
}

/**
 * Calcula el total pendiente de un conjunto de reservas
 * @param {Array} reservations - Lista de reservas
 * @param {Array} fields - Lista de canchas
 * @returns {number} - Total pendiente
 */
export const calculateTotalPending = (reservations, fields) => {
  return reservations.reduce((sum, reservation) => {
    const field = fields.find((f) => f.id === reservation.fieldId)
    return sum + getReservationPending(reservation, field)
  }, 0)
}

/**
 * Filtra reservas por rango de fechas
 * @param {Array} reservations - Lista de reservas
 * @param {string} dateRange - 'week', 'month', 'quarter', 'year', 'all'
 * @returns {Array} - Reservas filtradas
 */
export const filterReservationsByDateRange = (reservations, dateRange) => {
  if (!dateRange || dateRange === 'all') {
    return reservations
  }

  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const rangeStart = new Date()
  rangeStart.setHours(0, 0, 0, 0)

  switch (dateRange) {
    case 'week':
      rangeStart.setDate(today.getDate() - 7)
      break
    case 'month':
      rangeStart.setMonth(today.getMonth() - 1)
      break
    case 'quarter':
      rangeStart.setMonth(today.getMonth() - 3)
      break
    case 'year':
      rangeStart.setFullYear(today.getFullYear() - 1)
      break
    default:
      return reservations
  }

  return reservations.filter((r) => {
    const reservationDate = new Date(r.date)
    return reservationDate >= rangeStart && reservationDate <= today
  })
}

/**
 * Obtiene el texto descriptivo del período
 * @param {string} dateRange - El rango de fechas
 * @returns {string} - Texto descriptivo
 */
export const getDateRangeText = (dateRange) => {
  const texts = {
    week: 'Última semana',
    month: 'Último mes',
    quarter: 'Último trimestre',
    year: 'Último año',
    all: 'Todo el historial',
  }
  return texts[dateRange] || 'Todo el historial'
}
