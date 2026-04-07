/**
 * Helpers para la creación de alertas y notificaciones
 */

import { createAlertAPI } from '../../services/alerts/alertsService'
import useAuthStore from '../../store/authStore'

/**
 * Crear datos de reserva para alerta
 */
export const createReservationDataForAlert = (params) => {
  const {
    customerName,
    phoneNumber,
    selectedDate,
    timeRanges,
    selectedTimeRanges,
    priceInfo,
    paymentMethod,
  } = params

  return {
    customerName: customerName || phoneNumber,
    customerPhone: phoneNumber,
    date: selectedDate,
    startTime: timeRanges.find((tr) => tr.id === selectedTimeRanges[0])?.startTime,
    endTime: timeRanges.find((tr) => tr.id === selectedTimeRanges[selectedTimeRanges.length - 1])
      ?.endTime,
    totalAmount: priceInfo.finalPrice,
    originalAmount: priceInfo.originalPrice,
    discount: priceInfo.discount,
    paymentMethod: paymentMethod,
    totalHours: selectedTimeRanges.length,
  }
}

/**
 * Filtrar administradores relevantes para una cancha
 */
export const getRelevantAdmins = (users, selectedField) => {
  return users.filter((user) => {
    // SuperAdmins ven todas las alertas
    if (user.role === 'super_admin') return true
    // Admins generales ven todas las alertas
    if (user.role === 'admin' && user.adminType === 'general') return true
    // Admins de cancha solo ven alertas de sus canchas asignadas
    if (user.role === 'admin' && user.adminType === 'field') {
      // Verificar si la cancha está en managedFields del admin
      const managedFields = user.managedFields || []
      return managedFields.some(
        (mf) => mf.fieldId === selectedField.id || mf.field_id === selectedField.id
      )
    }
    return false
  })
}

/**
 * Crear alertas para todos los administradores relevantes
 */
export const createAlertsForAdmins = async (admins, reservationData, selectedField, alertStore) => {
  for (const admin of admins) {
    await alertStore.createNewReservationAlert(reservationData, selectedField, admin.id)
  }
}

/**
 * Crear alerta de cancelación con reembolso (persiste en BD)
 */
export const createCancellationAlert = async (
  alertStore,
  reservation,
  refundAmount,
  reservationId
) => {
  const message = `${reservation.customerName || reservation.phoneNumber} canceló su reserva. Reembolso pendiente: S/ ${refundAmount.toFixed(2)}`

  // Agregar al store local para toast inmediato
  alertStore.addAlert({
    type: 'cancellation',
    title: 'Cancelación con Reembolso Pendiente',
    message,
    priority: 'high',
    relatedId: reservationId,
    fieldId: reservation.fieldId,
  })

  // Persistir en BD
  const token = useAuthStore.getState().token
  if (token) {
    try {
      await createAlertAPI(
        {
          type: 'cancellation',
          title: 'Cancelación con Reembolso Pendiente',
          message,
          priority: 'high',
          field_id: reservation.fieldId,
          reservation_id: reservationId,
          admin_id: reservation.adminId || useAuthStore.getState().user?.id,
          reservation_data: JSON.stringify({ refundAmount, reservation }),
        },
        token
      )
      console.log('✅ Alerta de cancelación guardada en BD')
    } catch (error) {
      console.error('❌ Error guardando alerta de cancelación:', error)
    }
  }
}
