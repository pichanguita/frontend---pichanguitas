/**
 * ALERTS SERVICE
 * Servicio para operaciones de alertas y notificaciones.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Obtener todas las alertas desde el backend
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de alertas
 */
export const fetchAlerts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.user_id) queryParams.append('user_id', filters.user_id)
    if (filters.is_read !== undefined) queryParams.append('is_read', filters.is_read)
    if (filters.alert_type) queryParams.append('alert_type', filters.alert_type)

    const url = `${API_CONFIG.ALERTS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener alertas')
    }

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener alertas:', error)
    throw new Error(error.message || 'Error al obtener alertas')
  }
}

/**
 * Obtener una alerta por ID desde el backend
 * @param {string} alertId - ID de la alerta
 * @returns {Promise<Object>} Alerta
 */
export const fetchAlertById = async (alertId) => {
  try {
    const response = await fetch(API_CONFIG.ALERTS.GET_BY_ID(alertId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener alerta')
    }

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener alerta:', error)
    throw new Error(error.message || 'Error al obtener alerta')
  }
}

/**
 * Crear una nueva alerta en el backend
 * @param {Object} alertData - Datos de la alerta
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Alerta creada
 */
export const createAlertAPI = async (alertData, token) => {
  try {
    const response = await fetch(API_CONFIG.ALERTS.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(alertData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear alerta')
    }

    return data.data
  } catch (error) {
    console.error('❌ Error al crear alerta:', error)
    throw new Error(error.message || 'Error al crear alerta')
  }
}

/**
 * Marcar una alerta como leída en el backend
 * @param {string} alertId - ID de la alerta
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Alerta actualizada
 */
export const markAlertAsReadAPI = async (alertId, token) => {
  try {
    const response = await fetch(API_CONFIG.ALERTS.MARK_READ(alertId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al marcar alerta como leída')
    }

    return data.data
  } catch (error) {
    console.error('❌ Error al marcar alerta como leída:', error)
    throw new Error(error.message || 'Error al marcar alerta como leída')
  }
}

/**
 * Marcar todas las alertas como leídas en el backend
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Resultado
 */
export const markAllAlertsAsReadAPI = async (token) => {
  try {
    const response = await fetch(API_CONFIG.ALERTS.MARK_ALL_READ, {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al marcar todas las alertas como leídas')
    }

    return data
  } catch (error) {
    console.error('❌ Error al marcar todas las alertas como leídas:', error)
    throw new Error(error.message || 'Error al marcar todas las alertas como leídas')
  }
}

/**
 * Eliminar una alerta en el backend
 * @param {string} alertId - ID de la alerta
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteAlertAPI = async (alertId, token) => {
  try {
    const response = await fetch(API_CONFIG.ALERTS.DELETE(alertId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar alerta')
    }

    return true
  } catch (error) {
    console.error('❌ Error al eliminar alerta:', error)
    throw new Error(error.message || 'Error al eliminar alerta')
  }
}

/**
 * Obtener el conteo de alertas no leídas desde el backend
 * @param {string} adminId - ID del administrador
 * @param {string} token - Token de autenticación
 * @returns {Promise<number>} Cantidad de alertas no leídas
 */
export const fetchUnreadCountAPI = async (adminId, token) => {
  try {
    const response = await fetch(API_CONFIG.ALERTS.GET_UNREAD_COUNT(adminId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener conteo de alertas')
    }

    return data.unread_count || 0
  } catch (error) {
    console.error('❌ Error al obtener conteo de alertas:', error)
    throw new Error(error.message || 'Error al obtener conteo de alertas')
  }
}
