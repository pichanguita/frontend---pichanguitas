import { useMemo } from 'react'
import { FIELD_APPROVAL_STATUS } from '../constants/fieldStatus'
import { RESERVATION_STATUS } from '../constants/reservationStatus'
import { PAYMENT_STATUS } from '../constants/paymentStatus'
import { ALERT_STATUS } from '../constants/alertTypes'
import { USER_ROLES } from '../constants/roles'

// Ventana de anticipación para considerar que un pago parcial requiere acción
const ACTION_REQUIRED_LEAD_MINUTES = 30

/**
 * Hook para calcular contadores de badges en el Admin Panel
 * Centraliza y optimiza el cálculo de contadores con memoization
 *
 * Todos los contadores se derivan de arrays reactivos (Zustand) para que se
 * recalculen automáticamente cuando llegan nuevos registros del polling.
 */
export const useAdminCounts = ({
  user,
  existingReservations = [],
  alerts = [],
  fields = [],
  pendingRefunds = [],
  pendingRegistrationsCount = 0,
}) => {
  // Contador de alertas no leídas (filtradas por rol)
  const unreadAlerts = useMemo(() => {
    try {
      const adminId = user?.role === USER_ROLES.ADMIN ? user?.id : null
      return alerts.filter((alert) => {
        const isUnread =
          alert.status === ALERT_STATUS.UNREAD || (!alert.status && alert.is_read === false)
        if (!isUnread) return false
        if (adminId) {
          return alert.adminId === adminId || alert.admin_id === adminId
        }
        return true
      }).length
    } catch (error) {
      console.error('Error calculating unread alerts:', error)
      return 0
    }
  }, [user, alerts])

  // Contador de canchas pendientes de aprobación
  const pendingFieldsCount = useMemo(() => {
    try {
      return fields.filter((f) => f.approvalStatus === FIELD_APPROVAL_STATUS.PENDING).length
    } catch (error) {
      console.error('Error calculating pending fields:', error)
      return 0
    }
  }, [fields])

  // Contador de solicitudes de registro pendientes (desde API)
  const pendingRegistrations = useMemo(() => {
    return pendingRegistrationsCount
  }, [pendingRegistrationsCount])

  // Contador de reservas pendientes de aprobación
  const pendingReservationsCount = useMemo(() => {
    try {
      return existingReservations.filter((r) => r.status === RESERVATION_STATUS.PENDING).length
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
      const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes()

      return existingReservations.filter((r) => {
        // Solo reservas confirmadas con pago parcial (esperando pago del resto)
        const isConfirmed = r.status === RESERVATION_STATUS.CONFIRMED
        const isPartiallyPaid =
          (r.paymentStatus || r.payment_status) === PAYMENT_STATUS.PARTIALLY_PAID

        if (!isConfirmed || !isPartiallyPaid) return false

        // Solo reservas de hoy
        const reservationDate = (r.date || '').split('T')[0]
        if (reservationDate !== today) return false

        // Obtener hora de inicio de la reserva (formato "HH:MM" o "HH:MM:SS")
        const startTime = r.startTime || r.start_time || ''
        if (!startTime) return false

        const [hours, minutes] = startTime.split(':').map(Number)
        const reservationTimeInMinutes = hours * 60 + (minutes || 0)

        // Requiere acción si la hora ya pasó o está dentro de la ventana de anticipación
        const timeDiff = reservationTimeInMinutes - currentTimeInMinutes
        return timeDiff <= ACTION_REQUIRED_LEAD_MINUTES
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
