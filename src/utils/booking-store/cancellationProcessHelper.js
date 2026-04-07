/**
 * Helper para proceso completo de cancelación de reservas
 *
 * Maneja todo el flujo de cancelación: validación, cálculo de reembolso,
 * actualización de estado y creación de alertas
 */

import {
  calculateCancellationRefund,
  createCancelledReservation,
  generateCancellationMessage,
} from './reservationHelpers'
import { createCancellationAlert } from './alertHelpers'

/**
 * Procesa la cancelación completa de una reserva
 * @param {Object} params - Parámetros de cancelación
 * @returns {Object} - Resultado con success, reservations, message
 */
export const processCancellation = ({
  reservationId,
  cancelledBy,
  existingReservations,
  fieldStore,
  pricingStore,
  alertStore,
}) => {
  // Buscar reserva
  const reservation = existingReservations.find((r) => r.id === reservationId)
  if (!reservation) {
    return { success: false, message: 'Reserva no encontrada' }
  }

  // Buscar cancha
  const field = fieldStore.getFieldById(reservation.fieldId)
  if (!field) {
    return { success: false, message: 'Cancha no encontrada' }
  }

  // Calcular reembolso
  const refundData = calculateCancellationRefund(reservation, field, pricingStore)

  // Crear reserva cancelada
  const cancelledReservation = createCancelledReservation(reservation, cancelledBy, refundData)

  // Actualizar lista de reservas
  const updatedReservations = existingReservations.map((r) =>
    r.id === reservationId ? cancelledReservation : r
  )

  // Crear alerta si hay reembolso pendiente
  if (refundData.refundAmount > 0) {
    try {
      createCancellationAlert(alertStore, reservation, refundData.refundAmount, reservationId)
    } catch (error) {
      console.warn('Error creating cancellation alert:', error)
    }
  }

  // Generar mensaje de respuesta
  const message = generateCancellationMessage(refundData.refundAmount)

  return {
    success: true,
    reservations: updatedReservations,
    ...message,
  }
}
