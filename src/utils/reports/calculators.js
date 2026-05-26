/**
 * Utilidades de cálculo para reportes
 * Usa funciones centralizadas de revenueCalculator para consistencia
 */

import { parseLocalDate } from '../dateFormatters'
import { getReservationRevenue, getReservationTotalPrice } from './calculators/revenueCalculator'
import { CASH_PAYMENT_LABEL } from '../../constants/paymentStatus'

/**
 * Obtener la cancha más utilizada
 */
export const getMostUsedField = (reservations, fields) => {
  if (!reservations?.length || !fields?.length) return 'N/A'

  const fieldUsage = {}
  reservations.forEach((reservation) => {
    const fieldId = reservation.fieldId
    if (fieldId) {
      fieldUsage[fieldId] = (fieldUsage[fieldId] || 0) + 1
    }
  })

  if (Object.keys(fieldUsage).length === 0) return 'N/A'

  const mostUsedId = Object.keys(fieldUsage).reduce((a, b) =>
    fieldUsage[a] > fieldUsage[b] ? a : b
  )
  const field = fields.find((f) => String(f.id) === String(mostUsedId))
  return field ? field.name : 'N/A'
}

/**
 * Calcular ingresos por cancha (usando función centralizada)
 */
export const calculateFieldRevenue = (reservations, fields) => {
  const fieldData = {}

  reservations.forEach((reservation) => {
    const fieldId = reservation.fieldId
    const field = fields.find((f) => String(f.id) === String(fieldId))

    if (field) {
      if (!fieldData[fieldId]) {
        fieldData[fieldId] = {
          name: field.name,
          reservations: 0,
          revenue: 0,
          pricePerHour: field.pricePerHour,
          utilization: 0,
        }
      }
      fieldData[fieldId].reservations += 1
      // Usar función centralizada para calcular ingreso
      fieldData[fieldId].revenue += getReservationRevenue(reservation, field)
    }
  })

  // Calcular utilización (simulada basada en reservas del mes)
  Object.values(fieldData).forEach((field) => {
    field.utilization = Math.min(Math.round((field.reservations / 30) * 100), 100)
  })

  return Object.values(fieldData).sort((a, b) => b.revenue - a.revenue)
}

/**
 * Calcular estadísticas de utilización
 */
export const calculateUtilizationStats = (reservations, fields) => {
  const fieldUsage = calculateFieldRevenue(reservations, fields)
  const averageUtilization =
    fieldUsage.length > 0
      ? Math.round(
          fieldUsage.reduce((sum, field) => sum + field.utilization, 0) / fieldUsage.length
        )
      : 0

  const mostUsed = fieldUsage.length > 0 ? fieldUsage[0].name : 'N/A'
  const leastUsed = fieldUsage.length > 0 ? fieldUsage[fieldUsage.length - 1].name : 'N/A'

  return {
    averageUtilization,
    mostUsedField: mostUsed,
    leastUsedField: leastUsed,
    peakHour: '8:00 PM - 9:00 PM', // Simulado
  }
}

/**
 * Calcular utilización por tipo de deporte
 */
export const calculateTypeUtilization = (reservations, fields) => {
  const typeStats = {}

  fields.forEach((field) => {
    const type = field.sportType || 'Otro'
    if (!typeStats[type]) {
      typeStats[type] = {
        type: type,
        totalFields: 0,
        reservations: 0,
        utilization: 0,
      }
    }
    typeStats[type].totalFields += 1
  })

  reservations.forEach((reservation) => {
    const field = fields.find((f) => String(f.id) === String(reservation.fieldId))
    if (field) {
      const type = field.sportType || 'Otro'
      if (typeStats[type]) {
        typeStats[type].reservations += 1
      }
    }
  })

  // Calcular utilización
  Object.values(typeStats).forEach((type) => {
    type.utilization =
      type.totalFields > 0 ? Math.round((type.reservations / (type.totalFields * 30)) * 100) : 0
  })

  return Object.values(typeStats).sort((a, b) => b.utilization - a.utilization)
}

