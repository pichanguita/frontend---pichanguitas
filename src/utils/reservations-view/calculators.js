import { parseLocalDate } from '../dateFormatters'

/**
 * Separa reservas en activas y pasadas
 */
export const separateReservations = (myReservations) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const active = myReservations.filter((res) => {
    const resDate = parseLocalDate(res.date)
    resDate.setHours(0, 0, 0, 0)
    return resDate >= today && res.status !== 'cancelled'
  })

  const past = myReservations.filter((res) => {
    const resDate = parseLocalDate(res.date)
    resDate.setHours(0, 0, 0, 0)
    return resDate < today || res.status === 'cancelled'
  })

  return { activeReservations: active, pastReservations: past }
}

/**
 * Calcula cuántas veces se alquiló cada cancha
 */
export const calculateFieldRentalCount = (myReservations) => {
  const counts = {}
  myReservations.forEach((res) => {
    if (res.status !== 'cancelled') {
      counts[res.fieldId] = (counts[res.fieldId] || 0) + 1
    }
  })
  return counts
}

/**
 * Calcula el saldo pendiente total de las reservas activas
 */
export const calculateTotalPendingBalance = (activeReservations) => {
  return activeReservations
    .filter((r) => r.paymentStatus === 'partially_paid')
    .reduce((sum, r) => sum + (r.remainingPayment || 0), 0)
}
