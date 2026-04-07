/**
 * REFUNDS SERVICE
 * Servicio para operaciones de reembolsos.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Obtener todos los reembolsos desde el backend
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de reembolsos
 */
export const fetchRefunds = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.reservation_id) queryParams.append('reservation_id', filters.reservation_id)
    if (filters.customer_id) queryParams.append('customer_id', filters.customer_id)
    if (filters.status) queryParams.append('status', filters.status)

    const url = `${API_CONFIG.REFUNDS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener reembolsos')
    }

    return data.data || []
  } catch (error) {
    throw new Error(error.message || 'Error al obtener reembolsos')
  }
}

/**
 * Obtener un reembolso por ID desde el backend
 * @param {string} refundId - ID del reembolso
 * @returns {Promise<Object>} Reembolso
 */
export const fetchRefundById = async (refundId) => {
  try {
    const response = await fetch(API_CONFIG.REFUNDS.GET_BY_ID(refundId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener reembolso')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al obtener reembolso')
  }
}

/**
 * Crear un nuevo reembolso en el backend
 * @param {Object} refundData - Datos del reembolso
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Reembolso creado
 */
export const createRefundAPI = async (refundData, token) => {
  try {
    const response = await fetch(API_CONFIG.REFUNDS.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(refundData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear reembolso')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al crear reembolso')
  }
}

/**
 * Actualizar un reembolso en el backend
 * @param {string} refundId - ID del reembolso
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Reembolso actualizado
 */
export const updateRefundAPI = async (refundId, updates, token) => {
  try {
    const response = await fetch(API_CONFIG.REFUNDS.UPDATE(refundId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar reembolso')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar reembolso')
  }
}

/**
 * Procesar un reembolso en el backend
 * @param {string} refundId - ID del reembolso
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Reembolso procesado
 */
export const processRefundAPI = async (refundId, token) => {
  try {
    const response = await fetch(API_CONFIG.REFUNDS.PROCESS(refundId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al procesar reembolso')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al procesar reembolso')
  }
}

/**
 * Rechazar un reembolso en el backend
 * @param {string} refundId - ID del reembolso
 * @param {string} rejection_reason - Motivo del rechazo
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Reembolso rechazado
 */
export const rejectRefundAPI = async (refundId, rejection_reason, token) => {
  try {
    const response = await fetch(API_CONFIG.REFUNDS.REJECT(refundId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ rejection_reason }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al rechazar reembolso')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al rechazar reembolso')
  }
}

/**
 * Eliminar un reembolso en el backend
 * @param {string} refundId - ID del reembolso
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteRefundAPI = async (refundId, token) => {
  try {
    const response = await fetch(API_CONFIG.REFUNDS.DELETE(refundId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar reembolso')
    }

    return true
  } catch (error) {
    throw new Error(error.message || 'Error al eliminar reembolso')
  }
}

/**
 * Obtener estadísticas de reembolsos desde el backend
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Estadísticas de reembolsos
 */
export const fetchRefundStatsAPI = async (token) => {
  try {
    const response = await fetch(API_CONFIG.REFUNDS.GET_STATS, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener estadísticas')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al obtener estadísticas')
  }
}
