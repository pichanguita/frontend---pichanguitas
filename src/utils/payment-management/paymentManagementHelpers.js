/**
 * Helpers y utilidades para el módulo de gestión de pagos
 */

import { parseLocalDate } from '../dateFormatters'
import {
  RESERVATION_STATUS,
  TERMINAL_RESERVATION_STATUSES,
} from '../../constants/reservationStatus'
import { PAYMENT_STATUS, PAID_PAYMENT_STATUSES } from '../../constants/paymentStatus'

/**
 * Normaliza el status de reserva soportando camelCase/snake_case y default.
 */
const getReservationStatus = (res) => res.status || RESERVATION_STATUS.PENDING

/**
 * Normaliza el payment_status soportando camelCase/snake_case.
 */
const getPaymentStatus = (res) => res.paymentStatus || res.payment_status

/**
 * Una reserva tiene el pago cerrado (no aparece como pendiente) cuando su
 * payment_status es de cobro total, o su reserva está en un estado terminal
 * (completada/cancelada/no se presentó). Fuente única usada por filtros y UI.
 */
const isPaymentSettled = (res) => {
  const paymentStatus = getPaymentStatus(res)
  const reservationStatus = getReservationStatus(res)
  return (
    PAID_PAYMENT_STATUSES.includes(paymentStatus) ||
    paymentStatus === PAYMENT_STATUS.NO_SHOW ||
    TERMINAL_RESERVATION_STATUSES.includes(reservationStatus)
  )
}

export { isPaymentSettled }

/**
 * Calcular montos para una reserva (total, adelanto, pendiente).
 * Usa los valores REALES de la BD (total_price, advance_payment, remaining_payment).
 * Para canchas sin total_price persistido (legado), cae al precio bruto del field.
 * El monto del adelanto siempre proviene de la BD (fields.advance_payment_amount
 * via reservations.advance_payment) — el frontend no asume porcentajes.
 */
export const calculateAmounts = (reservation, fields) => {
  const totalRaw = reservation.totalPrice ?? reservation.total_price
  const advance = parseFloat(reservation.advancePayment ?? reservation.advance_payment ?? 0) || 0
  const pending =
    parseFloat(reservation.remainingPayment ?? reservation.remaining_payment ?? 0) || 0

  if (totalRaw === null || totalRaw === undefined) {
    if (fields) {
      const fieldId = reservation.fieldId || reservation.field_id
      const field = fields.find((f) => f.id === fieldId)
      if (field) {
        const calculatedTotal = parseFloat(field.pricePerHour) * parseFloat(reservation.hours || 1)
        return {
          total: calculatedTotal,
          advance,
          pending: Math.max(calculatedTotal - advance, 0),
        }
      }
    }
    return { total: 0, advance, pending }
  }

  return { total: parseFloat(totalRaw) || 0, advance, pending }
}

/**
 * Obtener color según el estado de la reserva
 */
export const getStatusColor = (reservation) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const resDate = parseLocalDate(reservation.date)
  resDate.setHours(0, 0, 0, 0)

  const paymentStatus = getPaymentStatus(reservation)

  if (PAID_PAYMENT_STATUSES.includes(paymentStatus)) {
    return 'text-green-600 bg-green-50'
  } else if (paymentStatus === PAYMENT_STATUS.NO_SHOW) {
    return 'text-orange-600 bg-orange-50'
  } else if (resDate < today) {
    return 'text-red-600 bg-red-50'
  } else if (resDate.getTime() === today.getTime()) {
    return 'text-amber-600 bg-amber-50'
  } else {
    return 'text-blue-600 bg-blue-50'
  }
}

/**
 * Verificar si se puede registrar el pago (cuando ha llegado la hora de la reserva)
 */
export const canRegisterPayment = (reservation, currentTime) => {
  const now = currentTime
  const resDate = parseLocalDate(reservation.date)

  // Extraer hora de inicio de la reserva
  // Formato esperado: "14:00 - 15:00" o "14:00" o "14-16"
  const timeStr = reservation.time || ''
  let startHour, startMinute

  // Intentar parsear diferentes formatos
  const timeMatch1 = timeStr.match(/^(\d{1,2}):(\d{2})/) // Formato "14:00"
  const timeMatch2 = timeStr.match(/^(\d{1,2})-/) // Formato "14-16"

  if (timeMatch1) {
    startHour = parseInt(timeMatch1[1], 10)
    startMinute = parseInt(timeMatch1[2], 10)
  } else if (timeMatch2) {
    startHour = parseInt(timeMatch2[1], 10)
    startMinute = 0
  } else {
    return {
      enabled: false,
      reason: 'Formato de hora no válido',
    }
  }

  // Crear fecha con la hora de inicio de la reserva
  const reservationTime = new Date(resDate)
  reservationTime.setHours(startHour, startMinute, 0, 0)

  // Verificar si ya ha llegado la hora de la reserva (o ya pasó)
  if (now >= reservationTime) {
    return {
      enabled: true,
      reason: '',
    }
  } else {
    // Aún no es la hora
    const minutesUntil = Math.ceil((reservationTime - now) / (1000 * 60))
    const hoursUntil = Math.floor(minutesUntil / 60)
    const mins = minutesUntil % 60

    let timeMessage = ''
    if (hoursUntil > 0) {
      timeMessage = `${hoursUntil}h ${mins}min`
    } else {
      timeMessage = `${mins} minutos`
    }

    return {
      enabled: false,
      reason: `Disponible en ${timeMessage}`,
    }
  }
}

