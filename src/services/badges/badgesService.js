/**
 * BADGES SERVICE
 * Servicio para operaciones de insignias/gamificación.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Obtener todas las insignias desde el backend
 * @returns {Promise<Array>} Array de insignias
 */
export const fetchBadges = async () => {
  try {
    console.log('🏆 Obteniendo insignias')

    const response = await fetch(API_CONFIG.BADGES.GET_ALL, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener insignias')
    }

    console.log('✅ Insignias obtenidas:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener insignias:', error)
    throw new Error(error.message || 'Error al obtener insignias')
  }
}

/**
 * Crear una nueva insignia
 * @param {Object} badgeData - { name, icon, description, criteria_type, is_active, tiers }
 * @returns {Promise<Object>} Insignia creada
 */
export const createBadgeAPI = async (badgeData) => {
  try {
    console.log('🏆 Creando insignia:', badgeData.name)

    const response = await fetch(API_CONFIG.BADGES.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(badgeData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear insignia')
    }

    console.log('✅ Insignia creada:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al crear insignia:', error)
    throw new Error(error.message || 'Error al crear insignia')
  }
}

/**
 * Actualizar una insignia existente
 * @param {number} badgeId - ID de la insignia
 * @param {Object} badgeData - Datos a actualizar
 * @returns {Promise<Object>} Insignia actualizada
 */
export const updateBadgeAPI = async (badgeId, badgeData) => {
  try {
    console.log('🏆 Actualizando insignia:', badgeId)

    const response = await fetch(API_CONFIG.BADGES.UPDATE(badgeId), {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(badgeData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar insignia')
    }

    console.log('✅ Insignia actualizada:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al actualizar insignia:', error)
    throw new Error(error.message || 'Error al actualizar insignia')
  }
}

/**
 * Eliminar una insignia
 * @param {number} badgeId - ID de la insignia
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteBadgeAPI = async (badgeId) => {
  try {
    console.log('🏆 Eliminando insignia:', badgeId)

    const response = await fetch(API_CONFIG.BADGES.DELETE(badgeId), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar insignia')
    }

    console.log('✅ Insignia eliminada')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar insignia:', error)
    throw new Error(error.message || 'Error al eliminar insignia')
  }
}

/**
 * Obtener insignias de un cliente específico
 * @param {string} customerId - ID del cliente
 * @returns {Promise<Array>} Array de insignias del cliente
 */
export const fetchBadgesByCustomer = async (customerId) => {
  try {
    console.log('🏆 Obteniendo insignias del cliente:', customerId)

    const response = await fetch(API_CONFIG.BADGES.GET_BY_CUSTOMER(customerId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener insignias del cliente')
    }

    console.log('✅ Insignias del cliente obtenidas:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener insignias del cliente:', error)
    throw new Error(error.message || 'Error al obtener insignias del cliente')
  }
}

/**
 * Asignar una insignia a un cliente en el backend
 * @param {Object} assignmentData - { customer_id, badge_id }
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Asignación creada
 */
export const assignBadgeAPI = async (assignmentData, token) => {
  try {
    console.log('🏆 Asignando insignia')

    const response = await fetch(API_CONFIG.BADGES.ASSIGN, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(assignmentData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al asignar insignia')
    }

    console.log('✅ Insignia asignada:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al asignar insignia:', error)
    throw new Error(error.message || 'Error al asignar insignia')
  }
}

/**
 * Revocar una insignia de un cliente en el backend
 * @param {string} assignmentId - ID de la asignación
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se revocó
 */
export const revokeBadgeAPI = async (assignmentId, token) => {
  try {
    console.log('🏆 Revocando insignia:', assignmentId)

    const response = await fetch(API_CONFIG.BADGES.REVOKE(assignmentId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al revocar insignia')
    }

    console.log('✅ Insignia revocada')

    return true
  } catch (error) {
    console.error('❌ Error al revocar insignia:', error)
    throw new Error(error.message || 'Error al revocar insignia')
  }
}

/**
 * Obtener criterios de insignias disponibles
 * @returns {Promise<Array>} Array de criterios
 */
export const fetchBadgeCriteria = async () => {
  try {
    console.log('🏆 Obteniendo criterios de insignias')

    const response = await fetch(API_CONFIG.BADGE_CRITERIA.GET_ALL, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener criterios')
    }

    console.log('✅ Criterios obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener criterios:', error)
    throw new Error(error.message || 'Error al obtener criterios')
  }
}

/**
 * Obtener progreso de insignias de un cliente
 * @param {number} customerId - ID del cliente
 * @returns {Promise<Array>} Progreso de insignias
 */
export const fetchBadgeProgress = async (customerId) => {
  try {
    console.log('🏆 Obteniendo progreso de insignias para cliente:', customerId)

    const response = await fetch(API_CONFIG.BADGES.GET_PROGRESS(customerId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener progreso')
    }

    console.log('✅ Progreso obtenido:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener progreso:', error)
    throw new Error(error.message || 'Error al obtener progreso')
  }
}

/**
 * Obtener configuración de gamificación
 * @returns {Promise<Object>} Configuración
 */
export const fetchGamificationConfig = async () => {
  try {
    const response = await fetch(API_CONFIG.GAMIFICATION_CONFIG.GET_ALL, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener configuración')
    }

    return data.data || {}
  } catch (error) {
    console.error('❌ Error al obtener configuración de gamificación:', error)
    throw new Error(error.message || 'Error al obtener configuración')
  }
}

/**
 * Actualizar configuración de gamificación
 * @param {Object} config - Configuraciones a actualizar
 * @returns {Promise<Object>} Configuración actualizada
 */
export const updateGamificationConfigAPI = async (config) => {
  try {
    const response = await fetch(API_CONFIG.GAMIFICATION_CONFIG.UPDATE, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(config),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar configuración')
    }

    return data.data || {}
  } catch (error) {
    console.error('❌ Error al actualizar configuración de gamificación:', error)
    throw new Error(error.message || 'Error al actualizar configuración')
  }
}
