import { useState, useMemo, useEffect } from 'react'
import Swal from 'sweetalert2'
import useBookingStore from '../store/bookingStore'
import useFieldStore from '../store/modules/fieldStore'
import useAuthStore from '../store/authStore'
import { API_CONFIG, getAuthHeaders } from '../config/api.config'
import {
  ADVANCE_PERCENTAGE,
  calculatePaymentStats,
  filterReservations,
  calculateAmounts,
  canRegisterPayment as checkCanRegisterPayment,
} from '../utils/payment-management/paymentManagementHelpers'
import { formatDate } from '../utils/dateFormatters'

/**
 * Custom hook para manejar la lógica de gestión de pagos
 */
const usePaymentManagement = () => {
  const { existingReservations, loadReservations, loadRefunds } = useBookingStore()
  const { fields, loadFields } = useFieldStore()
  useAuthStore()

  // Estado local
  const [activeTab, setActiveTab] = useState('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDateRange, setSelectedDateRange] = useState('all')
  const [selectedField, setSelectedField] = useState('all')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Cargar reservas y canchas desde la base de datos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true)

        // Cargar canchas primero (necesarias para calcular estadísticas)
        await loadFields()

        // Luego cargar reservas
        await loadReservations()
      } catch (_error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los datos. Por favor, recarga la página.',
          confirmButtonColor: '#ef4444',
        })
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [loadReservations, loadFields])

  // Actualizar la hora actual cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Reservas filtradas por cancha, fecha y búsqueda (sin filtrar por tab).
  // Esta es la base que comparten:
  //   - paymentStats: para que los badges de las pestañas reflejen el scope actual
  //     (ej: al elegir una cancha específica, los contadores se ajustan).
  //   - filteredReservations: agrega además el filtro por activeTab.
  // Antes paymentStats leía existingReservations sin filtrar, por eso los badges
  // mostraban totales globales aunque la tabla estuviera vacía.
  const scopedReservations = useMemo(() => {
    return filterReservations(existingReservations, {
      activeTab: 'all',
      searchTerm,
      selectedField,
      selectedDateRange,
    })
  }, [existingReservations, searchTerm, selectedField, selectedDateRange])

  // Calcular estadísticas de pagos sobre el scope filtrado
  const paymentStats = useMemo(() => {
    return calculatePaymentStats(scopedReservations, fields)
  }, [scopedReservations, fields])

  // Filtrar reservas según el tab activo (sobre el mismo scope)
  const filteredReservations = useMemo(() => {
    return filterReservations(scopedReservations, {
      activeTab,
      searchTerm: '',
      selectedField: 'all',
      selectedDateRange: 'all',
    })
  }, [scopedReservations, activeTab])

  // Handler para cuando el cliente no se presenta
  const handleNoShow = (reservation) => {
    // Usar montos REALES de la base de datos (total_price = 0 es válido para horas gratis)
    const totalPrice = parseFloat(reservation.totalPrice ?? reservation.total_price ?? 0) || 0
    const advancePaid = parseFloat(reservation.advancePayment ?? reservation.advance_payment ?? 0) || 0
    const pendingAmount =
      parseFloat(reservation.remainingPayment ?? reservation.remaining_payment ?? 0) || 0

    const fieldId = reservation.fieldId || reservation.field_id
    const field = fields.find((f) => f.id === fieldId)
    const fieldName = field?.name || reservation.fieldName || reservation.field_name || 'N/A'
    const customerName = reservation.customerName || reservation.customer_name || 'N/A'
    const advancePercentage = totalPrice > 0 ? Math.round((advancePaid / totalPrice) * 100) : 0

    Swal.fire({
      title: 'Cliente No Se Presentó',
      html: `
        <div class="text-left">
          <p class="mb-3"><strong>Cliente:</strong> ${customerName}</p>
          <p class="mb-3"><strong>Cancha:</strong> ${fieldName}</p>
          <p class="mb-3"><strong>Fecha:</strong> ${formatDate(reservation.date)}</p>
          <p class="mb-3"><strong>Hora:</strong> ${reservation.time || 'N/A'}</p>
          <hr class="my-3">
          <div class="bg-amber-50 p-3 rounded-lg mb-3">
            <p class="mb-2 text-sm"><strong>Adelanto Pagado (${advancePercentage}%):</strong> <span class="text-green-600">S/ ${advancePaid.toFixed(2)}</span></p>
            <p class="text-sm"><strong>Monto No Cobrado:</strong> <span class="text-red-600">S/ ${pendingAmount.toFixed(2)}</span></p>
          </div>

          <div class="bg-blue-50 p-4 rounded-lg mb-3">
            <p class="font-medium text-blue-900 mb-3">¿Qué hacer con el adelanto?</p>
            <div class="space-y-2">
              <label class="flex items-start gap-2 cursor-pointer p-2 hover:bg-blue-100 rounded">
                <input type="radio" name="refundOption" value="keep" checked class="mt-1" />
                <div>
                  <p class="font-medium text-sm text-gray-900">Retener el adelanto</p>
                  <p class="text-xs text-gray-600">El adelanto se mantiene como ingreso (penalización por no presentarse)</p>
                </div>
              </label>
              <label class="flex items-start gap-2 cursor-pointer p-2 hover:bg-blue-100 rounded">
                <input type="radio" name="refundOption" value="refund" class="mt-1" />
                <div>
                  <p class="font-medium text-sm text-gray-900">Devolver el adelanto</p>
                  <p class="text-xs text-gray-600">Se devolverá S/ ${advancePaid.toFixed(2)} al cliente</p>
                </div>
              </label>
            </div>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      showCloseButton: true,
      allowEscapeKey: true,
      width: '550px',
      preConfirm: () => {
        const refundOption = document.querySelector('input[name="refundOption"]:checked').value
        return { shouldRefund: refundOption === 'refund' }
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        const shouldRefund = result.value.shouldRefund

        try {
          // Llamar al endpoint del backend para marcar como no show
          const response = await fetch(API_CONFIG.RESERVATIONS.NO_SHOW(reservation.id), {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
              shouldRefund,
              refundAmount: advancePaid,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Error al marcar como no show')
          }

          // Recargar las reservas desde la BD para reflejar los cambios
          await loadReservations()

          // Si se creó un reembolso, recargar la lista de reembolsos
          if (shouldRefund) {
            await loadRefunds()
          }

          Swal.fire({
            icon: shouldRefund ? 'info' : 'success',
            title: 'Reserva Cerrada',
            html: `
              <div class="text-left">
                <p class="mb-3">La reserva ha sido marcada como "Cliente no se presentó" en la base de datos.</p>
                ${
                  shouldRefund
                    ? `
                    <div class="bg-blue-50 p-3 rounded-lg">
                      <p class="text-sm text-blue-800 font-medium">💰 Reembolso pendiente: S/ ${advancePaid.toFixed(2)}</p>
                      <p class="text-xs text-blue-600 mt-1">📋 Registrado en pestaña "Reembolsos"</p>
                      <p class="text-sm text-red-600 mt-2">✗ Ingreso total no percibido: S/ ${totalPrice.toFixed(2)}</p>
                    </div>
                  `
                    : `
                    <div class="bg-amber-50 p-3 rounded-lg">
                      <p class="text-sm text-green-600">✓ Adelanto retenido: S/ ${advancePaid.toFixed(2)}</p>
                      <p class="text-sm text-red-600">✗ Ingreso no percibido: S/ ${pendingAmount.toFixed(2)}</p>
                    </div>
                  `
                }
              </div>
            `,
            timer: 4000,
            showConfirmButton: true,
            confirmButtonColor: '#22c55e',
            showCloseButton: true,
            allowEscapeKey: true,
          })
        } catch (error) {
          console.error('Error al marcar como no show:', error)
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text:
              error.message ||
              'No se pudo marcar la reserva como no show. Por favor, intenta de nuevo.',
            confirmButtonColor: '#ef4444',
          })
        }
      }
    })
  }

  // Registrar pago completo
  const handleCompletePayment = (reservation) => {
    const paymentCheck = checkCanRegisterPayment(reservation, currentTime)
    if (!paymentCheck.enabled) {
      Swal.fire({
        icon: 'warning',
        title: 'Pago no disponible',
        text: paymentCheck.reason,
        confirmButtonColor: '#f59e0b',
        showCloseButton: true,
      })
      return
    }

    // Usar valores REALES de la base de datos
    // IMPORTANTE: total_price es el precio FINAL (después de descuentos como horas gratis).
    // total_price = 0 es válido cuando el cliente cubrió todo con horas gratis.
    const totalPrice =
      parseFloat(reservation.totalPrice ?? reservation.total_price ?? 0) || 0
    const advancePaid = parseFloat(reservation.advancePayment ?? reservation.advance_payment ?? 0) || 0
    const pendingAmount =
      parseFloat(reservation.remainingPayment ?? reservation.remaining_payment ?? 0) || 0

    const fieldId = reservation.fieldId || reservation.field_id
    const field = fields.find((f) => f.id === fieldId)
    const fieldName = field?.name || reservation.fieldName || reservation.field_name || 'N/A'
    const customerName = reservation.customerName || reservation.customer_name || 'N/A'

    // Determinar qué monto cobrar (el pendiente si hay adelanto, sino el total)
    const montoACobrar = advancePaid > 0 ? pendingAmount : totalPrice

    Swal.fire({
      title: 'Confirmar Asistencia y Pago',
      html: `
        <div class="text-left">
          <p class="mb-2"><strong>Cliente:</strong> ${customerName}</p>
          <p class="mb-2"><strong>Cancha:</strong> ${fieldName}</p>
          <p class="mb-2"><strong>Fecha:</strong> ${formatDate(reservation.date)}</p>
          <p class="mb-2"><strong>Hora:</strong> ${reservation.time || 'N/A'}</p>
          <hr class="my-3">
          <div class="bg-gray-50 p-3 rounded-lg space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Total Reserva:</span>
              <span class="font-medium">S/ ${totalPrice.toFixed(2)}</span>
            </div>
            ${
              advancePaid > 0
                ? `
              <div class="flex justify-between text-green-600">
                <span>Adelanto pagado:</span>
                <span class="font-medium">S/ ${advancePaid.toFixed(2)}</span>
              </div>
            `
                : ''
            }
            <div class="flex justify-between text-lg pt-2 border-t border-gray-200">
              <span class="font-semibold">${advancePaid > 0 ? 'Monto a cobrar ahora:' : 'Monto a Cobrar:'}</span>
              <span class="text-green-600 font-bold">S/ ${montoACobrar.toFixed(2)}</span>
            </div>
          </div>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Confirmar Pago',
      cancelButtonText: 'Cancelar',
      showCloseButton: true,
      allowEscapeKey: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Llamar al endpoint del backend para completar la reserva y marcar como pagada
          const response = await fetch(API_CONFIG.RESERVATIONS.COMPLETE(reservation.id), {
            method: 'PUT',
            headers: getAuthHeaders(),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Error al registrar el pago')
          }

          // Recargar las reservas desde la BD para reflejar los cambios
          await loadReservations()

          Swal.fire({
            icon: 'success',
            title: 'Pago Registrado',
            html: `
              <div class="text-left">
                <p class="mb-2">El pago ha sido registrado exitosamente en la base de datos.</p>
                <div class="bg-green-50 p-3 rounded-lg mt-3 space-y-1">
                  ${
                    advancePaid > 0
                      ? `
                    <p class="text-sm text-green-700"><strong>Adelanto previo:</strong> S/ ${advancePaid.toFixed(2)}</p>
                    <p class="text-sm text-green-700"><strong>Cobrado ahora:</strong> S/ ${montoACobrar.toFixed(2)}</p>
                    <hr class="my-2 border-green-200">
                  `
                      : ''
                  }
                  <p class="text-sm font-semibold text-green-800"><strong>Total Cobrado:</strong> S/ ${totalPrice.toFixed(2)}</p>
                  <p class="text-sm text-green-600"><strong>Estado:</strong> Completado y Pagado</p>
                </div>
              </div>
            `,
            timer: 3000,
            showConfirmButton: true,
            showCloseButton: true,
            allowEscapeKey: true,
          })
        } catch (error) {
          console.error('Error al registrar pago:', error)
          Swal.fire({
            icon: 'error',
            title: 'Error al Registrar Pago',
            text: error.message || 'No se pudo registrar el pago. Por favor, intenta de nuevo.',
            confirmButtonColor: '#ef4444',
          })
        }
      }
    })
  }

  return {
    // Estado
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    selectedDateRange,
    setSelectedDateRange,
    selectedField,
    setSelectedField,
    currentTime,
    isLoadingData,

    // Datos calculados
    paymentStats,
    filteredReservations,
    fields,

    // Handlers
    handleNoShow,
    handleCompletePayment,

    // Utilidades
    ADVANCE_PERCENTAGE,
    calculateAmounts: (reservation) => calculateAmounts(reservation, fields),
    canRegisterPayment: (reservation) => checkCanRegisterPayment(reservation, currentTime),
  }
}

export default usePaymentManagement
