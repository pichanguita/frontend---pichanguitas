/**
 * COUPONS SERVICE
 * Servicio para operaciones CRUD de cupones.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Obtener todos los cupones desde el backend
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de cupones
 */
export const fetchCoupons = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active)
    if (filters.coupon_type) queryParams.append('coupon_type', filters.coupon_type)

    const url = `${API_CONFIG.COUPONS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('🎫 Obteniendo cupones:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener cupones')
    }

    console.log('✅ Cupones obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener cupones:', error)
    throw new Error(error.message || 'Error al obtener cupones')
  }
}

/**
 * Obtener un cupón por ID desde el backend
 * @param {string} couponId - ID del cupón
 * @returns {Promise<Object>} Cupón
 */
export const fetchCouponById = async (couponId) => {
  try {
    console.log('🎫 Obteniendo cupón:', couponId)

    const response = await fetch(API_CONFIG.COUPONS.GET_BY_ID(couponId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener cupón')
    }

    console.log('✅ Cupón obtenido:', data.data?.code)

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener cupón:', error)
    throw new Error(error.message || 'Error al obtener cupón')
  }
}

/**
 * Buscar un cupón por código desde el backend
 * @param {string} code - Código del cupón
 * @returns {Promise<Object|null>} Cupón o null si no existe
 */
export const fetchCouponByCode = async (code) => {
  try {
    console.log('🎫 Buscando cupón por código:', code)

    const response = await fetch(API_CONFIG.COUPONS.GET_BY_CODE(code), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (response.status === 404) {
      console.log('ℹ️ Cupón no encontrado')
      return null
    }

    if (!response.ok) {
      throw new Error(data.error || 'Error al buscar cupón')
    }

    console.log('✅ Cupón encontrado:', data.data?.code)

    return data.data
  } catch (error) {
    console.error('❌ Error al buscar cupón:', error)
    throw new Error(error.message || 'Error al buscar cupón')
  }
}

/**
 * Validar un cupón
 * @param {Object} validationData - { code, customer_id, field_id, total_price }
 * @returns {Promise<Object>} { valid, discount, message }
 */
export const validateCouponAPI = async (validationData) => {
  try {
    console.log('🎫 Validando cupón:', validationData.code)

    const response = await fetch(API_CONFIG.COUPONS.VALIDATE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(validationData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al validar cupón')
    }

    console.log('✅ Cupón validado:', data.valid ? 'Válido' : 'Inválido')

    return data.data || data
  } catch (error) {
    console.error('❌ Error al validar cupón:', error)
    throw new Error(error.message || 'Error al validar cupón')
  }
}

/**
 * Crear un nuevo cupón en el backend
 * @param {Object} couponData - Datos del cupón
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Cupón creado
 */
export const createCouponAPI = async (couponData, token) => {
  try {
    console.log('🎫 Creando cupón:', couponData.code)

    const response = await fetch(API_CONFIG.COUPONS.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(couponData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear cupón')
    }

    console.log('✅ Cupón creado:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al crear cupón:', error)
    throw new Error(error.message || 'Error al crear cupón')
  }
}

/**
 * Actualizar un cupón en el backend
 * @param {string} couponId - ID del cupón
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Cupón actualizado
 */
export const updateCouponAPI = async (couponId, updates, token) => {
  try {
    console.log('🎫 Actualizando cupón:', couponId)

    const response = await fetch(API_CONFIG.COUPONS.UPDATE(couponId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar cupón')
    }

    console.log('✅ Cupón actualizado:', data.data?.code)

    return data.data
  } catch (error) {
    console.error('❌ Error al actualizar cupón:', error)
    throw new Error(error.message || 'Error al actualizar cupón')
  }
}

/**
 * Eliminar un cupón (soft delete) en el backend
 * @param {string} couponId - ID del cupón
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteCouponAPI = async (couponId, token) => {
  try {
    console.log('🎫 Eliminando cupón:', couponId)

    const response = await fetch(API_CONFIG.COUPONS.DELETE(couponId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar cupón')
    }

    console.log('✅ Cupón eliminado')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar cupón:', error)
    throw new Error(error.message || 'Error al eliminar cupón')
  }
}

/**
 * Obtener estadísticas de cupones desde el backend
 * @param {string} couponId - ID del cupón (opcional, si se omite devuelve estadísticas generales)
 * @returns {Promise<Object>} Estadísticas de cupones
 */
export const fetchCouponStatsAPI = async (couponId = null) => {
  try {
    console.log(
      '🎫 Obteniendo estadísticas de cupones',
      couponId ? `para cupón: ${couponId}` : '(generales)'
    )

    const response = await fetch(API_CONFIG.COUPONS.GET_STATS(couponId), {
      method: 'GET',
      headers: getAuthHeaders(),
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