/**
 * Calcular estadísticas de pagos
 */
export const calculatePaymentStats = (existingReservations, _fields) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Normalizar a inicio del día

  const stats = {
    totalPending: 0,
    totalCollected: 0,
    pendingCount: 0,
    completedCount: 0,
    todayPending: 0,
    overdueCount: 0,
    overdueAmount: 0, // Monto pendiente de reservas vencidas
    noShowCount: 0,
    noShowRevenue: 0, // Adelantos retenidos de no-shows
    cancelledCount: 0,
    cancelledRevenue: 0, // Adelantos de reservas canceladas (menos reembolsos)
    totalRefunded: 0, // Total de dinero reembolsado
    refundedCount: 0, // Cantidad de reembolsos procesados
  }

  existingReservations.forEach((reservation) => {
    // total_price es la fuente única de verdad (precio FINAL después de descuentos).
    // Si el campo está REALMENTE ausente, caer a 0; total_price = 0 es válido
    // (reserva 100% cubierta por horas gratis) y debe procesarse normalmente.
    const totalRaw = reservation.totalPrice ?? reservation.total_price ?? 0
    const totalPrice = parseFloat(totalRaw) || 0
    const advancePaid =
      parseFloat(reservation.advancePayment ?? reservation.advance_payment ?? 0) || 0
    const pendingAmount =
      parseFloat(reservation.remainingPayment ?? reservation.remaining_payment ?? 0) || 0

    // Las reservas pagadas 100% con horas gratis (totalPrice = 0, status = paid)
    // deben contarse en completedCount pero sin sumar al totalCollected.
    // El procesamiento normal más abajo ya hace eso (suma 0).
    // Solo saltamos si NO hay status definido (registro corrupto).
    if (totalPrice === 0 && !reservation.status && !reservation.payment_status) {
      return
    }

    // Obtener status de la reserva (cancelled, pending, confirmed, completed, no_show)
    const reservationStatus = getReservationStatus(reservation)
    const paymentStatus = getPaymentStatus(reservation)

    // ============================================
    // RESERVAS CANCELADAS - No tienen pagos pendientes.
    // El backend mantiene reservations.advance_kept como el monto NETO
    // retenido por la empresa: ya descontó el refund procesado, o se
    // re-sincroniza al monto completo si el refund se rechaza.
    // Aquí solo sumamos lo que ya está calculado.
    // ============================================
    if (reservationStatus === RESERVATION_STATUS.CANCELLED) {
      stats.cancelledCount++

      const refundAmount = parseFloat(reservation.refundAmount ?? reservation.refund_amount) || 0
      const refundStatus = reservation.refundStatus || reservation.refund_status
      // Usar ?? para distinguir 0 legítimo (refund 100%) de ausencia (legacy).
      const advanceKeptRaw = reservation.advanceKept ?? reservation.advance_kept
      const advanceKept =
        advanceKeptRaw !== null && advanceKeptRaw !== undefined
          ? parseFloat(advanceKeptRaw) || 0
          : advancePaid

      stats.cancelledRevenue += advanceKept
      stats.totalCollected += advanceKept

      if (refundAmount > 0 && refundStatus === 'processed') {
        stats.totalRefunded += refundAmount
        stats.refundedCount++
      }

      return
    }

    // Resto de estados normales.
    // Una reserva 'completed' es siempre un cobro total cerrado: se cuenta como
    // completada aunque su payment_status estuviera desincronizado, alineando
    // este conteo con el filtro de la tabla (isPaymentSettled).
    if (
      PAID_PAYMENT_STATUSES.includes(paymentStatus) ||
      reservationStatus === RESERVATION_STATUS.COMPLETED
    ) {
      stats.totalCollected += totalPrice
      stats.completedCount++
    } else if (paymentStatus === PAYMENT_STATUS.NO_SHOW) {
      stats.noShowCount++

      // En no_show no se persiste advance_kept (el monto retenido se deriva
      // siempre de advance_payment). Por eso, si se procesa un refund, hay
      // que restarlo aquí: `advancePaid - refundAmount`. Esto NO es doble
      // resta porque advance_payment es el adelanto BRUTO, no neto.
      const refundAmount = parseFloat(reservation.refundAmount ?? reservation.refund_amount) || 0
      const refundStatus = reservation.refundStatus || reservation.refund_status

      if (refundAmount > 0 && refundStatus === 'processed') {
        stats.totalRefunded += refundAmount
        stats.refundedCount++
        const netIncome = advancePaid - refundAmount
        const safeNet = netIncome > 0 ? netIncome : 0
        stats.totalCollected += safeNet
        stats.noShowRevenue += safeNet
      } else {
        stats.totalCollected += advancePaid
        stats.noShowRevenue += advancePaid
      }
    } else if (
      paymentStatus === PAYMENT_STATUS.PARTIALLY_PAID ||
      paymentStatus === PAYMENT_STATUS.PARTIAL
    ) {
      stats.totalCollected += advancePaid
      stats.totalPending += pendingAmount
      stats.pendingCount++
    } else {
      // pending o cualquier otro estado.
      // El adelanto efectivamente pagado por el cliente cuenta como cobrado
      // desde la creación de la reserva, aunque payment_status siga en 'pending'
      // (el backend deja la reserva con voucher/efectivo en 'pending' hasta que
      // el admin confirme el pago). Solo se descuenta cuando el reembolso
      // asociado pasa a 'processed': la rama no_show resta refundAmount y la
      // rama cancelled usa advance_kept (ya neto del refund procesado).
      stats.totalCollected += advancePaid
      stats.totalPending += pendingAmount
      stats.pendingCount++
    }

    // Verificar fechas solo para reservas con pago aún abierto (mismo criterio
    // que el filtro de la tabla): excluye pagadas, no-show y terminales.
    if (!isPaymentSettled(reservation)) {
      const resDate = parseLocalDate(reservation.date)
      resDate.setHours(0, 0, 0, 0)

      if (resDate.getTime() === today.getTime()) {
        stats.todayPending += pendingAmount
      }

      if (resDate.getTime() < today.getTime()) {
        stats.overdueCount++
        stats.overdueAmount += pendingAmount
      }
    }
  })

  return stats
}

