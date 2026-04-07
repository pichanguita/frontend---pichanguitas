/**
 * COUPON SERVICE
 *
 * Servicio para gestionar cupones de descuento.
 * Maneja CRUD de cupones y validación de códigos.
 */

/**
 * Genera un código de cupón único
 * @returns {string} Código de cupón
 */
const generateCouponCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}

/**
 * Crea un nuevo cupón
 * @param {Object} couponData - Datos del cupón
 * @param {string} createdBy - ID del creador
 * @returns {Object} Cupón creado
 */
export const createCoupon = (couponData, createdBy) => {
  const newCoupon = {
    id: `coupon-${Date.now()}`,
    code: couponData.code || generateCouponCode(),
    name: couponData.name,
    description: couponData.description,
    type: couponData.type, // 'percentage' o 'fixed'
    value: couponData.value,
    minPurchase: couponData.minPurchase || 0,
    maxDiscount: couponData.maxDiscount || null,
    usageLimit: couponData.usageLimit || null,
    usedCount: 0,
    usedBy: [],
    validFrom: couponData.validFrom,
    validUntil: couponData.validUntil,
    applicableFields: couponData.applicableFields || null,
    isActive: true,
    createdBy,
    createdAt: new Date().toISOString(),
  }

  return newCoupon
}

/**
 * Actualiza un cupón
 * @param {Object} coupon - Cupón actual
 * @param {Object} updates - Datos a actualizar
 * @returns {Object} Cupón actualizado
 */
export const updateCoupon = (coupon, updates) => {
  return {
    ...coupon,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
}

/**
 * Marca un cupón como usado por un usuario
 * @param {Object} coupon - Cupón
 * @param {string} userId - ID del usuario
 * @returns {Object} Cupón actualizado
 */
export const markCouponAsUsed = (coupon, userId) => {
  return {
    ...coupon,
    usedCount: coupon.usedCount + 1,
    usedBy: [...(coupon.usedBy || []), userId],
    lastUsedAt: new Date().toISOString(),
  }
}

/**
 * Busca un cupón por código
 * @param {Array} coupons - Array de cupones
 * @param {string} code - Código del cupón
 * @returns {Object|null} Cupón encontrado
 */
export const findCouponByCode = (coupons, code) => {
  return coupons.find((c) => c.code.toUpperCase() === code.toUpperCase()) || null
}

/**
 * Filtra cupones activos
 * @param {Array} coupons - Array de cupones
 * @returns {Array} Cupones activos
 */
export const getActiveCoupons = (coupons) => {
  const now = new Date()
  return coupons.filter((c) => {
    if (!c.isActive) return false

    const validFrom = c.validFrom ? new Date(c.validFrom) : null
    const validUntil = c.validUntil ? new Date(c.validUntil) : null

    if (validFrom && now < validFrom) return false
    if (validUntil && now > validUntil) return false

    if (c.usageLimit && c.usedCount >= c.usageLimit) return false

    return true
  })
}

/**
 * Desactiva un cupón
 * @param {Object} coupon - Cupón
 * @returns {Object} Cupón desactivado
 */
export const deactivateCoupon = (coupon) => {
  return {
    ...coupon,
    isActive: false,
    deactivatedAt: new Date().toISOString(),
  }
}