/**
 * Calcular estadísticas de clientes (usando función centralizada)
 */
export const calculateClientStats = (reservations, fields) => {
  const clientData = {}

  reservations.forEach((reservation) => {
    const clientKey = reservation.customerName || reservation.phoneNumber || 'Cliente Anónimo'
    const field = fields.find((f) => String(f.id) === String(reservation.fieldId))
    // Usar función centralizada para calcular ingreso
    const revenue = getReservationRevenue(reservation, field)

    if (!clientData[clientKey]) {
      clientData[clientKey] = {
        name: clientKey,
        phone: reservation.phoneNumber || 'N/A',
        reservations: 0,
        totalSpent: 0,
        lastReservation: reservation.date,
      }
    }

    clientData[clientKey].reservations += 1
    clientData[clientKey].totalSpent += revenue

    // Actualizar última reserva si es más reciente
    if (parseLocalDate(reservation.date) > parseLocalDate(clientData[clientKey].lastReservation)) {
      clientData[clientKey].lastReservation = reservation.date
    }
  })

  const clients = Object.values(clientData)
  const uniqueClients = clients.length
  const averageReservationsPerClient =
    uniqueClients > 0 ? Math.round(reservations.length / uniqueClients) : 0
  const mostFrequentClient =
    clients.length > 0
      ? clients.reduce((a, b) => (a.reservations > b.reservations ? a : b)).name
      : 'N/A'
  const averageTicket =
    uniqueClients > 0
      ? Math.round(clients.reduce((sum, client) => sum + client.totalSpent, 0) / uniqueClients)
      : 0

  // Formatear fecha de última reserva
  clients.forEach((client) => {
    client.lastReservation = new Date(client.lastReservation).toLocaleDateString('es-PE')
  })

  return {
    uniqueClients,
    averageReservationsPerClient,
    mostFrequentClient,
    averageTicket,
    topClients: clients.sort((a, b) => b.totalSpent - a.totalSpent),
  }
}

/**
 * Calcular estadísticas por método de pago (usando función centralizada)
 */
export const calculatePaymentMethodStats = (reservations, fields) => {
  const paymentMethods = {
    efectivo: { name: CASH_PAYMENT_LABEL, count: 0, total: 0, percentage: 0 },
    yape: { name: 'Yape', count: 0, total: 0, percentage: 0 },
    plin: { name: 'Plin', count: 0, total: 0, percentage: 0 },
    transferencia: { name: 'Transferencia', count: 0, total: 0, percentage: 0 },
    tarjeta: { name: 'Tarjeta', count: 0, total: 0, percentage: 0 },
    otro: { name: 'Otro', count: 0, total: 0, percentage: 0 },
  }

  let totalRevenue = 0

  reservations.forEach((reservation) => {
    const field = fields.find((f) => String(f.id) === String(reservation.fieldId))
    // Usar función centralizada para calcular monto
    const amount = getReservationTotalPrice(reservation, field)
    const method = (reservation.paymentMethod || 'otro').toLowerCase()

    if (paymentMethods[method]) {
      paymentMethods[method].count++
      paymentMethods[method].total += amount
      totalRevenue += amount
    } else {
      paymentMethods['otro'].count++
      paymentMethods['otro'].total += amount
      totalRevenue += amount
    }
  })

  // Calcular porcentajes
  Object.values(paymentMethods).forEach((method) => {
    method.percentage = totalRevenue > 0 ? ((method.total / totalRevenue) * 100).toFixed(1) : 0
  })

  return {
    paymentMethods,
    totalRevenue,
    mostUsedMethod:
      Object.values(paymentMethods).sort((a, b) => b.count - a.count)[0]?.name || 'N/A',
  }
}

// Re-exportar funciones del calculador centralizado para acceso conveniente
export {
  getReservationRevenue,
  getReservationTotalPrice,
  filterReservationsByDateRange,
  getDateRangeText,
  calculateTotalRevenue,
  calculateTotalPending,
} from './calculators/revenueCalculator'
