/**
 * PROMOTIONS SERVICE
 * Servicio para operaciones de reglas de promoción.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Obtener todas las reglas de promoción desde el backend
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de reglas de promoción
 */
export const fetchPromotions = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active)
    if (filters.rule_type) queryParams.append('rule_type', filters.rule_type)

    const url = `${API_CONFIG.PROMOTIONS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('🎁 Obteniendo promociones:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener promociones')
    }

    console.log('✅ Promociones obtenidas:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener promociones:', error)
    throw new Error(error.message || 'Error al obtener promociones')
  }
}

/**
 * Obtener una promoción por ID desde el backend
 * @param {string} promotionId - ID de la promoción
 * @returns {Promise<Object>} Promoción
 */
export const fetchPromotionById = async (promotionId) => {
  try {
    console.log('🎁 Obteniendo promoción:', promotionId)

    const response = await fetch(API_CONFIG.PROMOTIONS.GET_BY_ID(promotionId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener promoción')
    }

    console.log('✅ Promoción obtenida')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener promoción:', error)
    throw new Error(error.message || 'Error al obtener promoción')
  }
}

/**
 * Obtener promociones activas desde el backend
 * @returns {Promise<Array>} Array de promociones activas
 */
export const fetchActivePromotions = async () => {
  try {
    console.log('🎁 Obteniendo promociones activas')

    const response = await fetch(API_CONFIG.PROMOTIONS.GET_ACTIVE, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener promociones activas')
    }

    console.log('✅ Promociones activas obtenidas:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener promociones activas:', error)
    throw new Error(error.message || 'Error al obtener promociones activas')
  }
}

/**
 * Crear una nueva promoción en el backend
 * @param {Object} promotionData - Datos de la promoción
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Promoción creada
 */
export const createPromotionAPI = async (promotionData, token) => {
  try {
    console.log('🎁 Creando promoción')

    const response = await fetch(API_CONFIG.PROMOTIONS.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(promotionData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear promoción')
    }

    console.log('✅ Promoción creada:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al crear promoción:', error)
    throw new Error(error.message || 'Error al crear promoción')
  }
}

/**
 * Actualizar una promoción en el backend
 * @param {string} promotionId - ID de la promoción
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Promoción actualizada
 */
export const updatePromotionAPI = async (promotionId, updates, token) => {
  try {
    console.log('🎁 Actualizando promoción:', promotionId)

    const response = await fetch(API_CONFIG.PROMOTIONS.UPDATE(promotionId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar promoción')
    }

    console.log('✅ Promoción actualizada')

    return data.data
  } catch (error) {
    console.error('❌ Error al actualizar promoción:', error)
    throw new Error(error.message || 'Error al actualizar promoción')
  }
}

/**
 * Eliminar una promoción en el backend
 * @param {string} promotionId - ID de la promoción
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deletePromotionAPI = async (promotionId, token) => {
  try {
    console.log('🎁 Eliminando promoción:', promotionId)

    const response = await fetch(API_CONFIG.PROMOTIONS.DELETE(promotionId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar promoción')
    }

    console.log('✅ Promoción eliminada')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar promoción:', error)
    throw new Error(error.message || 'Error al eliminar promoción')
  }
}

/**
 * Obtener mis promociones como cliente (con progreso)
 * @returns {Promise<Object>} Promociones con progreso del cliente
 */
export const fetchMyPromotions = async () => {
  try {
    const response = await fetch(API_CONFIG.PROMOTIONS.GET_MY_PROMOTIONS, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener mis promociones')
    }

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener mis promociones:', error)
    throw new Error(error.message || 'Error al obtener mis promociones')
  }
}

/**
 * Canjear una promoción
 * @param {number} promotionRuleId - ID de la promoción a canjear
 * @returns {Promise<Object>} Resultado del canje
 */
export const redeemPromotion = async (promotionRuleId) => {
  try {
    console.log('🎁 Canjeando promoción:', promotionRuleId)

    const response = await fetch(API_CONFIG.PROMOTIONS.REDEEM, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ promotionRuleId }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al canjear promoción')
    }

    console.log('✅ Promoción canjeada:', data.data)

    return data.data
  } catch (error) {
    console.error('❌ Error al canjear promoción:', error)
    throw new Error(error.message || 'Error al canjear promoción')
  }
}

/**
 * Obtener historial de promociones canjeadas
 * @returns {Promise<Array>} Historial de canjes
 */
export const fetchMyPromotionHistory = async () => {
  try {
    console.log('🎁 Obteniendo historial de promociones')

    const response = await fetch(API_CONFIG.PROMOTIONS.GET_MY_HISTORY, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener historial')
    }

    console.log('✅ Historial obtenido:', data.count)

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener historial:', error)
    throw new Error(error.message || 'Error al obtener historial')
  }
}

/**
 * Obtener canchas que ya tienen reglas de promoción activas
 * @param {number|null} excludeRuleId - ID de regla a excluir (para edición)
 * @returns {Promise<Array>} Lista de canchas con reglas activas
 */
export const fetchFieldsWithActiveRules = async (excludeRuleId = null) => {
  try {
    console.log('🎁 Obteniendo canchas con reglas activas')

    let url = API_CONFIG.PROMOTIONS.GET_FIELDS_WITH_RULES
    if (excludeRuleId) {
      url += `?excludeRuleId=${excludeRuleId}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener canchas con reglas')
    }

    console.log('✅ Canchas con reglas obtenidas:', data.count)

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener canchas con reglas:', error)
    throw new Error(error.message || 'Error al obtener canchas con reglas')
  }
}

/**
 * Verificar si hay conflictos de reglas (regla global o específicas)
 * @param {number|null} excludeRuleId - ID de regla a excluir (para edición)
 * @returns {Promise<Object>} Información de conflictos
 */
export const checkRuleConflicts = async (excludeRuleId = null) => {
  try {
    // Obtener todas las reglas activas
    const rules = await fetchPromotions({ is_active: true })

    // Filtrar la regla que estamos editando
    const activeRules = excludeRuleId
      ? rules.filter((r) => r.id !== excludeRuleId && r.is_active)
      : rules.filter((r) => r.is_active)

    // Verificar si hay una regla global
    const globalRule = activeRules.find((r) => r.applies_to === 'all')

    // Verificar si hay reglas específicas
    const specificRules = activeRules.filter((r) => r.applies_to === 'specific_fields')

    return {
      hasGlobalRule: !!globalRule,
      globalRule: globalRule || null,
      hasSpecificRules: specificRules.length > 0,
      specificRules: specificRules,
      totalActiveRules: activeRules.length,
    }
  } catch (error) {
    console.error('❌ Error al verificar conflictos:', error)
    return {
      hasGlobalRule: false,
      globalRule: null,
      hasSpecificRules: false,
      specificRules: [],
      totalActiveRules: 0,
    }
  }
}
