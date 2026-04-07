import { API_CONFIG } from '../../config/api.config'

const API_BASE_URL = API_CONFIG.BASE_URL

/**
 * Obtener todas las configuraciones de pago
 * @param {string} token - Token de autenticación
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de configuraciones
 */
export const fetchPaymentConfigs = async (token, filters = {}) => {
  const queryParams = new URLSearchParams()

  if (filters.field_id) queryParams.append('field_id', filters.field_id)
  if (filters.admin_id) queryParams.append('admin_id', filters.admin_id)
  if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active)

  const url = `${API_BASE_URL}/api/payment-configs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Error al obtener configuraciones de pago')
  }

  const data = await response.json()
  return data.data || []
}

/**
 * Obtener configuración de pago por ID
 * @param {number} id - ID de la configuración
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Configuración
 */
export const fetchPaymentConfigById = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/api/payment-configs/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Error al obtener configuración')
  }

  const data = await response.json()
  return data.data
}

/**
 * Obtener configuración de pago por field_id
 * @param {number} fieldId - ID de la cancha
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Configuración
 */
export const fetchPaymentConfigByFieldId = async (fieldId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/payment-configs/field/${fieldId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null // No existe configuración
    }
    throw new Error('Error al obtener configuración')
  }

  const data = await response.json()
  return data.data
}

/**
 * Crear o actualizar configuración de pago (upsert)
 * @param {Object} configData - Datos de la configuración
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Configuración creada/actualizada
 */
export const upsertPaymentConfigAPI = async (configData, token) => {
  const response = await fetch(`${API_BASE_URL}/api/payment-configs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(configData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al guardar configuración')
  }

  const data = await response.json()
  return data.data
}

/**
 * Actualizar configuración de pago existente
 * @param {number} id - ID de la configuración
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Configuración actualizada
 */
export const updatePaymentConfigAPI = async (id, updates, token) => {
  const response = await fetch(`${API_BASE_URL}/api/payment-configs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al actualizar configuración')
  }

  const data = await response.json()
  return data.data
}

/**
 * Eliminar configuración de pago
 * @param {number} id - ID de la configuración
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó correctamente
 */
export const deletePaymentConfigAPI = async (id, token) => {
  const response = await fetch(`${API_BASE_URL}/api/payment-configs/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al eliminar configuración')
  }

  return true
}
