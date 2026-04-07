/**
 * Helpers para consultas y filtrado de reservas
 */

/**
 * Obtener una reserva por ID
 */
export const getReservationByIdHelper = (reservations, reservationId) => {
  return reservations.find((r) => r.id === reservationId) || null
}

/**
 * Filtrar reservas según criterios múltiples
 */
export const filterReservations = (reservations, filters = {}) => {
  let filtered = [...reservations]

  if (filters.fieldId) {
    filtered = filtered.filter((r) => r.fieldId === filters.fieldId)
  }

  if (filters.date) {
    filtered = filtered.filter((r) => r.date === filters.date)
  }

  if (filters.status) {
    filtered = filtered.filter((r) => r.status === filters.status)
  }

  if (filters.phoneNumber) {
    filtered = filtered.filter((r) => r.phoneNumber === filters.phoneNumber)
  }

  return filtered
}

/**
 * Obtener reservas con reembolsos pendientes
 */
export const getPendingRefundsHelper = (reservations) => {
  return reservations.filter((r) => r.refundStatus === 'pending')
}

/**
 * Generar resumen de reserva
 */
export const generateReservationSummaryHelper = (params) => {
  const { selectedField, selectedDate, selectedTimeRanges, phoneNumber, timeRanges } = params

  if (!selectedField || !selectedDate || !selectedTimeRanges.length || !phoneNumber) {
    return null
  }

  const firstTimeRange = timeRanges.find((tr) => tr.id === selectedTimeRanges[0])
  const totalHours = selectedTimeRanges.length
  const totalAmount = selectedField.pricePerHour * totalHours

  // Generar los time slots legibles (ej: "08:00 - 09:00")
  const timeSlots = selectedTimeRanges.map((rangeId) => {
    const range = timeRanges.find((tr) => tr.id === rangeId)
    return range ? `${range.start} - ${range.end}` : rangeId
  })

  return {
    id: Date.now().toString(),
    field: selectedField,
    date: selectedDate,
    timeRange: firstTimeRange,
    timeSlots,
    totalHours,
    phoneNumber,
    totalAmount,
    createdAt: new Date().toISOString(),
  }
}
