/**
 * Utilidades para PaymentControlModule
 *
 * Funciones auxiliares de formateo y cálculo de estados
 */

/**
 * Obtiene información del estado del pago (texto, color, icono)
 * @param {Object} payment - Pago a evaluar
 * @returns {Object} - { text, color, bgColor, iconType }
 */
export const getPaymentStatusInfo = (payment) => {
  if (payment.status === 'paid') {
    return {
      text: 'Pagado',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      iconType: 'CheckCircle',
    }
  }

  if (payment.status === 'reported') {
    return {
      text: 'Reportado',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      iconType: 'FileCheck',
    }
  }

  // Confiar en el status calculado por el backend (incluye verificación de fecha de registro)
  const today = new Date()
  const dueDate = new Date(payment.dueDate)

  if (payment.status === 'overdue') {
    const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))
    return {
      text: `Atrasado ${daysLate}d`,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      iconType: 'AlertCircle',
    }
  }

  // Pending: vencimiento puede estar en el futuro o ya pasó (config recién creada)
  if (dueDate >= today) {
    const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))
    return {
      text: daysRemaining > 0 ? `Vence en ${daysRemaining}d` : 'Vence hoy',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      iconType: 'Clock',
    }
  }

  // Due date pasó pero config es nueva, mostrar como pendiente
  return {
    text: 'Pendiente',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    iconType: 'Clock',
  }
}

/**
 * Convierte número de mes a nombre en español
 * @param {number} month - Número de mes (1-12)
 * @returns {string} - Nombre del mes
 */
export const getMonthName = (month) => {
  const months = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]
  return months[month - 1]
}
