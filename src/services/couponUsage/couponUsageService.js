/**
 * COUPON USAGE SERVICE
 *
 * Servicio para operaciones de uso de cupones.
 * Maneja el historial y estadísticas de uso de cupones por clientes.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

// ==================== API CALLS ====================

/**
 * Obtener todos los usos de cupones desde el backend
 * @param {Object} filters - Filtros opcionales
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de usos de cupones
 */
export const fetchCouponUsage = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.coupon_id) queryParams.append('coupon_id', filters.coupon_id)
    if (filters.customer_id) queryParams.append('customer_id', filters.customer_id)
    if (filters.reservation_id) queryParams.append('reservation_id', filters.reservation_id)

    const url = `${API_CONFIG.COUPON_USAGE.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('🎫 Obteniendo usos de cupones')

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener usos de cupones')
    }

    console.log('✅ Usos de cupones obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener usos de cupones:', error)
    throw new Error(error.message || 'Error al obtener usos de cupones')
  }
}

/**
 * Obtener un uso de cupón por ID desde el backend
 * @param {string} usageId - ID del uso de cupón
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Uso de cupón
 */
export const fetchCouponUsageById = async (usageId, token) => {
  try {
    console.log('🎫 Obteniendo uso de cupón:', usageId)

    const response = await fetch(API_CONFIG.COUPON_USAGE.GET_BY_ID(usageId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener uso de cupón')
    }

    console.log('✅ Uso de cupón obtenido')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener uso de cupón:', error)
    throw new Error(error.message || 'Error al obtener uso de cupón')
  }
}

/**
 * Obtener usos de cupones de un cliente específico desde el backend
 * @param {string} customerId - ID del cliente
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de usos de cupones
 */
export const fetchCouponUsageByCustomer = async (customerId, token) => {
  try {
    console.log('🎫 Obteniendo usos de cupones del cliente:', customerId)

    const response = await fetch(API_CONFIG.COUPON_USAGE.GET_BY_CUSTOMER(customerId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener usos de cupones del cliente')
    }

    console.log('✅ Usos de cupones del cliente obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener usos de cupones del cliente:', error)
    throw new Error(error.message || 'Error al obtener usos de cupones del cliente')
  }
}

/**
 * Obtener estadísticas de uso de cupones desde el backend
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Estadísticas de uso de cupones
 */
export const fetchCouponUsageStatsAPI = async (token) => {
  try {
    console.log('🎫 Obteniendo estadísticas de uso de cupones')

    const response = await fetch(API_CONFIG.COUPON_USAGE.GET_STATS, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener estadísticas')
    }

    console.log('✅ Estadísticas obtenidas')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error)
    throw new Error(error.message || 'Error al obtener estadísticas')
  }
}

/**
 * Registrar uso de cupón en el backend
 * @param {Object} usageData - Datos del uso de cupón
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Uso de cupón creado
 */
export const createCouponUsageAPI = async (usageData, token) => {
  try {
    console.log('🎫 Registrando uso de cupón')

    const response = await fetch(API_CONFIG.COUPON_USAGE.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(usageData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar uso de cupón')
    }

    console.log('✅ Uso de cupón registrado:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al registrar uso de cupón:', error)
    throw new Error(error.message || 'Error al registrar uso de cupón')
  }
}

/**
 * Actualizar un uso de cupón en el backend
 * @param {string} usageId - ID del uso de cupón
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Uso de cupón actualizado
 */
export const updateCouponUsageAPI = async (usageId, updates, token) => {
  try {
    console.log('🎫 Actualizando uso de cupón:', usageId)

    const response = await fetch(API_CONFIG.COUPON_USAGE.UPDATE(usageId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar uso de cupón')
    }

    console.log('✅ Uso de cupón actualizado')

    return data.data
  } catch (error) {
    console.error('❌ Error al actualizar uso de cupón:', error)
    throw new Error(error.message || 'Error al actualizar uso de cupón')
  }
}

/**
 * Eliminar un uso de cupón en el backend
 * @param {string} usageId - ID del uso de cupón
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteCouponUsageAPI = async (usageId, token) => {
  try {
    console.log('🎫 Eliminando uso de cupón:', usageId)

    const response = await fetch(API_CONFIG.COUPON_USAGE.DELETE(usageId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar uso de cupón')
    }

    console.log('✅ Uso de cupón eliminado')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar uso de cupón:', error)
    throw new Error(error.message || 'Error al eliminar uso de cupón')
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Calcular total ahorrado por un cliente con cupones
 * @param {Array} couponUsages - Array de usos de cupones
 * @returns {number} Total ahorrado
 */
export const calculateTotalSaved = (couponUsages) => {
  return couponUsages.reduce((total, usage) => {
    return total + (usage.discount_amount || 0)
  }, 0)
}

/**
 * Obtener cupón más usado por un cliente
 * @param {Array} couponUsages - Array de usos de cupones
 * @returns {Object|null} Cupón más usado
 */
export const getMostUsedCoupon = (couponUsages) => {
  const couponCounts = {}

  couponUsages.forEach((usage) => {
    const couponCode = usage.coupon_code || usage.coupon_id
    couponCounts[couponCode] = (couponCounts[couponCode] || 0) + 1
  })

  const mostUsed = Object.entries(couponCounts).sort((a, b) => b[1] - a[1])[0]

  return mostUsed ? { code: mostUsed[0], count: mostUsed[1] } : null
}
