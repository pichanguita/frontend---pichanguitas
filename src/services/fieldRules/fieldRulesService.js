/**
 * FIELD RULES SERVICE
 *
 * Servicio para operaciones de reglas de canchas.
 * Maneja las normas y reglas específicas de cada cancha.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

// ==================== API CALLS ====================

/**
 * Obtener todas las reglas desde el backend
 * @param {Object} filters - Filtros opcionales
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de reglas
 */
export const fetchFieldRules = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.field_id) queryParams.append('field_id', filters.field_id)

    const url = `${API_CONFIG.FIELD_RULES.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('📜 Obteniendo reglas')

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener reglas')
    }

    console.log('✅ Reglas obtenidas:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener reglas:', error)
    throw new Error(error.message || 'Error al obtener reglas')
  }
}

/**
 * Obtener una regla por ID desde el backend
 * @param {string} ruleId - ID de la regla
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Regla
 */
export const fetchFieldRuleById = async (ruleId, token) => {
  try {
    console.log('📜 Obteniendo regla:', ruleId)

    const response = await fetch(API_CONFIG.FIELD_RULES.GET_BY_ID(ruleId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener regla')
    }

    console.log('✅ Regla obtenida')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener regla:', error)
    throw new Error(error.message || 'Error al obtener regla')
  }
}

/**
 * Obtener reglas de una cancha específica desde el backend
 * @param {string} fieldId - ID de la cancha
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de reglas
 */
export const fetchRulesByField = async (fieldId, token) => {
  try {
    console.log('📜 Obteniendo reglas de la cancha:', fieldId)

    const response = await fetch(API_CONFIG.FIELD_RULES.GET_BY_FIELD(fieldId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener reglas de la cancha')
    }

    console.log('✅ Reglas de la cancha obtenidas:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener reglas de la cancha:', error)
    throw new Error(error.message || 'Error al obtener reglas de la cancha')
  }
}

/**
 * Crear una nueva regla en el backend
 * @param {Object} ruleData - Datos de la regla
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Regla creada
 */
export const createFieldRuleAPI = async (ruleData, token) => {
  try {
    console.log('📜 Creando regla')

    const response = await fetch(API_CONFIG.FIELD_RULES.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(ruleData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear regla')
    }

    console.log('✅ Regla creada:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al crear regla:', error)
    throw new Error(error.message || 'Error al crear regla')
  }
}

/**
 * Crear múltiples reglas en el backend
 * @param {Object} rulesData - { field_id, rules: [array de reglas] }
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Reglas creadas
 */
export const createMultipleRulesAPI = async (rulesData, token) => {
  try {
    console.log('📜 Creando múltiples reglas')

    const response = await fetch(API_CONFIG.FIELD_RULES.CREATE_MULTIPLE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(rulesData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear reglas')
    }

    console.log('✅ Reglas creadas:', data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al crear reglas:', error)
    throw new Error(error.message || 'Error al crear reglas')
  }
}

/**
 * Actualizar una regla en el backend
 * @param {string} ruleId - ID de la regla
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Regla actualizada
 */
export const updateFieldRuleAPI = async (ruleId, updates, token) => {
  try {
    console.log('📜 Actualizando regla:', ruleId)

    const response = await fetch(API_CONFIG.FIELD_RULES.UPDATE(ruleId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar regla')
    }

    console.log('✅ Regla actualizada')

    return data.data
  } catch (error) {
    console.error('❌ Error al actualizar regla:', error)
    throw new Error(error.message || 'Error al actualizar regla')
  }
}

/**
 * Eliminar una regla en el backend
 * @param {string} ruleId - ID de la regla
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteFieldRuleAPI = async (ruleId, token) => {
  try {
    console.log('📜 Eliminando regla:', ruleId)

    const response = await fetch(API_CONFIG.FIELD_RULES.DELETE(ruleId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar regla')
    }

    console.log('✅ Regla eliminada')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar regla:', error)
    throw new Error(error.message || 'Error al eliminar regla')
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Agrupar reglas por categoría
 * @param {Array} rules - Array de reglas
 * @returns {Object} Reglas agrupadas por categoría
 */
export const groupRulesByCategory = (rules) => {
  const grouped = {}

  rules.forEach((rule) => {
    const category = rule.category || 'general'
    if (!grouped[category]) {
      grouped[category] = []
    }
    grouped[category].push(rule)
  })

  return grouped
}

/**
 * Ordenar reglas por prioridad
 * @param {Array} rules - Array de reglas
 * @returns {Array} Reglas ordenadas
 */
export const sortRulesByPriority = (rules) => {
  return [...rules].sort((a, b) => (a.priority || 0) - (b.priority || 0))
}
