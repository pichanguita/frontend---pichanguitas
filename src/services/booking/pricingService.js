/**
 * PRICING SERVICE
 *
 * Servicio para cálculos de precios, descuentos y cupones.
 * Maneja la lógica de precios especiales, descuentos por horario/día y cupones.
 */

/**
 * Calcula el precio con descuentos aplicados
 * @param {Object} field - Cancha
 * @param {string} date - Fecha en formato YYYY-MM-DD
 * @param {Array} timeSlotIds - Array de IDs de slots de tiempo
 * @returns {Object} { originalPrice, finalPrice, discount, appliedDiscounts }
 */
export const calculatePriceWithDiscount = (field, date, timeSlotIds) => {
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
  // Sin esto, '2026-01-31' se interpreta como medianoche UTC, que en Perú (UTC-5) es el día anterior
  const dateObj = new Date(date + 'T12:00:00')
  const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
    dateObj.getDay()
  ]

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
        // Descuento por porcentaje
        discountAmount = priceForTheseSlots * ((pricing.discountValue || 0) / 100)
      } else if (pricing.discountType === 'amount') {
        // Descuento por monto fijo
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
}

/**
 * Valida y aplica un cupón de descuento
 * @param {Object} coupon - Cupón a validar
 * @param {number} totalPrice - Precio total de la reserva
 * @param {string} date - Fecha de la reserva
 * @param {string} userId - ID del usuario (opcional)
 * @returns {Object} { valid, discount, message }
 */
export const applyCoupon = (coupon, totalPrice, date, userId = null) => {
  // Validar que el cupón existe
  if (!coupon) {
    return { valid: false, discount: 0, message: 'Cupón no encontrado' }
  }

  // Validar que el cupón está activo
  if (!coupon.isActive) {
    return { valid: false, discount: 0, message: 'Este cupón no está activo' }
  }

  // Validar fechas de vigencia
  // IMPORTANTE: Usar 'T12:00:00' para evitar problemas de timezone
  const today = new Date(date + 'T12:00:00')
  const validFrom = coupon.validFrom ? new Date(coupon.validFrom + 'T00:00:00') : null
  const validUntil = coupon.validUntil ? new Date(coupon.validUntil + 'T23:59:59') : null

  if (validFrom && today < validFrom) {
    return { valid: false, discount: 0, message: 'Este cupón aún no es válido' }
  }

  if (validUntil && today > validUntil) {
    return { valid: false, discount: 0, message: 'Este cupón ha expirado' }
  }

  // Validar límite de uso
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, message: 'Este cupón ha alcanzado su límite de uso' }
  }

  // Validar uso por usuario (si aplica)
  if (userId && coupon.usedBy && coupon.usedBy.includes(userId)) {
    return { valid: false, discount: 0, message: 'Ya has usado este cupón anteriormente' }
  }

  // Validar compra mínima
  if (coupon.minPurchase && totalPrice < coupon.minPurchase) {
    return {
      valid: false,
      discount: 0,
      message: `Compra mínima de S/ ${coupon.minPurchase} requerida`,
    }
  }

  // Calcular descuento
  let discount = 0

  if (coupon.type === 'percentage') {
    discount = totalPrice * (coupon.value / 100)

    // Aplicar descuento máximo si existe
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount
    }
  } else if (coupon.type === 'fixed' || coupon.type === 'amount') {
    discount = coupon.value
  }

  // El descuento no puede ser mayor que el precio total
  discount = Math.min(discount, totalPrice)

  return {
    valid: true,
    discount,
    message: `Cupón aplicado: ${coupon.name}`,
    coupon,
  }
}

/**
 * Calcula el precio final con cupón aplicado
 * @param {number} originalPrice - Precio original
 * @param {Object} couponResult - Resultado de applyCoupon
 * @returns {Object} { finalPrice, totalDiscount, savings }
 */
export const calculateFinalPriceWithCoupon = (originalPrice, couponResult) => {
  if (!couponResult.valid) {
    return {
      finalPrice: originalPrice,
      totalDiscount: 0,
      savings: 0,
    }
  }

  const finalPrice = Math.max(0, originalPrice - couponResult.discount)

  return {
    finalPrice,
    totalDiscount: couponResult.discount,
    savings: originalPrice - finalPrice,
  }
}

/**
 * Formatea un precio a formato de moneda
 * @param {number} price - Precio
 * @param {string} currency - Moneda (default: 'PEN')
 * @returns {string} Precio formateado
 */
export const formatPrice = (price, currency = 'PEN') => {
  const symbol = currency === 'PEN' ? 'S/' : '$'
  return `${symbol} ${price.toFixed(2)}`
}

/**
 * Calcula el porcentaje de descuento
 * @param {number} originalPrice - Precio original
 * @param {number} discount - Descuento aplicado
 * @returns {number} Porcentaje de descuento
 */
export const calculateDiscountPercentage = (originalPrice, discount) => {
  if (originalPrice === 0) return 0
  return Math.round((discount / originalPrice) * 100)
}
