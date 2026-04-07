/**
 * FIELD IMAGES SERVICE
 *
 * Servicio para operaciones de imágenes de canchas.
 * Maneja galería de imágenes, imagen principal y orden de imágenes.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

// ==================== API CALLS ====================

/**
 * Obtener todas las imágenes desde el backend
 * @param {Object} filters - Filtros opcionales
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de imágenes
 */
export const fetchFieldImages = async (filters = {}, token) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.field_id) queryParams.append('field_id', filters.field_id)

    const url = `${API_CONFIG.FIELD_IMAGES.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('📸 Obteniendo imágenes')

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener imágenes')
    }

    console.log('✅ Imágenes obtenidas:', data.count || data.data?.length)

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener imágenes:', error)
    throw new Error(error.message || 'Error al obtener imágenes')
  }
}

/**
 * Obtener una imagen por ID desde el backend
 * @param {string} imageId - ID de la imagen
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Imagen
 */
export const fetchFieldImageById = async (imageId, token) => {
  try {
    console.log('📸 Obteniendo imagen:', imageId)

    const response = await fetch(API_CONFIG.FIELD_IMAGES.GET_BY_ID(imageId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener imagen')
    }

    console.log('✅ Imagen obtenida')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener imagen:', error)
    throw new Error(error.message || 'Error al obtener imagen')
  }
}

/**
 * Obtener imágenes de una cancha específica desde el backend
 * @param {string} fieldId - ID de la cancha
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Array de imágenes
 */
export const fetchImagesByField = async (fieldId, token) => {
  try {
    const response = await fetch(API_CONFIG.FIELD_IMAGES.GET_BY_FIELD(fieldId), {
      method: 'GET',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener imágenes de la cancha')
    }

    return data.data || []
  } catch (error) {
    console.error('❌ Error al obtener imágenes de la cancha:', error)
    throw new Error(error.message || 'Error al obtener imágenes de la cancha')
  }
}

/**
 * Crear una nueva imagen en el backend
 * @param {Object} imageData - Datos de la imagen (puede incluir FormData para uploads)
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Imagen creada
 */
export const createFieldImageAPI = async (imageData, token) => {
  try {
    console.log('📸 Creando imagen')

    // Determinar si es FormData o JSON
    const headers =
      imageData instanceof FormData
        ? { Authorization: token ? `Bearer ${token}` : '' }
        : getAuthHeaders(token)

    const body = imageData instanceof FormData ? imageData : JSON.stringify(imageData)

    const response = await fetch(API_CONFIG.FIELD_IMAGES.CREATE, {
      method: 'POST',
      headers,
      body,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear imagen')
    }

    console.log('✅ Imagen creada:', data.data?.id)

    return data.data
  } catch (error) {
    console.error('❌ Error al crear imagen:', error)
    throw new Error(error.message || 'Error al crear imagen')
  }
}

/**
 * Actualizar una imagen en el backend
 * @param {string} imageId - ID de la imagen
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Imagen actualizada
 */
export const updateFieldImageAPI = async (imageId, updates, token) => {
  try {
    console.log('📸 Actualizando imagen:', imageId)

    const response = await fetch(API_CONFIG.FIELD_IMAGES.UPDATE(imageId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar imagen')
    }

    console.log('✅ Imagen actualizada')

    return data.data
  } catch (error) {
    console.error('❌ Error al actualizar imagen:', error)
    throw new Error(error.message || 'Error al actualizar imagen')
  }
}

/**
 * Establecer imagen como principal en el backend
 * @param {string} imageId - ID de la imagen
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Imagen actualizada
 */
export const setPrimaryImageAPI = async (imageId, token) => {
  try {
    console.log('📸 Estableciendo imagen principal:', imageId)

    const response = await fetch(API_CONFIG.FIELD_IMAGES.SET_PRIMARY(imageId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al establecer imagen principal')
    }

    console.log('✅ Imagen principal establecida')

    return data.data
  } catch (error) {
    console.error('❌ Error al establecer imagen principal:', error)
    throw new Error(error.message || 'Error al establecer imagen principal')
  }
}

/**
 * Reordenar imágenes en el backend
 * @param {Object} orderData - { field_id, image_orders: [{ image_id, display_order }] }
 * @param {string} token - Token de autenticación
 * @returns {Promise<Array>} Imágenes reordenadas
 */
export const reorderImagesAPI = async (orderData, token) => {
  try {
    console.log('📸 Reordenando imágenes')

    const response = await fetch(API_CONFIG.FIELD_IMAGES.REORDER, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(orderData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al reordenar imágenes')
    }

    console.log('✅ Imágenes reordenadas')

    return data.data || []
  } catch (error) {
    console.error('❌ Error al reordenar imágenes:', error)
    throw new Error(error.message || 'Error al reordenar imágenes')
  }
}

/**
 * Eliminar una imagen en el backend
 * @param {string} imageId - ID de la imagen
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteFieldImageAPI = async (imageId, token) => {
  try {
    console.log('📸 Eliminando imagen:', imageId)

    const response = await fetch(API_CONFIG.FIELD_IMAGES.DELETE(imageId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar imagen')
    }

    console.log('✅ Imagen eliminada')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error)
    throw new Error(error.message || 'Error al eliminar imagen')
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Obtener imagen principal de una cancha
 * @param {Array} images - Array de imágenes
 * @returns {Object|null} Imagen principal o null
 */
export const getPrimaryImage = (images) => {
  return images.find((img) => img.is_primary === true) || images[0] || null
}

/**
 * Ordenar imágenes por display_order
 * @param {Array} images - Array de imágenes
 * @returns {Array} Imágenes ordenadas
 */
export const sortImagesByOrder = (images) => {
  return [...images].sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
}
