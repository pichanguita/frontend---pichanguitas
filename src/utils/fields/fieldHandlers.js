/**
 * Handlers para AvailableFieldsView
 *
 * Maneja las acciones de reserva con SweetAlert
 */

import Swal from 'sweetalert2'
import { calculateEndTime, calculateReservationPrices } from './fieldUtils'
import { SWAL_COLORS } from '../../constants/ui'

/**
 * Maneja la confirmación y creación de una reserva
 */
export const handleReservation = async ({
  selectedField,
  selectedDate,
  selectedTimeSlot,
  duration,
  isSlotAvailable,
  user,
  addReservation,
  clearSelection,
}) => {
  // Validación de datos requeridos
  if (!selectedField || !selectedDate || !selectedTimeSlot) {
    Swal.fire({
      icon: 'warning',
      title: 'Información Incompleta',
      text: 'Por favor selecciona cancha, fecha y horario',
      confirmButtonColor: SWAL_COLORS.CONFIRM,
    })
    return
  }

  // Calcular hora de fin
  const endTimeStr = calculateEndTime(selectedTimeSlot, duration)

  // Verificar disponibilidad
  if (!isSlotAvailable(selectedField.id, selectedDate, selectedTimeSlot)) {
    Swal.fire({
      icon: 'error',
      title: 'Horario No Disponible',
      text: 'Este horario ya está reservado. Por favor elige otro.',
      confirmButtonColor: SWAL_COLORS.CONFIRM,
    })
    return
  }

  // Calcular montos
  const { totalPrice, advancePayment, remainingPayment } = calculateReservationPrices(
    selectedField.pricePerHour,
    duration
  )

  // Confirmar reserva
  const result = await Swal.fire({
    title: 'Confirmar Reserva',
    html: `
      <div class="text-left space-y-2">
        <p><strong>Cancha:</strong> ${selectedField.name}</p>
        <p><strong>Fecha:</strong> ${new Date(selectedDate + 'T00:00:00').toLocaleDateString(
          'es-PE',
          {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }
        )}</p>
        <p><strong>Horario:</strong> ${selectedTimeSlot} - ${endTimeStr}</p>
        <p><strong>Duración:</strong> ${duration} ${duration === 1 ? 'hora' : 'horas'}</p>
        <hr class="my-3"/>
        <p><strong>Precio Total:</strong> S/ ${totalPrice.toFixed(2)}</p>
        <p class="text-green-600"><strong>Adelanto (30%):</strong> S/ ${advancePayment.toFixed(2)}</p>
        <p class="text-orange-600"><strong>Saldo Pendiente:</strong> S/ ${remainingPayment.toFixed(2)}</p>
        <p class="text-xs text-gray-600 mt-3">*El saldo restante se paga al llegar a la cancha</p>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Confirmar y Pagar Adelanto',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: SWAL_COLORS.CONFIRM,
    cancelButtonColor: SWAL_COLORS.CANCEL,
  })

  if (result.isConfirmed) {
    try {
      // Crear la reserva
      const newReservation = {
        id: `reservation-${Date.now()}`,
        fieldId: selectedField.id,
        fieldName: selectedField.name,
        customerId: user.id,
        customerName: user.name,
        phoneNumber: user.phone,
        date: selectedDate,
        time: `${selectedTimeSlot}-${endTimeStr}`,
        startTime: selectedTimeSlot,
        endTime: endTimeStr,
        hours: duration,
        timeSlots: [selectedTimeSlot],
        totalPrice: totalPrice,
        advancePayment: advancePayment,
        remainingPayment: remainingPayment,
        paymentStatus: 'partially_paid', // Ya pagó el adelanto
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        type: 'customer_booking',
      }

      addReservation(newReservation)

      Swal.fire({
        icon: 'success',
        title: '¡Reserva Confirmada!',
        html: `
          <div class="text-left space-y-2">
            <p>Tu reserva ha sido confirmada exitosamente.</p>
            <p class="text-sm text-gray-600 mt-2">
              <strong>Código de Reserva:</strong> ${newReservation.id}
            </p>
            <p class="text-sm text-orange-600 mt-2">
              <strong>Recuerda:</strong> Debes pagar S/ ${remainingPayment.toFixed(2)} al llegar a la cancha.
            </p>
          </div>
        `,
        confirmButtonColor: SWAL_COLORS.CONFIRM,
      })

      // Limpiar selección
      clearSelection()
    } catch (_error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo procesar la reserva. Intenta nuevamente.',
        confirmButtonColor: SWAL_COLORS.CONFIRM,
      })
    }
  }
}
