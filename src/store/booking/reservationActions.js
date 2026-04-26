/**
 * Módulo: Acciones de Reserva
 *
 * Gestiona todas las operaciones sobre reservas: crear, aprobar, rechazar, completar, cancelar
 * INTEGRADO CON BACKEND
 */

import Swal from 'sweetalert2'
import useAlertStore from '../alertStore'
import useAuthStore from '../authStore'
import useBlacklistStore from '../modules/blacklistStore'
import usePricingStore from '../modules/pricingStore'
import useFieldStore from '../modules/fieldStore'

// API Services
import {
  fetchReservations,
  fetchReservationById,
  createReservationAPI,
  updateReservationAPI,
  cancelReservationAPI,
  checkAvailabilityAPI,
  fetchFieldStatsAPI,
} from '../../services/booking/reservationService'

import { fetchRefunds, processRefundAPI } from '../../services/refunds/refundsService'

// Helpers
import { validateUserBlacklist } from '../../utils/booking-store/blacklistValidationHelper'
import { processCancellation } from '../../utils/booking-store/cancellationProcessHelper'
import { createReservationObjects } from '../../utils/booking-store/reservationHelpers'
import {
  getRelevantAdmins,
  createReservationDataForAlert,
  createAlertsForAdmins,
} from '../../utils/booking-store/alertHelpers'
import {
  approveReservationHelper,
  rejectReservationHelper,
  updateReservationPaymentHelper,
  addReservationHelper,
} from '../../utils/booking-store/reservationManagementHelpers'
import { getReservationByIdHelper } from '../../utils/booking-store/reservationQueriesHelpers'

