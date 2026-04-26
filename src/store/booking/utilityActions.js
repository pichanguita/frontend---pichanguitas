/**
 * Módulo: Acciones de Utilidad
 *
 * Funciones auxiliares: reset, queries, payment methods
 */

import useGeographyStore from '../modules/geographyStore'
import useCouponStore from '../modules/couponStore'
import usePricingStore from '../modules/pricingStore'
import { filterReservations } from '../../utils/booking-store/reservationQueriesHelpers'
import {
  getFieldPaymentMethods,
  AVAILABLE_PAYMENT_METHODS,
} from '../../services/fieldPaymentMethods/fieldPaymentMethodsService'
import { fetchMyFreeHours } from '../../services/customers/customersService'

export const createUtilityActions = (set, get) => ({
  // ==================== PAYMENT METHODS ====================

  /**
   * Carga los métodos de pago configurados para una cancha específica
   * @param {number} fieldId - ID de la cancha
   */
  loadFieldPaymentMethods: async (fieldId) => {
    try {
      const methods = await getFieldPaymentMethods(fieldId)

      if (methods && methods.length > 0) {
        // Combinar datos de la BD con la configuración base
        const configuredMethods = methods
          .filter((m) => m.is_enabled)
          .map((dbMethod) => {
            // Encontrar la configuración base del método
            const baseMethod = AVAILABLE_PAYMENT_METHODS.find((m) => m.id === dbMethod.method_type)

            // Si no existe baseMethod válido, retornar null para filtrar después
            if (!baseMethod) {
              console.warn(`Método de pago inválido: ${dbMethod.method_type}`)
              return null
            }

            return {
              ...baseMethod,
              id: dbMethod.method_type,
              accountNumber: dbMethod.phone_number || dbMethod.account_number || '',
              accountHolder: dbMethod.account_holder || '',
              bankName: dbMethod.bank_name || baseMethod.name || '',
              cciNumber: dbMethod.cci_number || '',
              instructions: dbMethod.instructions || baseMethod.description || '',
              qrImageUrl: dbMethod.qr_image_url || null, // URL del QR subido por el admin
              qrData: {
                phone: dbMethod.phone_number || '',
                name: dbMethod.account_holder || '',
              },
            }
          })
          .filter(Boolean) // Filtrar métodos inválidos (null)

        // Agregar Efectivo siempre al final (hardcodeado)
        const efectivoMethod = {
          id: 'efectivo',
          name: 'Efectivo',
          description: 'Pago en efectivo al llegar',
          hasQR: false,
          requiresVoucher: false,
          icon: '💵',
          color: '#22c55e',
        }
        configuredMethods.push(efectivoMethod)

        set({ paymentMethods: configuredMethods })
        return configuredMethods
      } else {
        // Si no hay métodos configurados, solo mostrar Efectivo
        const efectivoOnly = [
          {
            id: 'efectivo',
            name: 'Efectivo',
            description: 'Pago en efectivo al llegar',
            hasQR: false,
            requiresVoucher: false,
            icon: '💵',
            color: '#22c55e',
          },
        ]
        set({ paymentMethods: efectivoOnly })
        return efectivoOnly
      }
    } catch (error) {
      console.error('Error cargando métodos de pago:', error)
      set({ paymentMethods: [] })
      return []
    }
  },

  // ==================== FREE HOURS (LOYALTY) ====================

  /**
   * Carga las horas gratis acumuladas del cliente autenticado y las guarda en el store.
   * Llamar al iniciar sesión y después de cada operación que las modifique
   * (canjear promoción, crear reserva con free_hours_used, cancelar reserva).
   * @returns {Promise<number>} availableFreeHours
   */
  loadMyFreeHours: async () => {
    const { availableFreeHours: prev } = get()
    try {
      const data = await fetchMyFreeHours()
      const next = parseFloat(data?.availableFreeHours) || 0
      set({ availableFreeHours: next })
      return next
    } catch {
      return prev
    }
  },

  updatePaymentMethod: (methodId, updatedData) => {
    const { paymentMethods } = get()
    const updatedMethods = paymentMethods.map((method) =>
      method.id === methodId ? { ...method, ...updatedData } : method
    )
    set({ paymentMethods: updatedMethods })
    return true
  },

  getPaymentMethodSettings: () => {
    return get().paymentMethods
  },

  // ==================== RESET ====================

  resetBooking: () => {
    // También resetear geographyStore y couponStore
    useGeographyStore.getState().resetSelection()
    useCouponStore.getState().removeCoupon()

    set({
      selectedField: null,
      selectedDate: '',
      selectedTimeSlots: [],
      selectedTimeRanges: [],
      phoneNumber: '',
      paymentMethod: '',
      paymentVoucher: null,
      reservationSummary: null,
      freeHoursToUse: 0, // Resetear horas gratis
      availableTimes: [],
      availableFields: [],
      selectedSportTypes: [],
      // Resetear ubicaciones (estado local sincronizado)
      selectedDepartment: '',
      selectedProvince: '',
      selectedDistrict: '',
    })
  },

  // ==================== QUERIES ====================

  getReservations: (filters = {}) => {
    return filterReservations(get().existingReservations, filters)
  },

  generateReservationSummary: () => {
    const { selectedField, selectedDate, selectedTimeRanges, phoneNumber, timeRanges } = get()

    // Validar datos requeridos
    if (!selectedField || !selectedDate || !selectedTimeRanges.length || !phoneNumber) {
      return null
    }

    const firstTimeRange = timeRanges.find((tr) => tr.id === selectedTimeRanges[0])
    const totalHours = selectedTimeRanges.length

    // Generar los time slots legibles (ej: "08:00 - 09:00")
    const timeSlots = selectedTimeRanges.map((rangeId) => {
      const range = timeRanges.find((tr) => tr.id === rangeId)
      return range ? `${range.startTime} - ${range.endTime}` : rangeId
    })

    // Calcular precio con descuentos especiales
    const pricingResult = usePricingStore
      .getState()
      .calculatePriceWithDiscount(selectedField, selectedDate, selectedTimeRanges)

    const summary = {
      id: Date.now().toString(),
      field: selectedField,
      date: selectedDate,
      timeRange: firstTimeRange,
      timeSlots,
      totalHours,
      phoneNumber,
      totalAmount: pricingResult.finalPrice,
      originalAmount: pricingResult.originalPrice,
      discountAmount: pricingResult.discount,
      appliedDiscounts: pricingResult.appliedDiscounts,
      createdAt: new Date().toISOString(),
    }

    if (summary) {
      set({ reservationSummary: summary })
    }

    return summary
  },
})
