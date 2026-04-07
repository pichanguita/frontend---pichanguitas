/**
 * Helpers para la creación y gestión de reservas
 */

/**
 * Crear múltiples reservas basadas en los time ranges seleccionados
 */
export const createReservationObjects = (params) => {
  const {
    selectedTimeRanges,
    timeRanges,
    selectedField,
    selectedDate,
    phoneNumber,
    paymentMethod,
    customerName,
    requiresConfirmation,
    pricingStore,
  } = params

  const isCashPayment = paymentMethod === 'efectivo'
  const reservationStatus = requiresConfirmation ? 'pending' : 'confirmed'

  return selectedTimeRanges.map((timeSlotId) => {
    const timeRange = timeRanges.find((tr) => tr.id === timeSlotId)

    // Calcular precio individual para este slot considerando descuentos
    const slotPriceInfo = pricingStore.calculatePriceWithDiscount(selectedField, selectedDate, [
      timeSlotId,
    ])

    return {
      fieldId: selectedField.id,
      fieldName: selectedField.name,
      date: selectedDate,
      time: `${timeRange.startTime}-${timeRange.endTime}`,
      timeSlots: [timeSlotId],
      sportType: selectedField.sportType,
      phoneNumber,
      paymentMethod,
      customerName: customerName || phoneNumber,
      clientName: customerName || phoneNumber,
      createdAt: new Date().toISOString(),
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${timeSlotId}`,
      status: reservationStatus,
      paymentStatus: isCashPayment ? 'pending' : 'paid',
      isPendingCashPayment: isCashPayment,
      type: 'customer_booking',
      pricing: {
        originalPrice: slotPriceInfo.originalPrice,
        finalPrice: slotPriceInfo.finalPrice,
        discount: slotPriceInfo.discount,
        appliedDiscounts: slotPriceInfo.appliedDiscounts,
      },
    }
  })
}

/**
 * Calcular datos de reembolso para una cancelación
 */
export const calculateCancellationRefund = (reservation, field, pricingStore) => {
  // Calcular si hay reembolso
  const eventDateTime = new Date(`${reservation.date}T${reservation.time.split('-')[0]}`)
  const now = new Date()
  const hoursUntilEvent = (eventDateTime - now) / (1000 * 60 * 60)

  const totalPaid = reservation.pricing?.finalPrice || reservation.totalPrice || 0
  const refundData = pricingStore.calculateRefund(
    totalPaid,
    field.cancellationPolicy,
    hoursUntilEvent
  )

  return refundData
}

/**
 * Crear objeto de reserva cancelada
 */
export const createCancelledReservation = (reservation, cancelledBy, refundData) => {
  return {
    ...reservation,
    status: 'cancelled',
    cancelledAt: new Date().toISOString(),
    cancelledBy,
    refundAmount: refundData.refundAmount,
    refundPercentage: refundData.refundPercentage,
    refundStatus: refundData.refundAmount > 0 ? 'pending' : 'not_applicable',
    originalStatus: reservation.status,
  }
}

/**
 * Generar mensaje de cancelación
 */
export const generateCancellationMessage = (refundAmount) => {
  if (refundAmount > 0) {
    return {
      success: true,
      message: `Reserva cancelada. Recibirás un reembolso de S/ ${refundAmount.toFixed(2)}`,
      refundAmount,
    }
  } else {
    return {
      success: true,
      message: 'Reserva cancelada. No hay reembolso según la política de la cancha.',
      refundAmount: 0,
    }
  }
}
