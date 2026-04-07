/**
 * FIELD SPECIAL PRICING SERVICE
 *
 * Servicio para operaciones de precios especiales de canchas.
 * Maneja precios diferenciados por fechas, eventos especiales, etc.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

// ==================== API CALLS ====================

/**
 * Obtener todos los precios especiales desde el backend
 * @param {Object} filters - Filtros opcionales
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de precios especiales
 */
export const fetchFieldSpecialPricing = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.field_id) queryParams.append('field_id', filters.field_id)
    if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active)

    const url = `${API_CONFIG.FIELD_SPECIAL_PRICING.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('💲 Obteniendo precios especiales')

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener precios especiales')
    }

    console.log('✅ Precios especiales obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener precios especiales:', error)
    throw new Error(error.message || 'Error al obtener precios especiales')
  }
}

/**
 * Obtener un precio especial por ID desde el backend
 * @param {string} pricingId - ID del precio especial
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Precio especial
 */
export const fetchFieldSpecialPricingById = async (pricingId, token) => {
  try {
    console.log('💲 Obteniendo precio especial:', pricingId)

    const response = await fetch(API_CONFIG.FIELD_SPECIAL_PRICING.GET_BY_ID(pricingId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener precio especial')
    }

    console.log('✅ Precio especial obtenido')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener precio especial:', error)
    throw new Error(error.message || 'Error al obtener precio especial')
  }
}

/**
 * Obtener precios especiales de una cancha específica desde el backend
 * @param {string} fieldId - ID de la cancha
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de precios especiales
 */
export const fetchSpecialPricingByField = async (fieldId, token) => {
  try {
    console.log('💲 Obteniendo precios especiales de la cancha:', fieldId)

    const response = await fetch(API_CONFIG.FIELD_SPECIAL_PRICING.GET_BY_FIELD(fieldId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener precios especiales de la cancha')
    }

    console.log('✅ Precios especiales de la cancha obtenidos:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener precios especiales de la cancha:', error)
    throw new Error(error.message || 'Error al obtener precios especiales de la cancha')
  }
}

/**
 * Obtener precios especiales aplicables para una cancha y fecha
 * @param {string} fieldId - ID de la cancha
 * @param {Object} params - { date, time_slot }
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de precios especiales aplicables
 */
export const fetchApplicableSpecialPricing = async (fieldId, params = {}, token) => {
  try {
    const queryParams = new URLSearchParams()

    if (params.date) queryParams.append('date', params.date)
    if (params.time_slot) queryParams.append('time_slot', params.time_slot)

    const url = `${API_CONFIG.FIELD_SPECIAL_PRICING.GET_APPLICABLE(fieldId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('💲 Obteniendo precios especiales aplicables')

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener precios especiales aplicables')
    }

    console.log('✅ Precios especiales aplicables obtenidos')

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener precios especiales aplicables:', error)
    throw new Error(error.message || 'Error al obtener precios especiales aplicables')
  }
}

/**
 * Crear un nuevo precio especial en el backend
 * @param {Object} pricingData - Datos del precio especial
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Precio especial creado
 */
export const createFieldSpecialPricingAPI = async (pricingData, token) => {
  try {
    console.log('💲 Creando precio especial')

    const response = await fetch(API_CONFIG.FIELD_SPECIAL_PRICING.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(pricingData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear precio especial')
    }

    console.log('✅ Precio especial creado:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al crear precio especial:', error)
    throw new Error(error.message || 'Error al crear precio especial')
  }
}

/**
 * Actualizar un precio especial en el backend
 * @param {string} pricingId - ID del precio especial
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Precio especial actualizado
 */
export const updateFieldSpecialPricingAPI = async (pricingId, updates, token) => {
  try {
    console.log('💲 Actualizando precio especial:', pricingId)

    const response = await fetch(API_CONFIG.FIELD_SPECIAL_PRICING.UPDATE(pricingId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar precio especial')
    }

    console.log('✅ Precio especial actualizado')

    return data.data
  } catch (error) {
    console.error('❌ Error al actualizar precio especial:', error)
    throw new Error(error.message || 'Error al actualizar precio especial')
  }
}

/**
 * Eliminar un precio especial en el backend
 * @param {string} pricingId - ID del precio especial
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteFieldSpecialPricingAPI = async (pricingId, token) => {
  try {
    console.log('💲 Eliminando precio especial:', pricingId)

    const response = await fetch(API_CONFIG.FIELD_SPECIAL_PRICING.DELETE(pricingId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar precio especial')
    }

    console.log('✅ Precio especial eliminado')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar precio especial:', error)
    throw new Error(error.message || 'Error al eliminar precio especial')
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Verificar si un precio especial está activo
 * @param {Object} pricing - Precio especial
 * @param {string} date - Fecha a verificar (YYYY-MM-DD)
 * @returns {boolean} True si está activo
 */
export const isSpecialPricingActive = (pricing, date) => {
  if (!pricing.is_active) return false

  // IMPORTANTE: Usar 'T12:00:00' para evitar problemas de timezone
  // Sin esto, las fechas en formato YYYY-MM-DD se interpretan como medianoche UTC
  // que en Perú (UTC-5) causa desfases de un día
  const checkDate = new Date(date + 'T12:00:00')
  const startDate = new Date(pricing.start_date + 'T00:00:00')
  const endDate = new Date(pricing.end_date + 'T23:59:59')

  return checkDate >= startDate && checkDate <= endDate
}

/**
 * Calcular precio aplicando descuento/incremento especial
 * @param {number} basePrice - Precio base
 * @param {Object} specialPricing - Precio especial
 * @returns {number} Precio final
 */
export const calculateSpecialPrice = (basePrice, specialPricing) => {
  if (!specialPricing) return basePrice

  if (specialPricing.pricing_type === 'fixed') {
    return specialPricing.special_price
  }

  if (specialPricing.pricing_type === 'percentage') {
    const adjustment = (basePrice * specialPricing.percentage_adjustment) / 100
    return basePrice + adjustment
  }

  return basePrice
}