export const createReservationActions = (set, get) => ({
  // ==================== API INTEGRATIONS ====================

  /**
   * Cargar reservas desde el backend
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Array de reservas
   */
  loadReservations: async (filters = {}) => {
    try {
      const reservations = await fetchReservations(filters)

      set({ existingReservations: reservations })
      return reservations
    } catch (error) {
      // NO retornar array vacío - dejar que el error se propague
      set({ existingReservations: [] })
      throw error
    }
  },

  /**
   * Obtener reserva por ID desde backend
   * @param {string} reservationId - ID de la reserva
   * @returns {Promise<Object|null>} Reserva o null
   */
  getReservationByIdAPI: async (reservationId) => {
    try {
      return await fetchReservationById(reservationId)
    } catch (error) {
      console.error('Error obteniendo reserva:', error)
      return null
    }
  },

  /**
   * Crear reserva en backend
   * @param {Object} reservationData - Datos de la reserva
   * @returns {Promise<Object|null>} Reserva creada o null
   */
  createReservationWithAPI: async (reservationData) => {
    try {
      const token = useAuthStore.getState().token
      if (!token) throw new Error('No hay token de autenticación')

      const newReservation = await createReservationAPI(reservationData, token)

      // Actualizar estado local
      const { existingReservations } = get()
      set({ existingReservations: [...existingReservations, newReservation] })

      return newReservation
    } catch (error) {
      console.error('Error creando reserva:', error)
      throw error
    }
  },

  /**
   * Aprobar reserva en backend
   * @param {string|number} reservationId - ID de la reserva
   * @param {Object} options - Opciones de aprobación
   * @param {boolean} options.paymentReceived - Si el pago fue recibido (default: false)
   * @param {string} options.expectedStatus - Estado esperado para bloqueo optimista (default: 'pending')
   * @returns {Promise<boolean>} True si se aprobó
   */
  approveReservationAPI: async (reservationId, options = {}) => {
    try {
      const token = useAuthStore.getState().token
      if (!token) throw new Error('No hay token de autenticación')

      const { paymentReceived = false, expectedStatus = 'pending' } = options

      // CORRECCIÓN CRÍTICA: Separar la lógica de aprobación y payment_status
      //
      // La aprobación de la reserva NO debe cambiar automáticamente el payment_status.
      // El payment_status solo debe actualizarse cuando el admin CONFIRMA que recibió el pago.
      //
      // FLUJO CORRECTO:
      // 1. Cliente crea reserva → status: 'pending', payment_status: 'pending'
      // 2. Admin aprueba reserva → status: 'confirmed', payment_status: 'pending' (sin cambio)
      // 3. Admin confirma pago recibido → payment_status: 'partially_paid' o 'fully_paid'

      const updates = {
        status: 'confirmed',
        expected_status: expectedStatus, // Bloqueo optimista para prevenir race conditions
      }

      // Solo actualizar payment_status si el admin explícitamente indica que recibió el pago
      if (paymentReceived) {
        updates.payment_status = 'partially_paid'
      }

      await updateReservationAPI(reservationId, updates, token)

      // Recargar todas las reservas desde el backend para mantener sincronización
      const freshReservations = await fetchReservations()
      set({ existingReservations: freshReservations })

      return true
    } catch (error) {
      // Si es un error de concurrencia, lanzar error específico
      if (error.response?.data?.code === 'CONCURRENT_MODIFICATION') {
        throw new Error(
          'CONCURRENT_MODIFICATION: Otra persona modificó esta reserva. Por favor, recarga e intenta nuevamente.'
        )
      }

      if (error.response?.data?.code === 'INVALID_STATE') {
        throw new Error(`INVALID_STATE: ${error.response.data.error}`)
      }

      throw error
    }
  },

  /**
   * Rechazar reserva en backend
   * @param {string} reservationId - ID de la reserva
   * @param {string} reason - Motivo del rechazo
   * @returns {Promise<boolean>} True si se rechazó
   */
  rejectReservationAPI: async (reservationId, reason = '') => {
    const token = useAuthStore.getState().token
    if (!token) throw new Error('No hay token de autenticación')

    const updates = { status: 'rejected', cancellation_reason: reason }
    await updateReservationAPI(reservationId, updates, token)

    // Recargar todas las reservas desde el backend para mantener sincronización
    const freshReservations = await fetchReservations()
    set({ existingReservations: freshReservations })

    return true
  },

  /**
   * Cancelar reserva en backend
   * @param {string} reservationId - ID de la reserva
   * @param {string} reason - Motivo de cancelación
   * @returns {Promise<boolean>} True si se canceló
   */
  cancelReservationAPI: async (reservationId, reason = '') => {
    const token = useAuthStore.getState().token
    if (!token) throw new Error('No hay token de autenticación')

    await cancelReservationAPI(reservationId, reason, token)

    // Recargar todas las reservas desde el backend para mantener sincronización
    const freshReservations = await fetchReservations()
    set({ existingReservations: freshReservations })

    return true
  },

  /**
   * Verificar disponibilidad en backend
   * @param {Object} params - { field_id, date, time_slots }
   * @returns {Promise<Object>} { available, conflicting_slots }
   */
  checkAvailabilityAPI: async (params) => {
    try {
      return await checkAvailabilityAPI(params)
    } catch (error) {
      console.error('Error verificando disponibilidad:', error)
      return { available: false, conflicting_slots: [] }
    }
  },

  /**
   * Obtener estadísticas de cancha en backend
   * @param {string} fieldId - ID de la cancha
   * @returns {Promise<Object>} Estadísticas
   */
  getFieldStatsAPI: async (fieldId) => {
    try {
      return await fetchFieldStatsAPI(fieldId)
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error)
      return null
    }
  },

  // ==================== CREAR RESERVA (LOCAL - LEGACY) ====================

  createReservation: (customerName = '') => {
    const {
      selectedField,
      selectedDate,
      selectedTimeRanges,
      phoneNumber,
      paymentMethod,
      existingReservations,
      timeRanges,
    } = get()

    // Validaciones básicas
    if (
      !selectedField ||
      !selectedDate ||
      !selectedTimeRanges.length ||
      !phoneNumber ||
      !paymentMethod
    ) {
      return false
    }

    // Verificar si el usuario está en lista negra
    const blacklistStore = useBlacklistStore.getState()
    const blacklistValidation = validateUserBlacklist(blacklistStore, phoneNumber)

    if (blacklistValidation.isBlocked) {
      Swal.fire({
        icon: 'error',
        title: 'Usuario Bloqueado',
        text: blacklistValidation.message,
        confirmButtonColor: '#22c55e',
      })
      return false
    }

    // Calcular precio
    const requiresConfirmation = selectedField.requiresManualConfirmation || false
    const pricingStore = usePricingStore.getState()
    const priceInfo = pricingStore.calculatePriceWithDiscount(
      selectedField,
      selectedDate,
      selectedTimeRanges
    )

    // Crear reservas
    const newReservations = createReservationObjects({
      selectedTimeRanges,
      timeRanges,
      selectedField,
      selectedDate,
      phoneNumber,
      paymentMethod,
      customerName,
      requiresConfirmation,
      pricingStore,
    })

    // Crear alertas para administradores
    try {
      const authStore = useAuthStore.getState()
      const alertStore = useAlertStore.getState()
      const admins = getRelevantAdmins(authStore.users, selectedField)
      const reservationData = createReservationDataForAlert({
        customerName,
        phoneNumber,
        selectedDate,
        timeRanges,
        selectedTimeRanges,
        priceInfo,
        paymentMethod,
      })

      createAlertsForAdmins(admins, reservationData, selectedField, alertStore)
    } catch (_error) {
      console.warn('Error creating reservation alert:', _error)
    }

    // Actualizar estado
    set({
      existingReservations: [...existingReservations, ...newReservations],
      reservationSummary: {
        ...newReservations[0],
        timeRanges: selectedTimeRanges,
        totalHours: selectedTimeRanges.length,
        totalPrice: selectedField.pricePerHour * selectedTimeRanges.length,
        customerName: customerName || phoneNumber,
      },
    })

    return true
  },

  // ==================== GESTIÓN DE RESERVAS ====================

  getReservationById: (reservationId) => {
    return getReservationByIdHelper(get().existingReservations, reservationId)
  },

  approveReservation: (reservationId) => {
    const updatedReservations = approveReservationHelper(get().existingReservations, reservationId)
    set({ existingReservations: updatedReservations })
    return true
  },

  rejectReservation: (reservationId, rejectionReason = '') => {
    const updatedReservations = rejectReservationHelper(
      get().existingReservations,
      reservationId,
      rejectionReason
    )
    set({ existingReservations: updatedReservations })
    return true
  },

  cancelReservation: (reservationId, cancelledBy = 'customer') => {
    const result = processCancellation({
      reservationId,
      cancelledBy,
      existingReservations: get().existingReservations,
      fieldStore: useFieldStore.getState(),
      pricingStore: usePricingStore.getState(),
      alertStore: useAlertStore.getState(),
    })

    if (result.success) {
      set({ existingReservations: result.reservations })
    }

    return result
  },

  updateReservationPayment: (reservationId, paymentData) => {
    const updatedReservations = updateReservationPaymentHelper(
      get().existingReservations,
      reservationId,
      paymentData
    )
    set({ existingReservations: updatedReservations })

    // Registrar actividad
    const authState = useAuthStore.getState()
    if (authState?.user) {
      authState.addActivityLog('payment_completed', {
        reservationId,
        amount: paymentData.totalPaid,
        timestamp: new Date().toISOString(),
      })
    }

    return true
  },

  // ==================== REFUNDS API ====================

  /**
   * Cargar reembolsos desde el backend
   * @param {Object} filters - Filtros opcionales (status, customer_id, etc.)
   * @returns {Promise<Array>} Array de reembolsos
   */
  loadRefunds: async (filters = { status: 'pending' }) => {
    try {
      const refunds = await fetchRefunds(filters)

      // Transformar datos del backend al formato esperado por el frontend
      const transformedRefunds = refunds.map((refund) => ({
        id: String(refund.id),
        reservationId: String(refund.reservation_id || ''),
        customerId: refund.customer_id,
        customerName: refund.customer_name || 'Cliente',
        phoneNumber: refund.phone_number || '',
        fieldId: String(refund.field_id || ''),
        fieldName: refund.field_name || '',
        date: refund.reservation_date || '',
        startTime: refund.start_time || '',
        time: refund.start_time || '',
        refundAmount: parseFloat(refund.refund_amount) || 0,
        status: refund.status,
        reason: refund.cancellation_reason || '',
        cancelledAt: refund.cancelled_at,
        processedAt: refund.processed_at,
        processedBy: refund.processed_by,
        processedByName: refund.processed_by_name || '',
      }))

      set({ pendingRefunds: transformedRefunds })
      return transformedRefunds
    } catch (error) {
      set({ pendingRefunds: [] })
      return []
    }
  },

  /**
   * Marcar un reembolso como procesado en el backend
   * @param {string} refundId - ID del reembolso
   * @returns {Promise<boolean>} True si se procesó correctamente
   */
  markRefundAsProcessed: async (refundId) => {
    try {
      const token = useAuthStore.getState().token
      if (!token) throw new Error('No hay token de autenticación')

      await processRefundAPI(refundId, token)

      // Recargar reembolsos del backend
      const freshRefunds = await fetchRefunds({ status: 'pending' })
      const transformedRefunds = freshRefunds.map((refund) => ({
        id: String(refund.id),
        reservationId: String(refund.reservation_id || ''),
        customerId: refund.customer_id,
        customerName: refund.customer_name || 'Cliente',
        phoneNumber: refund.phone_number || '',
        fieldId: String(refund.field_id || ''),
        fieldName: refund.field_name || '',
        date: refund.reservation_date || '',
        startTime: refund.start_time || '',
        time: refund.start_time || '',
        refundAmount: parseFloat(refund.refund_amount) || 0,
        status: refund.status,
        reason: refund.cancellation_reason || '',
        cancelledAt: refund.cancelled_at,
        processedAt: refund.processed_at,
        processedBy: refund.processed_by,
        processedByName: refund.processed_by_name || '',
      }))

      set({ pendingRefunds: transformedRefunds })
      console.log('✅ [bookingStore] Reembolso procesado y lista actualizada')

      return true
    } catch (error) {
      console.error('❌ [bookingStore] Error procesando reembolso:', error)
      throw error
    }
  },

  /**
   * Obtener reembolsos pendientes del estado
   * @returns {Array} Array de reembolsos pendientes
   */
  getPendingRefunds: () => {
    return get().pendingRefunds
  },

  addReservation: (reservationData) => {
    const updatedReservations = addReservationHelper(get().existingReservations, reservationData)
    set({ existingReservations: updatedReservations })
    return true
  },
})
