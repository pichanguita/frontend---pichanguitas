import { useMemo } from 'react'

/**
 * Hook para calcular contadores de badges en el Admin Panel
 * Centraliza y optimiza el cálculo de contadores con memoization
 *
 * Elimina ~30 líneas de código repetitivo
 */
export const useAdminCounts = ({
  user,
  existingReservations,
  getUnreadCount,
  getPendingFields,
  pendingRefunds = [],
  pendingRegistrationsCount = 0, // Nuevo parámetro desde API
  fields = [], // Para obtener info de las canchas
}) => {
  // Contador de alertas no leídas
  const unreadAlerts = useMemo(() => {
    try {
      return getUnreadCount(user?.role === 'admin' ? user?.id : null)
    } catch (error) {
      console.error('Error calculating unread alerts:', error)
      return 0
    }
  }, [user, getUnreadCount])

  // Contador de campos pendientes de aprobación
  const pendingFieldsCount = useMemo(() => {
    try {
      return getPendingFields().length
    } catch (error) {
      console.error('Error calculating pending fields:', error)
      return 0
    }
  }, [getPendingFields])

  // Contador de solicitudes de registro pendientes (desde API)
  const pendingRegistrations = useMemo(() => {
    return pendingRegistrationsCount
  }, [pendingRegistrationsCount])

  // Contador de reservas pendientes de aprobación
  const pendingReservationsCount = useMemo(() => {
    try {
      return existingReservations.filter((r) => r.status === 'pending').length
    } catch (error) {
      console.error('Error calculating pending reservations:', error)
      return 0
    }
  }, [existingReservations])

  // Contador de reembolsos pendientes
  const pendingRefundsCount = useMemo(() => {
    try {
      return pendingRefunds.length
    } catch (error) {
      console.error('Error calculating pending refunds:', error)
      return 0
    }
  }, [pendingRefunds])

  // Contador de pagos que requieren acción (registrar pago o cliente no llegó)
  const actionRequiredPaymentsCount = useMemo(() => {
    try {
      const now = new Date()
      const today = now.toISOString().split('T')[0]
      const currentHour = now.getHours()
      const currentMinutes = now.getMinutes()
      const currentTimeInMinutes = currentHour * 60 + currentMinutes

      return existingReservations.filter((r) => {
        // Solo reservas confirmadas con pago parcial (esperando pago del resto)
        const isConfirmed = r.status === 'confirmed'
        const isPartiallyPaid = (r.paymentStatus || r.payment_status) === 'partially_paid'

        if (!isConfirmed || !isPartiallyPaid) return false

        // Solo reservas de hoy
        const reservationDate = (r.date || '').split('T')[0]
        if (reservationDate !== today) return false

        // Obtener hora de inicio de la reserva
        const startTime = r.startTime || r.start_time || ''
        if (!startTime) return false

        // Parsear hora de inicio (formato "HH:MM" o "HH:MM:SS")
        const [hours, minutes] = startTime.split(':').map(Number)
        const reservationTimeInMinutes = hours * 60 + (minutes || 0)

        // Acción requerida si:
        // 1. La hora ya pasó (cliente debería haber llegado) - para "Registrar pago" o "No llegó"
        // 2. O está dentro de los próximos 30 minutos - para prepararse
        const timeDiff = reservationTimeInMinutes - currentTimeInMinutes

        // Si la hora ya pasó o está dentro de 30 min = requiere acción
        return timeDiff <= 30
      }).length
    } catch (error) {
      console.error('Error calculating action required payments:', error)
      return 0
    }
  }, [existingReservations])

  return {
    unreadAlerts,
    pendingFieldsCount,
    pendingRegistrations,
    pendingReservationsCount,
    pendingRefundsCount,
    actionRequiredPaymentsCount,
  }
}
