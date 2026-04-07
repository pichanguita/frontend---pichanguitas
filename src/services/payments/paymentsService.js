/**
 * PAYMENTS SERVICE
 * Servicio para operaciones de pagos y mensualidades.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Obtener todos los pagos desde el backend
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de pagos
 */
export const fetchPayments = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.reservation_id) queryParams.append('reservation_id', filters.reservation_id)
    if (filters.customer_id) queryParams.append('customer_id', filters.customer_id)
    if (filters.payment_method) queryParams.append('payment_method', filters.payment_method)
    if (filters.status) queryParams.append('status', filters.status)

    const url = `${API_CONFIG.PAYMENTS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('💰 Obteniendo pagos:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener pagos')
    }

    console.log('✅ Pagos obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener pagos:', error)
    throw new Error(error.message || 'Error al obtener pagos')
  }
}

/**
 * Obtener un pago por ID desde el backend
 * @param {string} paymentId - ID del pago
 * @returns {Promise<Object>} Pago
 */
export const fetchPaymentById = async (paymentId) => {
  try {
    console.log('💰 Obteniendo pago:', paymentId)

    const response = await fetch(API_CONFIG.PAYMENTS.GET_BY_ID(paymentId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener pago')
    }

    console.log('✅ Pago obtenido')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener pago:', error)
    throw new Error(error.message || 'Error al obtener pago')
  }
}

/**
 * Crear un nuevo pago en el backend
 * @param {Object} paymentData - Datos del pago
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Pago creado
 */
export const createPaymentAPI = async (paymentData, token) => {
  try {
    console.log('💰 Creando pago')

    const response = await fetch(API_CONFIG.PAYMENTS.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(paymentData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear pago')
    }

    console.log('✅ Pago creado:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al crear pago:', error)
    throw new Error(error.message || 'Error al crear pago')
  }
}

/**
 * Actualizar un pago en el backend
 * @param {string} paymentId - ID del pago
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Pago actualizado
 */
export const updatePaymentAPI = async (paymentId, updates, token) => {
  try {
    console.log('💰 Actualizando pago:', paymentId)

    const response = await fetch(API_CONFIG.PAYMENTS.UPDATE(paymentId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar pago')
    }

    console.log('✅ Pago actualizado')

    return data.data
  } catch (error) {
    console.error('❌ Error al actualizar pago:', error)
    throw new Error(error.message || 'Error al actualizar pago')
  }
}

/**
 * Marcar un pago como pagado en el backend
 * @param {string} paymentId - ID del pago
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Pago actualizado
 */
export const markPaymentAsPaidAPI = async (paymentId, token) => {
  try {
    console.log('💰 Marcando pago como pagado:', paymentId)

    const response = await fetch(API_CONFIG.PAYMENTS.MARK_PAID(paymentId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al marcar pago como pagado')
    }

    console.log('✅ Pago marcado como pagado')

    return data.data
  } catch (error) {
    console.error('❌ Error al marcar pago como pagado:', error)
    throw new Error(error.message || 'Error al marcar pago como pagado')
  }
}

/**
 * Cancelar un pago en el backend
 * @param {string} paymentId - ID del pago
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Pago cancelado
 */
export const cancelPaymentAPI = async (paymentId, token) => {
  try {
    console.log('💰 Cancelando pago:', paymentId)

    const response = await fetch(API_CONFIG.PAYMENTS.CANCEL(paymentId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al cancelar pago')
    }

    console.log('✅ Pago cancelado')

    return data.data
  } catch (error) {
    console.error('❌ Error al cancelar pago:', error)
    throw new Error(error.message || 'Error al cancelar pago')
  }
}

/**
 * Eliminar un pago en el backend
 * @param {string} paymentId - ID del pago
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deletePaymentAPI = async (paymentId, token) => {
  try {
    console.log('💰 Eliminando pago:', paymentId)

    const response = await fetch(API_CONFIG.PAYMENTS.DELETE(paymentId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar pago')
    }

    console.log('✅ Pago eliminado')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar pago:', error)
    throw new Error(error.message || 'Error al eliminar pago')
  }
}

/**
 * Obtener estadísticas de pagos desde el backend
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Estadísticas de pagos
 */
export const fetchPaymentStatsAPI = async (token) => {
  try {
    console.log('💰 Obteniendo estadísticas de pagos')

    const response = await fetch(API_CONFIG.PAYMENTS.GET_STATS, {
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
