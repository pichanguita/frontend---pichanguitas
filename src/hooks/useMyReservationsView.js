import { useState, useMemo, useCallback } from 'react'
import Swal from 'sweetalert2'
import {
  separateReservations,
  calculateFieldRentalCount,
  calculateTotalPendingBalance,
} from '../utils/reservations-view/calculators'
import { getStatusBadge } from '../utils/reservations-view/formatters'
import { cancelReservationPublic } from '../services/booking/reservationService'
import { SWAL_COLORS } from '../constants/ui'
import useBookingStore from '../store/bookingStore'

export const useMyReservationsView = ({
  existingReservations,
  fields,
  user,
  canReviewReservation,
  canCancelReservation,
}) => {
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [activeSubTab, setActiveSubTab] = useState('activas')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [reservationToCancel, setReservationToCancel] = useState(null)

  // Filtrar reservas del cliente actual
  const myReservations = useMemo(() => {
    if (!user) return []

    const filtered = existingReservations
      .filter((reservation) => {
        // Comparar por customerId (ID de la tabla customers)
        const matchByCustomerId =
          user.customerId &&
          (reservation.customerId === user.customerId ||
            reservation.customer_id === user.customerId)
        // Comparar por customerPhone/phoneNumber
        const matchByPhone =
          reservation.customerPhone === user.phone ||
          reservation.phoneNumber === user.phone ||
          reservation.customer_phone === user.phone

        return matchByCustomerId || matchByPhone
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    return filtered
  }, [existingReservations, user])

  // Separar en activas y pasadas
  const { activeReservations, pastReservations } = useMemo(() => {
    return separateReservations(myReservations)
  }, [myReservations])

  // Calcular cantidad de veces que se alquiló cada cancha
  const fieldRentalCount = useMemo(() => {
    return calculateFieldRentalCount(myReservations)
  }, [myReservations])

  // Calcular saldo pendiente total (incluye reservas activas + historial cobrable)
  const totalPendingBalance = useMemo(() => {
    return calculateTotalPendingBalance(myReservations)
  }, [myReservations])

  // Función para obtener información de la cancha
  const getFieldInfo = useCallback(
    (fieldId) => {
      // Comparar como strings para evitar problemas de tipo (number vs string)
      return fields.find((f) => String(f.id) === String(fieldId))
    },
    [fields]
  )

  // Función de cancelación
  const handleCancelReservation = useCallback(
    (reservation, validation) => {
      if (!validation.canCancel) {
        Swal.fire({
          icon: 'error',
          title: 'No se puede cancelar',
          text: validation.reason,
          confirmButtonColor: SWAL_COLORS.CONFIRM,
        })
        return
      }

      // Obtener el fieldId de la reserva (puede venir en camelCase o snake_case)
      const reservationFieldId = reservation.fieldId || reservation.field_id

      // Obtener la política de cancelación real de la cancha
      const fieldInfo = fields.find((f) => String(f.id) === String(reservationFieldId))

      // ✅ FIX: Log para debugging en producción
      console.log('🔍 [CANCEL] Buscando política de cancelación:', {
        reservationFieldId,
        fieldInfo: fieldInfo ? { id: fieldInfo.id, name: fieldInfo.name } : null,
        cancellationPolicy: fieldInfo?.cancellationPolicy,
        fieldsCount: fields.length,
        fieldsIds: fields.map((f) => f.id),
      })

      // ✅ FIX: Usar la política de la cancha, con fallback más informativo
      // Si no se encuentra la cancha, usamos la política de la validación (viene del backend)
      const cancellationPolicy = fieldInfo?.cancellationPolicy ||
        validation.cancellationPolicy || {
          allowCancellation: true,
          hoursBeforeEvent: 24,
          refundPercentage: 0,
          isDefault: true, // Flag para saber que es valor por defecto
        }

      // Calcular horas hasta el evento
      const now = new Date()
      // Parsear fecha correctamente para evitar bugs de timezone
      const dateStr = reservation.date?.includes('T')
        ? reservation.date.split('T')[0]
        : reservation.date
      const eventDate = new Date(`${dateStr}T${reservation.startTime || '00:00'}`)
      const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60)

      // Calcular reembolso usando la política REAL de la cancha
      // Soportar ambos formatos: camelCase y snake_case
      const totalPaid =
        parseFloat(reservation.advancePayment) || parseFloat(reservation.advance_payment) || 0
      const realRefundPercentage = parseFloat(cancellationPolicy.refundPercentage) || 0
      const refundAmount = Math.round(((totalPaid * realRefundPercentage) / 100) * 100) / 100

      console.log('💰 [CANCEL] Cálculo de reembolso:', {
        totalPaid,
        realRefundPercentage,
        refundAmount,
        policySource: cancellationPolicy.isDefault ? 'DEFAULT' : 'FIELD_CONFIG',
      })

      // Agregar información adicional a la validación
      const enhancedValidation = {
        ...validation,
        hoursUntilEvent,
        totalPaid,
        refundAmount,
        refundPercentage: realRefundPercentage,
        // ✅ Nuevo: indicar si hay adelanto pagado para mostrar mensaje correcto
        hasAdvancePayment: totalPaid > 0,
        // ✅ Nuevo: indicar si la política ofrece reembolso
        policyOffersRefund: realRefundPercentage > 0,
      }

      setReservationToCancel({ ...reservation, validation: enhancedValidation, cancellationPolicy })
      setShowCancelModal(true)
    },
    [fields]
  )

  const confirmCancellation = useCallback(async () => {
    if (!reservationToCancel || !user?.phone) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo verificar tu identidad. Por favor, intenta de nuevo.',
        confirmButtonColor: SWAL_COLORS.CONFIRM,
      })
      return
    }

    // Mostrar loading
    Swal.fire({
      title: 'Cancelando reserva...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading()
      },
    })

    try {
      // Llamar a la API pública de cancelación
      const result = await cancelReservationPublic(
        reservationToCancel.id,
        user.phone,
        'Cancelada por el cliente'
      )

      if (result.success) {
        // Recargar reservas desde el backend
        const loadReservations = useBookingStore.getState().loadReservations
        await loadReservations()

        Swal.fire({
          icon: 'success',
          title: '¡Reserva Cancelada!',
          html: `
            <div class="text-left">
              <p class="mb-2">${result.message}</p>
              ${
                result.refund && result.refund.amount > 0
                  ? `
                <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p class="text-sm text-green-800">
                    <strong>Reembolso:</strong> S/ ${result.refund.amount.toFixed(2)}<br>
                    ${result.refund.message || 'El administrador procesará tu reembolso pronto.'}
                  </p>
                </div>
              `
                  : ''
              }
            </div>
          `,
          confirmButtonColor: SWAL_COLORS.CONFIRM,
        })

        setShowCancelModal(false)
        setReservationToCancel(null)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cancelar',
          text: result.message,
          confirmButtonColor: SWAL_COLORS.CONFIRM,
        })
      }
    } catch (error) {
      console.error('Error cancelando reserva:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al cancelar la reserva',
        confirmButtonColor: SWAL_COLORS.CONFIRM,
      })
    }
  }, [reservationToCancel, user])

  // Función para abrir modal de review
  const handleOpenReview = useCallback((reservation) => {
    setSelectedReservation(reservation)
    setReviewModalOpen(true)
  }, [])

  // Función para cerrar modal de review
  const handleCloseReview = useCallback(() => {
    setSelectedReservation(null)
    setReviewModalOpen(false)
  }, [])

  return {
    // State
    activeSubTab,
    setActiveSubTab,
    reviewModalOpen,
    selectedReservation,
    showCancelModal,
    reservationToCancel,

    // Data
    myReservations,
    activeReservations,
    pastReservations,
    fieldRentalCount,
    totalPendingBalance,

    // Functions
    getFieldInfo,
    getStatusBadge,
    handleCancelReservation,
    confirmCancellation,
    handleOpenReview,
    handleCloseReview,
    canReviewReservation,
    canCancelReservation,

    // Closers
    closeCancelModal: () => setShowCancelModal(false),
  }
}
