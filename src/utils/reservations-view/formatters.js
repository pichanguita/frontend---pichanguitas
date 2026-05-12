/**
 * Formatea la fecha de una reserva en formato largo español
 */
export const formatReservationDate = (dateString) => {
  if (!dateString) return 'Fecha no disponible'

  try {
    // Si la fecha ya tiene formato ISO completo, extraer solo la parte de fecha
    let dateOnly = dateString
    if (typeof dateString === 'string') {
      // Manejar formato ISO: "2025-11-26T00:00:00.000Z"
      if (dateString.includes('T')) {
        dateOnly = dateString.split('T')[0]
      }
    }

    const date = new Date(dateOnly + 'T12:00:00')
    if (isNaN(date.getTime())) {
      return 'Fecha no válida'
    }

    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch (error) {
    console.error('Error formateando fecha:', error, dateString)
    return 'Fecha no válida'
  }
}

/**
 * Formatea la fecha en formato corto para el modal
 */
export const formatReservationDateShort = (dateString) => {
  if (!dateString) return 'Fecha no disponible'

  try {
    // Si la fecha ya tiene formato ISO completo, extraer solo la parte de fecha
    let dateOnly = dateString
    if (typeof dateString === 'string') {
      if (dateString.includes('T')) {
        dateOnly = dateString.split('T')[0]
      }
    }

    const date = new Date(dateOnly + 'T12:00:00')
    if (isNaN(date.getTime())) {
      return 'Fecha no válida'
    }

    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch (error) {
    console.error('Error formateando fecha:', error, dateString)
    return 'Fecha no válida'
  }
}

/**
 * Obtiene el badge de estado según el estado de la reserva y pago
 */
export const getStatusBadge = (reservation) => {
  if (reservation.status === 'cancelled') {
    return {
      color: 'bg-red-100 text-red-800',
      iconName: 'XCircle',
      text: 'Cancelada',
    }
  }

  // No-show: el cliente no se presentó. El SA/admin marcó la reserva como
  // 'no_show' (tanto status como payment_status). Es un estado terminal.
  if (reservation.status === 'no_show' || reservation.paymentStatus === 'no_show') {
    return {
      color: 'bg-gray-200 text-gray-800',
      iconName: 'XCircle',
      text: 'No se presentó',
    }
  }

  if (reservation.paymentStatus === 'fully_paid' || reservation.paymentStatus === 'paid') {
    return {
      color: 'bg-green-100 text-green-800',
      iconName: 'CheckCircle',
      text: 'Pagado Completo',
    }
  }

  if (reservation.paymentStatus === 'partially_paid') {
    return {
      color: 'bg-orange-100 text-orange-800',
      iconName: 'AlertCircle',
      text: 'Pago Parcial',
    }
  }

  return {
    color: 'bg-yellow-100 text-yellow-800',
    iconName: 'Clock',
    text: 'Pendiente',
  }
}
