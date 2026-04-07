import { create } from 'zustand'
import {
  fetchCoupons,
  fetchCouponById,
  fetchCouponByCode,
  validateCouponAPI,
  createCouponAPI,
  updateCouponAPI,
  deleteCouponAPI,
} from '../../services/coupons/couponsService'
import useAuthStore from '../authStore'

/**
 * Coupon Store
 * Maneja el sistema de cupones de descuento
 * INTEGRADO CON BACKEND
 */
const useCouponStore = create((set, get) => ({
  // Array de cupones disponibles
  coupons: [],

  // Cupón aplicado actualmente en el flujo de reserva
  appliedCoupon: null,

  // Estado de carga
  isLoading: false,
  error: null,

  // ==================== API FUNCTIONS ====================

  /**
   * Cargar cupones desde el backend
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Array de cupones
   */
  loadCoupons: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const coupons = await fetchCoupons(filters)
      set({ coupons, isLoading: false })
      return coupons
    } catch (error) {
      set({ error: error.message, isLoading: false })
      console.error('Error cargando cupones:', error)
      return []
    }
  },

  /**
   * Obtener cupón por ID desde el backend
   * @param {string} couponId - ID del cupón
   * @returns {Promise<Object|null>} Cupón o null
   */
  getCouponByIdAPI: async (couponId) => {
    try {
      return await fetchCouponById(couponId)
    } catch (error) {
      console.error('Error obteniendo cupón:', error)
      return null
    }
  },

  /**
   * Buscar cupón por código desde el backend
   * @param {string} code - Código del cupón
   * @returns {Promise<Object|null>} Cupón o null
   */
  getCouponByCodeAPI: async (code) => {
    try {
      return await fetchCouponByCode(code)
    } catch (error) {
      console.error('Error buscando cupón:', error)
      return null
    }
  },

  /**
   * Validar cupón con la API del backend
   * @param {Object} validationData - { code, customer_id, field_id, total_price }
   * @returns {Promise<Object>} { valid, discount, message }
   */
  validateCouponWithAPI: async (validationData) => {
    try {
      return await validateCouponAPI(validationData)
    } catch (error) {
      console.error('Error validando cupón:', error)
      return { valid: false, error: error.message }
    }
  },

  /**
   * Crear cupón en el backend
   * @param {Object} couponData - Datos del cupón
   * @returns {Promise<Object>} Cupón creado
   */
  createCouponAPI: async (couponData) => {
    set({ isLoading: true, error: null })
    try {
      const token = useAuthStore.getState().token
      if (!token) throw new Error('No hay token de autenticación')

      const newCoupon = await createCouponAPI(couponData, token)
      set((state) => ({
        coupons: [...state.coupons, newCoupon],
        isLoading: false,
      }))
      return newCoupon
    } catch (error) {
      set({ error: error.message, isLoading: false })
      console.error('Error creando cupón:', error)
      throw error
    }
  },

  /**
   * Actualizar cupón en el backend
   * @param {string} couponId - ID del cupón
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise<Object>} Cupón actualizado
   */
  updateCouponAPI: async (couponId, updates) => {
    set({ isLoading: true, error: null })
    try {
      const token = useAuthStore.getState().token
      if (!token) throw new Error('No hay token de autenticación')

      const updatedCoupon = await updateCouponAPI(couponId, updates, token)
      set((state) => ({
        coupons: state.coupons.map((c) => (c.id === couponId ? updatedCoupon : c)),
        isLoading: false,
      }))
      return updatedCoupon
    } catch (error) {
      set({ error: error.message, isLoading: false })
      console.error('Error actualizando cupón:', error)
      throw error
    }
  },

  /**
   * Eliminar cupón en el backend
   * @param {string} couponId - ID del cupón
   * @returns {Promise<boolean>} True si se eliminó
   */
  deleteCouponAPI: async (couponId) => {
    set({ isLoading: true, error: null })
    try {
      const token = useAuthStore.getState().token
      if (!token) throw new Error('No hay token de autenticación')

      await deleteCouponAPI(couponId, token)
      set((state) => ({
        coupons: state.coupons.filter((c) => c.id !== couponId),
        isLoading: false,
      }))
      return true
    } catch (error) {
      set({ error: error.message, isLoading: false })
      console.error('Error eliminando cupón:', error)
      throw error
    }
  },

  // ==================== LOCAL FUNCTIONS (LEGACY) ====================

  /**
   * Validar cupón de descuento (local)
   * @param {string} code - Código del cupón
   * @param {string} userId - ID del usuario (opcional)
   * @param {number} subtotal - Subtotal de la reserva
   * @returns {Object} { valid, error, coupon }
   */
  validateCoupon: (code, userId, subtotal) => {
    const { coupons } = get()

    if (!code || !code.trim()) {
      return { valid: false, error: 'Ingresa un código de cupón' }
    }

    const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase())

    if (!coupon) {
      return { valid: false, error: 'Código inválido' }
    }

    if (!coupon.isActive) {
      return { valid: false, error: 'Este cupón ya no está disponible' }
    }

    // Verificar fechas de validez
    const today = new Date()
    const validFrom = new Date(coupon.validFrom)
    const validUntil = new Date(coupon.validUntil)

    if (today < validFrom || today > validUntil) {
      return { valid: false, error: 'Este cupón ha expirado' }
    }

    // Verificar límite de uso
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'Este cupón ha alcanzado su límite de uso' }
    }

    // Verificar si el usuario ya lo usó
    if (userId && coupon.usedBy && coupon.usedBy.includes(userId)) {
      return { valid: false, error: 'Ya has usado este cupón anteriormente' }
    }

    // Verificar compra mínima
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      return {
        valid: false,
        error: `Este cupón requiere una compra mínima de S/ ${coupon.minPurchase}`,
      }
    }

    return { valid: true, coupon }
  },

  /**
   * Aplicar cupón
   * @param {string} code - Código del cupón
   * @param {string} userId - ID del usuario
   * @param {number} subtotal - Subtotal de la reserva
   * @returns {Object} { valid, error, coupon }
   */
  applyCoupon: (code, userId, subtotal) => {
    const validation = get().validateCoupon(code, userId, subtotal)

    if (!validation.valid) {
      return validation
    }

    set({ appliedCoupon: validation.coupon })
    return { valid: true, coupon: validation.coupon }
  },

  /**
   * Quitar cupón aplicado
   */
  removeCoupon: () => {
    set({ appliedCoupon: null })
  },

  /**
   * Calcular descuento del cupón
   * @param {number} subtotal - Subtotal de la reserva
   * @returns {number} Monto del descuento
   */
  calculateCouponDiscount: (subtotal) => {
    const { appliedCoupon } = get()

    if (!appliedCoupon) return 0

    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.value) / 100
    } else if (appliedCoupon.type === 'fixed') {
      return Math.min(appliedCoupon.value, subtotal) // No puede ser mayor al subtotal
    }

    return 0
  },

  /**
   * Marcar cupón como usado
   * @param {string} couponId - ID del cupón
   * @param {string} userId - ID del usuario
   * @returns {boolean} True si se marcó correctamente
   */
  markCouponAsUsed: (couponId, userId) => {
    const { coupons } = get()

    const updatedCoupons = coupons.map((c) => {
      if (c.id === couponId) {
        return {
          ...c,
          usedCount: (c.usedCount || 0) + 1,
          usedBy:
            userId && c.usedBy && !c.usedBy.includes(userId)
              ? [...c.usedBy, userId]
              : c.usedBy || [],
        }
      }
      return c
    })

    set({ coupons: updatedCoupons })
    return true
  },

  /**
   * Obtener cupón aplicado actualmente
   * @returns {Object|null} Cupón aplicado o null
   */
  getAppliedCoupon: () => {
    return get().appliedCoupon
  },

  /**
   * Obtener todos los cupones activos
   * @returns {Array} Array de cupones activos
   */
  getActiveCoupons: () => {
    const { coupons } = get()
    const now = new Date()

    return coupons.filter((coupon) => {
      if (!coupon.isActive) return false

      const validFrom = new Date(coupon.validFrom)
      const validUntil = new Date(coupon.validUntil)

      if (now < validFrom || now > validUntil) return false

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return false

      return true
    })
  },

  /**
   * Admin: Crear nuevo cupón
   * @param {Object} couponData - Datos del cupón
   * @returns {Object} Cupón creado
   */
  createCoupon: (couponData) => {
    const { coupons } = get()

    const newCoupon = {
      id: `coupon-${Date.now()}`,
      code: couponData.code.toUpperCase(),
      type: couponData.type, // 'percentage' o 'fixed'
      value: couponData.value,
      description: couponData.description || '',
      minPurchase: couponData.minPurchase || 0,
      validFrom: couponData.validFrom,
      validUntil: couponData.validUntil,
      usageLimit: couponData.usageLimit || null,
      usedCount: 0,
      usedBy: [],
      isActive: couponData.isActive !== false,
      createdAt: new Date().toISOString(),
    }

    set({ coupons: [...coupons, newCoupon] })
    return newCoupon
  },

  /**
   * Admin: Actualizar cupón
   * @param {string} couponId - ID del cupón
   * @param {Object} updates - Datos a actualizar
   * @returns {boolean} True si se actualizó
   */
  updateCoupon: (couponId, updates) => {
    const { coupons } = get()

    const updatedCoupons = coupons.map((c) => (c.id === couponId ? { ...c, ...updates } : c))

    set({ coupons: updatedCoupons })
    return true
  },

  /**
   * Admin: Eliminar cupón
   * @param {string} couponId - ID del cupón
   * @returns {boolean} True si se eliminó
   */
  deleteCoupon: (couponId) => {
    const { coupons } = get()
    set({ coupons: coupons.filter((c) => c.id !== couponId) })
    return true
  },

  /**
   * Admin: Activar/desactivar cupón
   * @param {string} couponId - ID del cupón
   * @returns {boolean} True si se cambió el estado
   */
  toggleCouponStatus: (couponId) => {
    const { coupons } = get()

    const updatedCoupons = coupons.map((c) =>
      c.id === couponId ? { ...c, isActive: !c.isActive } : c
    )

    set({ coupons: updatedCoupons })
    return true
  },

  /**
   * Obtener estadísticas de cupones
   * @returns {Object} Estadísticas
   */
  getCouponStats: () => {
    const { coupons } = get()
    const now = new Date()

    const total = coupons.length
    const active = coupons.filter((c) => {
      if (!c.isActive) return false
      const validFrom = new Date(c.validFrom)
      const validUntil = new Date(c.validUntil)
      return now >= validFrom && now <= validUntil
    }).length

    const expired = coupons.filter((c) => {
      const validUntil = new Date(c.validUntil)
      return now > validUntil
    }).length

    const totalUsed = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0)

    return {
      total,
      active,
      expired,
      inactive: total - active - expired,
      totalUsed,
    }
  },

  /**
   * Obtener cupón por código
   * @param {string} code - Código del cupón
   * @returns {Object|null} Cupón o null
   */
  getCouponByCode: (code) => {
    const { coupons } = get()
    return coupons.find((c) => c.code.toUpperCase() === code.toUpperCase()) || null
  },

  /**
   * Verificar si usuario puede usar un cupón específico
   * @param {string} couponId - ID del cupón
   * @param {string} userId - ID del usuario
   * @returns {boolean} True si puede usarlo
   */
  canUserUseCoupon: (couponId, userId) => {
    const { coupons } = get()
    const coupon = coupons.find((c) => c.id === couponId)

    if (!coupon || !coupon.isActive) return false
    if (userId && coupon.usedBy && coupon.usedBy.includes(userId)) return false

    return true
  },
}))

export default useCouponStore
