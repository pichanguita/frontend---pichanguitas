/**
 * CUSTOMERS SERVICE
 *
 * Servicio para operaciones CRUD de clientes.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

// ==================== API CALLS ====================

/**
 * Obtener "mis clientes" - clientes que han reservado en las canchas del admin
 * @returns {Promise<Array>} Array de clientes con estadísticas
 */
export const fetchMyClients = async () => {
  try {
    const response = await fetch(API_CONFIG.CUSTOMERS.GET_MY_CLIENTS, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener mis clientes')
    }

    return data.data || []
  } catch (error) {
    throw new Error(error.message || 'Error al obtener mis clientes')
  }
}

/**
 * Obtener clientes de un admin específico (solo para super_admin)
 * @param {number} adminId - ID del admin
 * @returns {Promise<Array>} Array de clientes
 */
export const fetchClientsByAdmin = async (adminId) => {
  try {
    const response = await fetch(API_CONFIG.CUSTOMERS.GET_BY_ADMIN(adminId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener clientes del admin')
    }

    return data.data || []
  } catch (error) {
    throw new Error(error.message || 'Error al obtener clientes del admin')
  }
}

/**
 * Obtener todos los clientes desde el backend
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de clientes
 */
export const fetchCustomers = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.search) queryParams.append('search', filters.search)
    if (filters.is_vip !== undefined) queryParams.append('is_vip', filters.is_vip)
    if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active)

    const url = `${API_CONFIG.CUSTOMERS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener clientes')
    }

    return data.data || []
  } catch (error) {
    throw new Error(error.message || 'Error al obtener clientes')
  }
}

/**
 * Obtener un cliente por ID desde el backend
 * @param {string} customerId - ID del cliente
 * @returns {Promise<Object>} Cliente
 */
export const fetchCustomerById = async (customerId) => {
  try {
    const response = await fetch(API_CONFIG.CUSTOMERS.GET_BY_ID(customerId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener cliente')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al obtener cliente')
  }
}

/**
 * Buscar un cliente por teléfono desde el backend
 * @param {string} phone - Número de teléfono
 * @returns {Promise<Object|null>} Cliente o null si no existe
 */
export const fetchCustomerByPhone = async (phone) => {
  try {
    const response = await fetch(API_CONFIG.CUSTOMERS.GET_BY_PHONE(phone), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (response.status === 404) {
      return null
    }

    if (!response.ok) {
      throw new Error(data.error || 'Error al buscar cliente')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al buscar cliente')
  }
}

/**
 * Obtener historial de promociones de un cliente
 * @param {string} customerId - ID del cliente
 * @returns {Promise<Array>} Historial de promociones
 */
export const fetchCustomerPromotions = async (customerId) => {
  try {
    const response = await fetch(API_CONFIG.CUSTOMERS.GET_PROMOTIONS(customerId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener promociones')
    }

    return data.data || []
  } catch (error) {
    throw new Error(error.message || 'Error al obtener promociones')
  }
}

/**
 * Crear un nuevo cliente en el backend
 * @param {Object} customerData - Datos del cliente
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Cliente creado
 */
export const createCustomerAPI = async (customerData, token) => {
  try {
    const response = await fetch(API_CONFIG.CUSTOMERS.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(customerData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear cliente')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al crear cliente')
  }
}

/**
 * Actualizar un cliente en el backend
 * @param {string} customerId - ID del cliente
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Cliente actualizado
 */
export const updateCustomerAPI = async (customerId, updates, token) => {
  try {
    const response = await fetch(API_CONFIG.CUSTOMERS.UPDATE(customerId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar cliente')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar cliente')
  }
}

/**
 * Actualizar estadísticas de un cliente en el backend
 * @param {string} customerId - ID del cliente
 * @param {Object} stats - Estadísticas a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Cliente actualizado
 */
export const updateCustomerStatsAPI = async (customerId, stats, token) => {
  try {
    const response = await fetch(API_CONFIG.CUSTOMERS.UPDATE_STATS(customerId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(stats),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar estadísticas')
    }

    return data.data
  } catch (error) {
    throw new Error(error.message || 'Error al actualizar estadísticas')
  }
}

/**
 * Eliminar un cliente (soft delete) en el backend
 * @param {string} customerId - ID del cliente
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteCustomerAPI = async (customerId, token) => {
  try {
    const response = await fetch(API_CONFIG.CUSTOMERS.DELETE(customerId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar cliente')
    }

    return true
  } catch (error) {
    throw new Error(error.message || 'Error al eliminar cliente')
  }
}

/**
 * Obtener horas gratis disponibles del cliente autenticado
 * @returns {Promise<Object>} { availableFreeHours, earnedFreeHours, usedFreeHours }
 */
export const fetchMyFreeHours = async () => {
  try {
    const response = await fetch(API_CONFIG.CUSTOMERS.GET_MY_FREE_HOURS, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener horas gratis')
    }

    return data.data
  } catch {
    // No lanzar error, retornar valores por defecto
    return {
      availableFreeHours: 0,
      earnedFreeHours: 0,
      usedFreeHours: 0,
    }
  }
}
