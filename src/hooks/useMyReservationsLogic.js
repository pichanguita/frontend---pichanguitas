import { useState, useCallback } from 'react'
import Swal from 'sweetalert2'
import { cancelReservationPublic } from '../services/booking/reservationService'
import useBookingStore from '../store/bookingStore'

export const useMyReservationsLogic = ({
  existingReservations,
  fields = [],
  canCancelReservation,
}) => {
  // Helper para obtener la política de cancelación de la cancha
  const getCancellationPolicy = useCallback(
    (fieldId) => {
      // Buscar el campo por ID (soportar tanto number como string)
      const field = fields.find((f) => f.id === fieldId || String(f.id) === String(fieldId))

      // ✅ FIX: Log para debugging
      console.log('🔍 [getCancellationPolicy] Buscando política:', {
        fieldId,
        fieldFound: field ? { id: field.id, name: field.name } : null,
        cancellationPolicy: field?.cancellationPolicy,
        fieldsCount: fields.length,
      })

      return field?.cancellationPolicy || null
    },
    [fields]
  )
  const [phoneNumber, setPhoneNumber] = useState('')
  const [reservations, setReservations] = useState([])
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const handleSearch = () => {
    if (!phoneNumber || phoneNumber.length !== 9) {
      Swal.fire({
        icon: 'warning',
        title: 'Teléfono Inválido',
        text: 'Por favor ingresa un número de teléfono válido de 9 dígitos',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    const clientReservations = existingReservations
      .filter(
        (r) => r.phoneNumber === phoneNumber && (r.status === 'confirmed' || r.status === 'pending')
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    setReservations(clientReservations)
    setHasSearched(true)
  }

  const handleCancelClick = (reservation) => {
    // Obtener el fieldId de la reserva (puede venir en camelCase o snake_case)
    const reservationFieldId = reservation.fieldId || reservation.field_id

    // Obtener la política de cancelación de la cancha
    const cancellationPolicy = getCancellationPolicy(reservationFieldId)

    // ✅ FIX: Si no encontramos la política en el frontend, usar la que viene de la validación
    const effectivePolicy = cancellationPolicy || {
      allowCancellation: true,
      hoursBeforeEvent: 24,
      refundPercentage: 0,
      isDefault: true,
    }

    console.log('🔍 [handleCancelClick] Política efectiva:', {
      reservationFieldId,
      fromFields: cancellationPolicy,
      effectivePolicy,
    })

    // Validar si se puede cancelar usando la reserva completa y la política
    const validation = canCancelReservation(reservation, effectivePolicy)

    if (!validation.canCancel) {
      Swal.fire({
        icon: 'error',
        title: 'No se puede cancelar',
        text: validation.reason,
        confirmButtonColor: '#22c55e',
      })
      return
    }

    // Calcular horas hasta el evento
    const now = new Date()
    const dateStr = reservation.date?.includes('T')
      ? reservation.date.split('T')[0]
      : reservation.date
    const eventDate = new Date(`${dateStr}T${reservation.startTime || '00:00'}`)
    const hoursUntilEvent = (eventDate - now) / (1000 * 60 * 60)

    // Calcular el monto pagado y reembolso usando la política REAL
    const totalPaid =
      parseFloat(reservation.advancePayment) || parseFloat(reservation.advance_payment) || 0
    // ✅ FIX: Usar la política efectiva para obtener el porcentaje real
    const realRefundPercentage =
      parseFloat(effectivePolicy.refundPercentage) || parseFloat(validation.refundPercentage) || 0
    const refundAmount = Math.round(((totalPaid * realRefundPercentage) / 100) * 100) / 100

    console.log('💰 [handleCancelClick] Cálculo de reembolso:', {
      totalPaid,
      realRefundPercentage,
      refundAmount,
      policySource: effectivePolicy.isDefault ? 'DEFAULT' : 'FIELD_CONFIG',
    })

    // Enriquecer la validación con los montos y flags para el modal
    const enrichedValidation = {
      ...validation,
      totalPaid,
      refundAmount,
      refundPercentage: realRefundPercentage,
      hoursUntilEvent: Math.round(hoursUntilEvent * 10) / 10,
      // ✅ Nuevo: flags para mostrar mensajes correctos en el modal
      hasAdvancePayment: totalPaid > 0,
      policyOffersRefund: realRefundPercentage > 0,
    }

    setSelectedReservation({
      ...reservation,
      validation: enrichedValidation,
      cancellationPolicy: effectivePolicy,
    })
    setShowCancelModal(true)
  }

  const confirmCancellation = async () => {
    if (!selectedReservation || !phoneNumber) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo verificar tu identidad. Por favor, intenta de nuevo.',
        confirmButtonColor: '#22c55e',
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
        selectedReservation.id,
        phoneNumber,
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
          confirmButtonColor: '#22c55e',
        })

        // Refrescar búsqueda
        handleSearch()
        setShowCancelModal(false)
        setSelectedReservation(null)
      } else {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo cancelar',
          text: result.message,
          confirmButtonColor: '#22c55e',
        })
      }
    } catch (error) {
      console.error('Error cancelando reserva:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Ocurrió un error al cancelar la reserva',
        confirmButtonColor: '#22c55e',
      })
    }
  }

  const closeCancelModal = () => {
    setShowCancelModal(false)
    setSelectedReservation(null)
  }

  return {
    phoneNumber,
    setPhoneNumber,
    reservations,
    hasSearched,
    selectedReservation,
    showCancelModal,
    handleSearch,
    handleCancelClick,
    confirmCancellation,
    closeCancelModal,
  }
}
