/**
 * Helpers para la gestión de reservas (aprobar, rechazar, completar, etc.)
 */

/**
 * Aprobar una reserva pendiente
 */
export const approveReservationHelper = (reservations, reservationId) => {
  return reservations.map((reservation) => {
    if (reservation.id === reservationId && reservation.status === 'pending') {
      return {
        ...reservation,
        status: 'confirmed',
        approvedAt: new Date().toISOString(),
        approvedBy: 'admin',
      }
    }
    return reservation
  })
}

/**
 * Rechazar una reserva pendiente
 */
export const rejectReservationHelper = (reservations, reservationId, rejectionReason = '') => {
  return reservations.map((reservation) => {
    if (reservation.id === reservationId && reservation.status === 'pending') {
      return {
        ...reservation,
        status: 'rejected',
        rejectedAt: new Date().toISOString(),
        rejectedBy: 'admin',
        rejectionReason: rejectionReason,
      }
    }
    return reservation
  })
}

/**
 * Actualizar información de pago de una reserva
 */
export const updateReservationPaymentHelper = (reservations, reservationId, paymentData) => {
  return reservations.map((reservation) => {
    if (reservation.id === reservationId) {
      return {
        ...reservation,
        paymentStatus: paymentData.paymentStatus || 'fully_paid',
        fullPaymentDate: paymentData.fullPaymentDate || new Date().toISOString(),
        pendingAmount: paymentData.pendingAmount || 0,
        totalPaid: paymentData.totalPaid || reservation.totalPrice,
        paymentNotes: paymentData.paymentNotes || '',
      }
    }
    return reservation
  })
}

/**
 * Marcar un reembolso como procesado
 */
export const markRefundAsProcessedHelper = (reservations, reservationId) => {
  return reservations.map((r) => {
    if (r.id === reservationId && r.refundStatus === 'pending') {
      return {
        ...r,
        refundStatus: 'processed',
        refundProcessedAt: new Date().toISOString(),
      }
    }
    return r
  })
}

/**
 * Añadir una nueva reserva
 */
export const addReservationHelper = (reservations, reservationData) => {
  return [...reservations, reservationData]
}
