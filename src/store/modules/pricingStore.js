import { create } from 'zustand'
import { parseLocalDate } from '../../utils/dateFormatters'

/**
 * Pricing Store
 * Maneja todos los cálculos de precios, descuentos especiales y pricing dinámico
 */
const usePricingStore = create((set, get) => ({
  /**
   * Calcular precio con descuentos especiales de la cancha
   * @param {Object} field - Objeto de la cancha
   * @param {string} date - Fecha de la reserva
   * @param {Array} timeSlotIds - Array de IDs de slots de tiempo
   * @returns {Object} { originalPrice, finalPrice, discount, appliedDiscounts }
   */
  calculatePriceWithDiscount: (field, date, timeSlotIds) => {
    if (!field || !date || !timeSlotIds || timeSlotIds.length === 0) {
      return {
        originalPrice: 0,
        finalPrice: 0,
        discount: 0,
        appliedDiscounts: [],
      }
    }

    const basePrice = field.pricePerHour
    const originalPrice = basePrice * timeSlotIds.length

    // Si no hay descuentos configurados, retornar precio original
    if (!field.specialPricing || field.specialPricing.length === 0) {
      return {
        originalPrice,
        finalPrice: originalPrice,
        discount: 0,
        appliedDiscounts: [],
      }
    }

    // Obtener día de la semana de la fecha
    // IMPORTANTE: Usar 'T12:00:00' para evitar problemas de timezone
    const dateObj = new Date(date + 'T12:00:00')
    const dayOfWeek = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ][dateObj.getDay()]

    let totalDiscount = 0
    const appliedDiscounts = []

    // Revisar cada configuración de descuento
    field.specialPricing.forEach((pricing) => {
      // Verificar si el descuento aplica para este día
      const appliesToDay =
        !pricing.daysOfWeek ||
        pricing.daysOfWeek.length === 0 ||
        pricing.daysOfWeek.includes(dayOfWeek)

      if (!appliesToDay) return

      // Verificar qué horarios de la reserva coinciden con el descuento
      const matchingSlots = timeSlotIds.filter(
        (slotId) =>
          !pricing.timeSlots || pricing.timeSlots.length === 0 || pricing.timeSlots.includes(slotId)
      )

      if (matchingSlots.length > 0) {
        const slotsWithDiscount = matchingSlots.length
        const priceForTheseSlots = basePrice * slotsWithDiscount

        let discountAmount = 0

        if (pricing.discountType === 'percentage') {
          discountAmount = priceForTheseSlots * ((pricing.discountValue || 0) / 100)
        } else if (pricing.discountType === 'amount') {
          discountAmount = (pricing.discountValue || 0) * slotsWithDiscount
        }

        totalDiscount += discountAmount

        appliedDiscounts.push({
          name: pricing.name || 'Descuento',
          type: pricing.discountType,
          value: pricing.discountValue,
          slotsAffected: slotsWithDiscount,
          discountAmount,
        })
      }
    })

    const finalPrice = Math.max(0, originalPrice - totalDiscount)

    return {
      originalPrice,
      finalPrice,
      discount: totalDiscount,
      appliedDiscounts,
    }
  },

  /**
   * Obtener precio especial basado en horario y día
   * @param {Object} field - Objeto de la cancha
   * @param {string} date - Fecha de la reserva
   * @param {string} timeSlotId - ID del slot de tiempo
   * @returns {Object|null} Precio especial o null
   */
  getSpecialPrice: (field, date, timeSlotId) => {
    if (!field || !field.specialPricing || !date || !timeSlotId) {
      return null
    }

    // Obtener día de la semana
    const dayOfWeek = parseLocalDate(date)
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase()

    // Buscar si hay un precio especial que aplique
    const specialPrice = field.specialPricing.find((sp) => {
      // Verificar si el día coincide (si no hay días especificados, aplica a todos)
      const dayMatches =
        !sp.daysOfWeek || sp.daysOfWeek.length === 0 || sp.daysOfWeek.includes(dayOfWeek)
      if (!dayMatches) return false

      // Verificar si el horario coincide (si no hay slots especificados, aplica a todos)
      const timeMatches =
        !sp.timeSlots || sp.timeSlots.length === 0 || sp.timeSlots.includes(timeSlotId)
      return timeMatches
    })

    return specialPrice || null
  },

  /**
   * Calcular precio total considerando precios especiales
   * @param {Object} field - Objeto de la cancha
   * @param {string} date - Fecha de la reserva
   * @param {Array} timeRanges - Array de IDs de rangos de tiempo
   * @returns {Object} { total, breakdown, hasSpecialPricing }
   */
  calculateTotalPrice: (field, date, timeRanges) => {
    if (!field || !timeRanges || timeRanges.length === 0) {
      return { total: 0, breakdown: [], hasSpecialPricing: false }
    }

    const { getSpecialPrice } = get()
    let total = 0
    const breakdown = []
    let hasSpecialPricing = false

    timeRanges.forEach((timeRange) => {
      const special = getSpecialPrice(field, date, timeRange)
      const price = special ? special.price : field.pricePerHour

      if (special) hasSpecialPricing = true

      breakdown.push({
        timeRange,
        price,
        isSpecial: !!special,
        specialPricingName: special?.name || null,
      })

      total += price
    })

    return { total, breakdown, hasSpecialPricing }
  },

  /**
   * Calcular precio final con cupón aplicado
   * @param {number} subtotal - Subtotal antes del cupón
   * @param {Object} coupon - Cupón aplicado
   * @returns {Object} { finalPrice, discount, subtotal }
   */
  calculatePriceWithCoupon: (subtotal, coupon) => {
    if (!coupon) {
      return {
        subtotal,
        discount: 0,
        finalPrice: subtotal,
      }
    }

    let discount = 0

    if (coupon.type === 'percentage') {
      discount = (subtotal * coupon.value) / 100
    } else if (coupon.type === 'fixed') {
      discount = Math.min(coupon.value, subtotal)
    }

    const finalPrice = Math.max(0, subtotal - discount)

    return {
      subtotal,
      discount,
      finalPrice,
      couponApplied: coupon.code,
    }
  },

  /**
   * Calcular adelanto (anticipo) requerido
   * @param {number} totalAmount - Monto total
   * @param {number} advancePercentage - Porcentaje de adelanto (default 30%)
   * @returns {Object} { advanceAmount, remainingAmount, percentage }
   */
  calculateAdvancePayment: (totalAmount, advancePercentage = 30) => {
    const advanceAmount = (totalAmount * advancePercentage) / 100
    const remainingAmount = totalAmount - advanceAmount

    return {
      advanceAmount: Math.round(advanceAmount * 100) / 100,
      remainingAmount: Math.round(remainingAmount * 100) / 100,
      percentage: advancePercentage,
      totalAmount,
    }
  },

  /**
   * Calcular reembolso basado en política de cancelación
   * @param {number} totalPaid - Monto total pagado
   * @param {Object} cancellationPolicy - Política de cancelación
   * @param {number} hoursUntilEvent - Horas hasta el evento
   * @returns {Object} { refundAmount, refundPercentage, fee }
   */
  calculateRefund: (totalPaid, cancellationPolicy, hoursUntilEvent) => {
    if (!cancellationPolicy || !cancellationPolicy.allowCancellation) {
      return {
        refundAmount: 0,
        refundPercentage: 0,
        fee: totalPaid,
        canRefund: false,
      }
    }

    // Verificar si está dentro del tiempo permitido
    if (hoursUntilEvent < cancellationPolicy.hoursBeforeEvent) {
      return {
        refundAmount: 0,
        refundPercentage: 0,
        fee: totalPaid,
        canRefund: false,
        reason: `Debe cancelar con al menos ${cancellationPolicy.hoursBeforeEvent} horas de anticipación`,
      }
    }

    const refundPercentage = cancellationPolicy.refundPercentage || 0
    const refundAmount = (totalPaid * refundPercentage) / 100
    const fee = totalPaid - refundAmount

    return {
      refundAmount: Math.round(refundAmount * 100) / 100,
      refundPercentage,
      fee: Math.round(fee * 100) / 100,
      canRefund: true,
    }
  },

  /**
   * Formatear precio a moneda peruana (Soles)
   * @param {number} amount - Monto
   * @returns {string} Precio formateado (S/ XX.XX)
   */
  formatPrice: (amount) => {
    if (typeof amount !== 'number') return 'S/ 0.00'
    return `S/ ${amount.toFixed(2)}`
  },

  /**
   * Calcular descuento porcentual
   * @param {number} originalPrice - Precio original
   * @param {number} discountedPrice - Precio con descuento
   * @returns {number} Porcentaje de descuento
   */
  calculateDiscountPercentage: (originalPrice, discountedPrice) => {
    if (!originalPrice || originalPrice === 0) return 0
    const discount = ((originalPrice - discountedPrice) / originalPrice) * 100
    return Math.round(discount)
  },

  /**
   * Verificar si un descuento es válido para fecha y hora específica
   * @param {Object} discount - Objeto de descuento
   * @param {string} date - Fecha
   * @param {string} timeSlotId - ID del slot de tiempo
   * @returns {boolean} True si aplica
   */
  isDiscountApplicable: (discount, date, timeSlotId) => {
    if (!discount || !discount.isActive) return false

    // Verificar fecha - usar T12:00:00 para evitar problemas de timezone
    const dateObj = new Date(date + 'T12:00:00')
    const dayOfWeek = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ][dateObj.getDay()]

    const appliesToDay =
      !discount.daysOfWeek ||
      discount.daysOfWeek.length === 0 ||
      discount.daysOfWeek.includes(dayOfWeek)
    if (!appliesToDay) return false

    // Verificar horario
    const appliesToTime =
      !discount.timeSlots ||
      discount.timeSlots.length === 0 ||
      discount.timeSlots.includes(timeSlotId)
    return appliesToTime
  },

  /**
   * Obtener resumen completo de pricing para una reserva
   * @param {Object} field - Cancha
   * @param {string} date - Fecha
   * @param {Array} timeSlotIds - Slots de tiempo
   * @param {Object} coupon - Cupón aplicado (opcional)
   * @returns {Object} Resumen completo de precios
   */
  getPricingSummary: (field, date, timeSlotIds, coupon = null) => {
    const { calculatePriceWithDiscount, calculatePriceWithCoupon } = get()

    // Calcular precio base con descuentos de la cancha
    const fieldPricing = calculatePriceWithDiscount(field, date, timeSlotIds)

    // Aplicar cupón si existe
    const finalPricing = calculatePriceWithCoupon(fieldPricing.finalPrice, coupon)

    return {
      basePrice: fieldPricing.originalPrice,
      fieldDiscounts: fieldPricing.appliedDiscounts,
      fieldDiscountAmount: fieldPricing.discount,
      subtotal: fieldPricing.finalPrice,
      couponDiscount: finalPricing.discount,
      couponCode: coupon?.code || null,
      finalTotal: finalPricing.finalPrice,
      totalSavings: fieldPricing.originalPrice - finalPricing.finalPrice,
      currency: 'PEN',
    }
  },
}))

export default usePricingStore
