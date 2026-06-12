import { parseLocalDate } from '../dateFormatters'

/**
 * Separa reservas en activas y pasadas.
 *
 * Una reserva pertenece al historial cuando se cumple al menos una de estas
 * condiciones (en cualquier orden):
 *   - Su fecha ya es anterior al día de hoy.
 *   - Fue cancelada (`status === 'cancelled'`).
 *   - Ya fue completada por el administrador (`status === 'completed'`), lo
 *     cual habilita al cliente a registrar la reseña inmediatamente después
 *     del cierre del pago, sin tener que esperar al día siguiente.
 *   - Fue marcada como 'no_show' por el admin/SA: el cliente no se presentó,
 *     es un estado terminal y debe salir de "Activas" inmediatamente.
 *   - Fue rechazada por el admin (`status === 'rejected'`): estado terminal, la
 *     reserva nunca se concretó y debe mostrarse en el historial, no en activas.
 */
const PAST_STATUSES = ['cancelled', 'completed', 'no_show', 'rejected']

export const separateReservations = (myReservations) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isPastReservation = (res) => {
    const resDate = parseLocalDate(res.date)
    resDate.setHours(0, 0, 0, 0)
    return resDate < today || PAST_STATUSES.includes(res.status)
  }

  const active = []
  const past = []
  myReservations.forEach((res) => {
    if (isPastReservation(res)) past.push(res)
    else active.push(res)
  })

  return { activeReservations: active, pastReservations: past }
}

/**
 * Calcula cuántas veces se alquiló cada cancha
 */
export const calculateFieldRentalCount = (myReservations) => {
  const counts = {}
  myReservations.forEach((res) => {
    // Cancelada y rechazada no cuentan como alquiler: el servicio nunca se brindó.
    if (res.status !== 'cancelled' && res.status !== 'rejected') {
      counts[res.fieldId] = (counts[res.fieldId] || 0) + 1
    }
  })
  return counts
}

/**
 * Estados que excluyen una reserva del cálculo del saldo pendiente.
 * - cancelled / no_show / rejected: el servicio no se brindó, no hay saldo cobrable.
 * - paymentStatus refunded: el dinero ya fue devuelto al cliente.
 */
const NON_BILLABLE_RESERVATION_STATUSES = new Set(['cancelled', 'no_show', 'rejected'])
const NON_BILLABLE_PAYMENT_STATUSES = new Set(['refunded'])

/**
 * Calcula el saldo pendiente total considerando TODAS las reservas del cliente
 * (activas + historial). Una reserva contribuye al saldo cuando su servicio aún
 * es cobrable y tiene un `remainingPayment` mayor a cero.
 *
 * @param {Array} reservations - todas las reservas del cliente
 * @returns {number} saldo pendiente total
 */
export const calculateTotalPendingBalance = (reservations) => {
  if (!Array.isArray(reservations)) return 0
  return reservations.reduce((sum, r) => {
    if (NON_BILLABLE_RESERVATION_STATUSES.has(r.status)) return sum
    if (NON_BILLABLE_PAYMENT_STATUSES.has(r.paymentStatus)) return sum
    const remaining = parseFloat(r.remainingPayment) || 0
    return remaining > 0 ? sum + remaining : sum
  }, 0)
}