/**
 * Filtrar reservas según criterios
 */
export const filterReservations = (reservations, filters) => {
  const { activeTab, searchTerm, selectedField, selectedDateRange } = filters
  let filtered = [...reservations]

  // Filtrar por estado de pago y estado de reserva.
  // "Pendiente de pago" = pago NO cerrado: ni cobrado, ni no-show, ni en un
  // estado de reserva terminal (completed/cancelled/no_show). Por eso se usa
  // isPaymentSettled, que considera el `status` además del `payment_status`:
  // una reserva ya 'completed' jamás debe listarse como pendiente aunque su
  // payment_status haya quedado desincronizado.
  if (activeTab === 'pending') {
    filtered = filtered.filter((res) => !isPaymentSettled(res))
  } else if (activeTab === 'completed') {
    filtered = filtered.filter((res) => {
      const reservationStatus = getReservationStatus(res)
      return (
        reservationStatus !== RESERVATION_STATUS.CANCELLED &&
        PAID_PAYMENT_STATUSES.includes(getPaymentStatus(res))
      )
    })
  } else if (activeTab === 'overdue') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    filtered = filtered.filter((res) => {
      const resDate = parseLocalDate(res.date)
      resDate.setHours(0, 0, 0, 0)
      return resDate < today && !isPaymentSettled(res)
    })
  } else if (activeTab === 'no_show') {
    filtered = filtered.filter((res) => getPaymentStatus(res) === PAYMENT_STATUS.NO_SHOW)
  } else if (activeTab === 'cancelled') {
    filtered = filtered.filter((res) => getReservationStatus(res) === RESERVATION_STATUS.CANCELLED)
  }

  // Filtrar por búsqueda
  if (searchTerm) {
    filtered = filtered.filter((res) => {
      const customerName = res.customerName || res.customer_name || ''
      const phoneNumber = res.phoneNumber || res.customer_phone || ''
      return (
        customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phoneNumber.includes(searchTerm)
      )
    })
  }

  // Filtrar por campo
  // NOTA: selectedField viene como string del HTML select, fieldId puede ser número
  if (selectedField !== 'all') {
    const selectedFieldId = parseInt(selectedField, 10)
    filtered = filtered.filter((res) => {
      const fieldId = parseInt(res.fieldId || res.field_id, 10)
      return fieldId === selectedFieldId
    })
  }

  // Filtrar por rango de fecha
  const today = new Date()
  if (selectedDateRange === 'today') {
    filtered = filtered.filter((res) => {
      const resDate = parseLocalDate(res.date)
      return resDate.toDateString() === today.toDateString()
    })
  } else if (selectedDateRange === 'week') {
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    filtered = filtered.filter((res) => {
      const resDate = parseLocalDate(res.date)
      return resDate >= weekAgo
    })
  } else if (selectedDateRange === 'month') {
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    filtered = filtered.filter((res) => {
      const resDate = parseLocalDate(res.date)
      return resDate >= monthStart
    })
  }

  // Ordenar por fecha
  return filtered.sort((a, b) => parseLocalDate(b.date) - parseLocalDate(a.date))
}
