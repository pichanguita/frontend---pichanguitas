/**
 * FIELD AMENITIES SERVICE
 *
 * Servicio para operaciones de amenidades de canchas.
 * Maneja servicios disponibles en las canchas (WiFi, estacionamiento, vestuarios, etc.).
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

// ==================== API CALLS ====================

/**
 * Obtener todas las amenidades desde el backend
 * @param {Object} filters - Filtros opcionales
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de amenidades
 */
export const fetchFieldAmenities = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.field_id) queryParams.append('field_id', filters.field_id)

    const url = `${API_CONFIG.FIELD_AMENITIES.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('✨ Obteniendo amenidades')

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener amenidades')
    }

    console.log('✅ Amenidades obtenidas:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener amenidades:', error)
    throw new Error(error.message || 'Error al obtener amenidades')
  }
}

/**
 * Obtener una amenidad por ID desde el backend
 * @param {string} amenityId - ID de la amenidad
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Amenidad
 */
export const fetchFieldAmenityById = async (amenityId, token) => {
  try {
    console.log('✨ Obteniendo amenidad:', amenityId)

    const response = await fetch(API_CONFIG.FIELD_AMENITIES.GET_BY_ID(amenityId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener amenidad')
    }

    console.log('✅ Amenidad obtenida')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener amenidad:', error)
    throw new Error(error.message || 'Error al obtener amenidad')
  }
}

/**
 * Obtener amenidades de una cancha específica desde el backend
 * @param {string} fieldId - ID de la cancha
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de amenidades
 */
export const fetchAmenitiesByField = async (fieldId, token) => {
  try {
    console.log('✨ Obteniendo amenidades de la cancha:', fieldId)

    const response = await fetch(API_CONFIG.FIELD_AMENITIES.GET_BY_FIELD(fieldId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener amenidades de la cancha')
    }

    console.log('✅ Amenidades de la cancha obtenidas:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener amenidades de la cancha:', error)
    throw new Error(error.message || 'Error al obtener amenidades de la cancha')
  }
}

/**
 * Crear una nueva amenidad en el backend
 * @param {Object} amenityData - Datos de la amenidad
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Amenidad creada
 */
export const createFieldAmenityAPI = async (amenityData, token) => {
  try {
    console.log('✨ Creando amenidad')

    const response = await fetch(API_CONFIG.FIELD_AMENITIES.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(amenityData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear amenidad')
    }

    console.log('✅ Amenidad creada:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al crear amenidad:', error)
    throw new Error(error.message || 'Error al crear amenidad')
  }
}

/**
 * Crear múltiples amenidades en el backend
 * @param {Object} amenitiesData - { field_id, amenities: [array de amenidades] }
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Amenidades creadas
 */
export const createMultipleAmenitiesAPI = async (amenitiesData, token) => {
  try {
    console.log('✨ Creando múltiples amenidades')

    const response = await fetch(API_CONFIG.FIELD_AMENITIES.CREATE_MULTIPLE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(amenitiesData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear amenidades')
    }

    console.log('✅ Amenidades creadas:', data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al crear amenidades:', error)
    throw new Error(error.message || 'Error al crear amenidades')
  }
}

/**
 * Actualizar una amenidad en el backend
 * @param {string} amenityId - ID de la amenidad
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Amenidad actualizada
 */
export const updateFieldAmenityAPI = async (amenityId, updates, token) => {
  try {
    console.log('✨ Actualizando amenidad:', amenityId)

    const response = await fetch(API_CONFIG.FIELD_AMENITIES.UPDATE(amenityId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar amenidad')
    }

    console.log('✅ Amenidad actualizada')

    return data.data
  } catch (error) {
    console.error('❌ Error al actualizar amenidad:', error)
    throw new Error(error.message || 'Error al actualizar amenidad')
  }
}

/**
 * Eliminar una amenidad en el backend
 * @param {string} amenityId - ID de la amenidad
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteFieldAmenityAPI = async (amenityId, token) => {
  try {
    console.log('✨ Eliminando amenidad:', amenityId)

    const response = await fetch(API_CONFIG.FIELD_AMENITIES.DELETE(amenityId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar amenidad')
    }

    console.log('✅ Amenidad eliminada')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar amenidad:', error)
    throw new Error(error.message || 'Error al eliminar amenidad')
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Agrupar amenidades por tipo
 * @param {Array} amenities - Array de amenidades
 * @returns {Object} Amenidades agrupadas por tipo
 */
export const groupAmenitiesByType = (amenities) => {
  const grouped = {}

  amenities.forEach((amenity) => {
    const type = amenity.amenity_type || 'other'
    if (!grouped[type]) {
      grouped[type] = []
    }
    grouped[type].push(amenity)
  })

  return grouped
}

/**
 * Filtrar amenidades disponibles
 * @param {Array} amenities - Array de amenidades
 * @returns {Array} Amenidades disponibles
 */
export const getAvailableAmenities = (amenities) => {
  return amenities.filter((amenity) => amenity.is_available === true)
}
