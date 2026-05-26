import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import useBookingStore from '../store/bookingStore'
import useAuthStore from '../store/authStore'
import { downloadReservationPDF } from '../utils/pdfGenerator'
import { generateConfirmationMessage } from '../utils/whatsappService'
import { getOrCreateCustomerByPhone } from '../services/customer/customerService'
import { createPublicReservation } from '../services/booking/reservationService'
import { convertTimeRangesToStartEnd } from '../utils/timeRangeHelpers'
import {
  SWAL_CONFIG,
  generateReservationData,
  generateWhatsAppData,
} from '../utils/payment-flow/paymentFlowHelpers'
import { parseLocalDate } from '../utils/dateFormatters'

const MySwal = withReactContent(Swal)

/**
 * Custom hook para la lógica del flujo de pago.
 *
 * El cliente solo SELECCIONA el método de pago (yape, plin, efectivo, etc.):
 * no se abre ninguna ventana adicional ni se sube comprobante. Cualquier pago
 * (incluido el adelanto si la cancha lo exige) se coordina directamente con el
 * administrador, por lo que la reserva se crea como pago pendiente.
 */
const usePaymentFlow = (onComplete) => {
  // Estado local
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Zustand stores
  const {
    selectedField,
    selectedDate,
    selectedTimeRanges,
    timeRanges,
    phoneNumber,
    setPhoneNumber,
    resetBooking,
    setPaymentMethod: setStorePaymentMethod,
    paymentMethods,
    calculatePriceWithDiscount,
    loadFieldPaymentMethods,
    freeHoursToUse,
    setFreeHoursToUse,
    selectedReservationSport,
  } = useBookingStore()

  const { user, isAuthenticated } = useAuthStore()

  // Auto-completar teléfono del usuario logueado
  useEffect(() => {
    if (isAuthenticated && user?.phone && !phoneNumber) {
      setPhoneNumber(user.phone)
    }
  }, [isAuthenticated, user, phoneNumber, setPhoneNumber])

  // Cargar métodos de pago de la cancha seleccionada al montar
  useEffect(() => {
    if (selectedField?.id) {
      loadFieldPaymentMethods(selectedField.id)
    }
  }, [selectedField?.id, loadFieldPaymentMethods])

  // Calcular precios usando calculatePriceWithDiscount (que SÍ aplica precios especiales)
  const priceResult = calculatePriceWithDiscount(selectedField, selectedDate, selectedTimeRanges)

  // Aplicar descuento de horas gratis seleccionadas por el cliente
  // (toggle en ConfirmationPanel, pre-activado al entrar desde Promociones).
  // Las promociones se canjean en horas completas (no fraccionables).
  const hoursSelected = selectedTimeRanges.length
  const freeHoursToApply = Math.min(freeHoursToUse, hoursSelected)
  const pricePerHour = selectedField?.pricePerHour || 0
  const freeHoursDiscount = freeHoursToApply * pricePerHour

  const pricing = {
    priceInfo: priceResult,
    subtotal: priceResult.originalPrice,
    discount: priceResult.discount,
    freeHoursDiscount,
    freeHoursUsed: freeHoursToApply,
    totalAmount: Math.max(0, priceResult.finalPrice - freeHoursDiscount),
  }

  // ============================================
  // 💰 ADELANTO (informativo / coordinado con el administrador)
  // El cliente ya no paga el adelanto en línea ni sube comprobante: se muestra
  // el monto como referencia y el pago se coordina directamente con el admin.
  // ============================================
  const fieldRequiresAdvance = selectedField?.requiresAdvancePayment === true
  const fieldAdvancePerHour = parseFloat(selectedField?.advancePaymentAmount) || 0
  const hoursReserved = selectedTimeRanges?.length || 1
  const calculatedAdvance = Math.min(fieldAdvancePerHour * hoursReserved, pricing.totalAmount)

  const advanceInfo = {
    required: fieldRequiresAdvance,
    perHour: fieldAdvancePerHour,
    hours: hoursReserved,
    amount: calculatedAdvance,
    remaining: pricing.totalAmount - calculatedAdvance,
  }

  /**
   * Procesa la reserva completa
   */
  const processReservation = async () => {
    // Si el total es 0 (por horas gratis), no requerir método de pago
    const isFreeReservation = pricing.totalAmount === 0 && pricing.freeHoursUsed > 0

    if (!isFreeReservation && !paymentMethod) {
      MySwal.fire({
        icon: 'warning',
        title: 'Método de pago requerido',
        text: 'Por favor selecciona un método de pago',
        ...SWAL_CONFIG,
      })
      return
    }

    setIsProcessing(true)

    try {
      // Establecer el método de pago en el store
      setStorePaymentMethod(paymentMethod)

      // PASO 1: Obtener cliente
      let phoneToUse = phoneNumber
      let customerId = null

      // Si el usuario está autenticado y tiene customerId, usarlo directamente
      if (isAuthenticated && user?.customerId) {
        customerId = user.customerId
        phoneToUse = user.phone || phoneNumber
      } else {
        // Usuario NO autenticado: buscar o crear por teléfono
        // IMPORTANTE: Si se usan horas gratis, DEBE ser el teléfono del usuario logueado
        if (pricing.freeHoursUsed > 0 && isAuthenticated && user?.phone) {
          if (phoneNumber !== user.phone) {
            phoneToUse = user.phone
            setPhoneNumber(user.phone)
          }
        }

        // En esta rama el reservante NO es un cliente identificado (reserva pública
        // desde la landing). NO usar user?.username: si hay una sesión admin abierta
        // en el navegador, su username contamina el nombre del cliente ("admin").
        // El identificador correcto del cliente público es su teléfono.
        const customerName = phoneToUse
        const customer = await getOrCreateCustomerByPhone(phoneToUse, customerName)

        if (!customer || !customer.id) {
          throw new Error('No se pudo crear el cliente')
        }

        customerId = customer.id
      }

      // PASO 2: Preparar datos de la reserva

      // Convertir timeRanges a start_time/end_time
      const { start_time, end_time, hours } = convertTimeRangesToStartEnd(
        selectedTimeRanges,
        timeRanges
      )

      // El pago (incluido cualquier adelanto) se coordina con el administrador:
      // no se registra pago en línea, por lo que el saldo pendiente es el total.
      const advancePayment = 0
      const remainingPayment = pricing.totalAmount

      // Determinar estado de pago
      // Si es reserva gratis (cubierta por horas gratis), marcar como fully_paid.
      // De lo contrario empieza como 'pending' - el admin es quien confirma el pago.
      const isFreeReservationFinal = pricing.totalAmount === 0 && pricing.freeHoursUsed > 0
      const paymentStatus = isFreeReservationFinal ? 'fully_paid' : 'pending'

      // Resolver el deporte a persistir: en canchas multi-deporte viene del
      // selector del paso 3; en canchas mono-deporte cae al único disponible.
      const fieldSports = Array.isArray(selectedField?.sportTypes) ? selectedField.sportTypes : []
      const resolvedSportType =
        selectedReservationSport ?? fieldSports[0] ?? selectedField?.sportType ?? null

      const reservationPayload = {
        field_id: selectedField.id,
        customer_id: customerId,
        date: selectedDate,
        start_time,
        end_time,
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        total_price: pricing.totalAmount,
        advance_payment: isFreeReservationFinal ? 0 : advancePayment,
        remaining_payment: isFreeReservationFinal ? 0 : remainingPayment,
        payment_method: isFreeReservationFinal ? 'free_hours' : paymentMethod,
        payment_status: paymentStatus,
        payment_voucher_url: null,
        status: 'confirmed', // ✅ TODAS las reservas se confirman automáticamente
        type: 'customer_booking',
        hours: hours,
        phone_number: phoneToUse,
        free_hours_used: pricing.freeHoursUsed || 0,
        free_hours_discount: pricing.freeHoursDiscount || 0,
        sport_type: resolvedSportType,
      }

      // Llamar al backend para crear la reserva
      const newReservation = await createPublicReservation(reservationPayload)

      if (!newReservation || !newReservation.id) {
        throw new Error('No se pudo crear la reserva')
      }

      // Actualizar store local con la reserva creada
      useBookingStore.getState().addReservation(newReservation)

      // Resetear horas gratis usadas
      if (pricing.freeHoursUsed > 0) {
        setFreeHoursToUse(0)
      }

      // Generar datos de reserva (para el PDF)
      const reservationData = generateReservationData(
        selectedField,
        selectedDate,
        selectedTimeRanges,
        timeRanges,
        phoneToUse,
        paymentMethod,
        pricing.totalAmount
      )

      // Hay pago pendiente cuando la reserva no es gratis y tiene monto > 0.
      const hasPendingPayment = !isFreeReservationFinal && pricing.totalAmount > 0

      // Descargar PDF automáticamente
      try {
        await downloadReservationPDF(reservationData)
      } catch {
        // PDF download failed silently
      }

      // Cerrar el modal padre (BookingFlow/PaymentFlow) y resetear el booking
      // ANTES de mostrar el Swal de éxito. Si lo dejamos para después, el modal
      // de pago queda visible detrás del Swal y se cierra recién cuando el
      // usuario despide el Swal — dando la sensación de "dos modales que se
      // cierran a la vez". Las variables del summary ya están capturadas en el
      // closure (selectedField, selectedDate, etc.), así que el reset es seguro.
      resetBooking()
      if (onComplete) onComplete()

      // Mostrar confirmación
      MySwal.fire({
        icon: 'success',
        title: '¡Reserva Confirmada!',
        html: `
          <div class="text-center space-y-4">
            <div class="bg-green-50 p-4 rounded-lg">
              <h4 class="font-semibold text-green-800 mb-2">✅ Tu reserva está confirmada</h4>
              <div class="space-y-2 text-sm text-green-700">
                <p><strong>Cancha:</strong> ${selectedField?.name}</p>
                <p><strong>Fecha:</strong> ${parseLocalDate(selectedDate).toLocaleDateString('es-PE')}</p>
                <p><strong>Horarios:</strong> ${selectedTimeRanges.map((id) => timeRanges.find((tr) => tr.id === id)?.label).join(', ')}</p>
                <p><strong>Total:</strong> S/ ${pricing.totalAmount.toFixed(2)}</p>
                <p><strong>Teléfono:</strong> ${phoneToUse}</p>
                ${
                  hasPendingPayment
                    ? `
                  <div class="mt-3 p-2 bg-yellow-100 rounded-lg">
                    <p class="text-yellow-800 font-medium">⏳ PAGO PENDIENTE</p>
                    <p class="text-xs text-yellow-700 mt-1">Coordina y realiza el pago con el administrador de la cancha</p>
                  </div>
                `
                    : ''
                }
              </div>
            </div>
            <div class="bg-blue-50 p-4 rounded-lg">
              <p class="text-sm text-blue-700">
                🎉 <strong>¡Perfecto!</strong> Tu cancha está reservada.
              </p>
            </div>
          </div>
        `,
        showCancelButton: true,
        showCloseButton: true,
        showConfirmButton: false,
        cancelButtonText:
          '<div style="line-height: 1.3;"><div style="font-size: 18px; font-weight: 600;">Finalizar</div><div style="font-size: 14px; font-weight: 400; margin-top: 2px;">Enviar reserva por WhatsApp al administrador</div></div>',
        cancelButtonColor: '#22c55e',
        allowOutsideClick: true,
        allowEscapeKey: true,
      }).then(async (result) => {
        // Enviar WhatsApp automáticamente cuando se hace clic en el botón
        if (result.dismiss === Swal.DismissReason.cancel) {
          const whatsappData = generateWhatsAppData(
            phoneToUse,
            selectedDate,
            selectedTimeRanges,
            timeRanges,
            pricing.totalAmount,
            paymentMethod
          )

          // Enviar WhatsApp al administrador de la cancha usando el telefono de la cancha
          const adminPhone = selectedField?.phone

          if (adminPhone) {
            // Formatear telefono con codigo de pais
            const formattedPhone = adminPhone.replace(/\D/g, '').startsWith('51')
              ? adminPhone.replace(/\D/g, '')
              : '51' + adminPhone.replace(/\D/g, '')

            // Generar mensaje de confirmacion
            const message = generateConfirmationMessage(whatsappData, selectedField)
            const encodedMessage = encodeURIComponent(message)

            // Abrir WhatsApp
            const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
            window.open(whatsappUrl, '_blank')

            // Mostrar feedback al usuario
            Swal.fire({
              icon: 'success',
              title: 'WhatsApp Abierto',
              text: 'Se ha abierto WhatsApp para confirmar tu reserva con el administrador de la cancha',
              toast: true,
              position: 'top-end',
              timer: 3000,
              showConfirmButton: false,
              timerProgressBar: true,
            })
          } else {
            console.warn('No se encontro telefono de la cancha')
            Swal.fire({
              icon: 'warning',
              title: 'Sin numero de contacto',
              text: 'La cancha no tiene un numero de WhatsApp configurado. El administrador debe configurar su numero en el panel.',
              toast: true,
              position: 'top-end',
              timer: 4000,
              showConfirmButton: false,
            })
          }

          // Modal padre y booking ya fueron limpiados antes de abrir el Swal.
          return
        }

        if (result.isConfirmed) {
          await downloadReservationPDF(reservationData)
          MySwal.fire({
            icon: 'success',
            title: '¡Confirmación Descargada!',
            text: 'Tu confirmación de reserva se ha descargado correctamente',
            timer: 2000,
            showConfirmButton: false,
            ...SWAL_CONFIG,
          })
        }
        // Si se cierra con la X o ESC, no hacemos nada extra: el modal padre
        // y el booking ya fueron limpiados antes de mostrar este Swal.
      })
    } catch (error) {
      // Mostrar el mensaje real del backend cuando exista (ej: validación de precio,
      // cancha no disponible, etc.). Caer al mensaje genérico solo si no hay info útil.
      console.error('❌ Error al crear reserva:', error)
      const backendMessage = typeof error?.message === 'string' ? error.message.trim() : ''
      const fallbackMessage = 'Hubo un problema al confirmar tu reserva. Intenta nuevamente.'
      MySwal.fire({
        icon: 'error',
        title: 'Error al procesar',
        text: backendMessage || fallbackMessage,
        ...SWAL_CONFIG,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    // Estado
    paymentMethod,
    isProcessing,

    // Datos calculados
    pricing,
    advanceInfo, // 💰 Info de adelanto para mostrar al cliente
    selectedField,
    selectedDate,
    selectedTimeRanges,
    timeRanges,
    phoneNumber,
    paymentMethods,

    // Setters
    setPaymentMethod,

    // Handlers
    processReservation,
  }
}

export default usePaymentFlow
