/**
 * Utilidades de cálculo para el calendario
 */

import { parseLocalDate } from '../dateFormatters'

/**
 * Calcular estadísticas del mes
 */
export const calculateMonthStats = (currentDate, filteredReservations, fields) => {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  // Filtrar reservas del mes actual
  const monthReservations = filteredReservations.filter((reservation) => {
    const resDate = parseLocalDate(reservation.date)
    return resDate >= firstDay && resDate <= lastDay
  })

  // Calcular horas totales
  const totalHours = monthReservations.reduce((total, reservation) => {
    // Priorizar campo 'hours' si existe
    if (reservation.hours && typeof reservation.hours === 'number') {
      return total + reservation.hours
    }
    // Fallback a cálculo manual
    if (reservation.time && reservation.time.includes('-')) {
      const [start, end] = reservation.time.split('-').map((t) => parseInt(t))
      return total + (end - start)
    }
    return total + 1
  }, 0)

  // Calcular ingresos totales
  const totalIncome = monthReservations.reduce((total, reservation) => {
    // Priorizar totalPrice si existe y la reserva está pagada
    if (reservation.totalPrice && typeof reservation.totalPrice === 'number') {
      // Solo contar si está pagada (paid/fully_paid)
      if (reservation.paymentStatus === 'paid' || reservation.paymentStatus === 'fully_paid') {
        return total + reservation.totalPrice
      }
      // Para pagos parciales
      if (
        reservation.paymentStatus === 'partial' ||
        reservation.paymentStatus === 'partially_paid'
      ) {
        // Usar advancePayment si existe, sino calcular 30%
        const partialAmount = reservation.advancePayment || reservation.totalPrice * 0.3
        return total + partialAmount
      }
      return total
    }

    // Fallback: calcular basado en field.pricePerHour
    const field = fields.find((f) => f.id === reservation.fieldId)
    if (field && field.pricePerHour) {
      const hours =
        reservation.hours ||
        (reservation.time && reservation.time.includes('-')
          ? reservation.time.split('-').map((t) => parseInt(t))[1] -
            reservation.time.split('-').map((t) => parseInt(t))[0]
          : 1)

      if (reservation.paymentStatus === 'paid' || reservation.paymentStatus === 'fully_paid') {
        return total + field.pricePerHour * hours
      }
      if (
        reservation.paymentStatus === 'partial' ||
        reservation.paymentStatus === 'partially_paid'
      ) {
        return total + field.pricePerHour * hours * 0.3
      }
    }
    return total
  }, 0)

  // Calcular tasa de ocupación
  const daysInMonth = lastDay.getDate()
  const totalAvailableHours = daysInMonth * fields.length * 12
  const occupancyRate =
    totalAvailableHours > 0 ? Math.round((totalHours / totalAvailableHours) * 100) : 0

  // Comparación con mes anterior
  const prevMonth = new Date(year, month - 1, 1)
  const prevMonthEnd = new Date(year, month, 0)
  const prevMonthReservations = filteredReservations.filter((reservation) => {
    const resDate = parseLocalDate(reservation.date)
    return resDate >= prevMonth && resDate <= prevMonthEnd
  })
  const prevMonthIncome = prevMonthReservations.reduce((total, reservation) => {
    return total + (reservation.totalPrice || 0)
  }, 0)

  const incomeGrowth =
    prevMonthIncome > 0 ? Math.round(((totalIncome - prevMonthIncome) / prevMonthIncome) * 100) : 0

  return {
    totalReservations: monthReservations.length,
    totalHours,
    totalIncome,
    occupancyRate,
    incomeGrowth,
    avgReservationsPerDay: Math.round((monthReservations.length / daysInMonth) * 10) / 10,
  }
}

/**
 * Obtener datos del mes (días con reservas)
 */
export const getMonthData = (currentDate, getReservationsForDate) => {
  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  const days = []

  // Días del mes anterior
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month, -i)
    days.push({
      date: prevDate,
      isCurrentMonth: false,
      reservations: getReservationsForDate(prevDate),
    })
  }

  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    days.push({
      date: date,
      isCurrentMonth: true,
      reservations: getReservationsForDate(date),
    })
  }

  // Días del mes siguiente
  const remainingDays = 42 - days.length
  for (let day = 1; day <= remainingDays; day++) {
    const nextDate = new Date(year, month + 1, day)
    days.push({
      date: nextDate,
      isCurrentMonth: false,
      reservations: getReservationsForDate(nextDate),
    })
  }

  return days
}

/**
 * Obtener datos de la semana
 */
export const getWeekData = (currentDate, getReservationsForDate, isToday) => {
  const startOfWeek = new Date(currentDate)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day
  startOfWeek.setDate(diff)

  const week = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    week.push({
      date: date,
      reservations: getReservationsForDate(date),
      isToday: isToday(date),
    })
  }
  return week
}
