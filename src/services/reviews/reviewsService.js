/**
 * REVIEWS SERVICE
 * Servicio para operaciones de reseñas.
 * INTEGRADO CON BACKEND
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Transformar review de snake_case (backend) a camelCase (frontend)
 * @param {Object} review - Review del backend
 * @returns {Object} Review transformada
 */
const transformReview = (review) => {
  return {
    id: review.id,
    reservationId: review.reservation_id,
    fieldId: review.field_id,
    customerId: review.customer_id,
    customerName: review.customer_name,
    cleanliness: review.cleanliness,
    service: review.service,
    facilities: review.facilities,
    overallRating: review.overall_rating,
    comment: review.comment,
    isVisible: review.is_visible,
    status: review.status,
    createdAt: review.date_time_registration,
    fieldName: review.field_name,
    customerPhone: review.customer_phone,
  }
}

/**
 * Obtener todas las reseñas desde el backend
 * @param {Object} filters - Filtros opcionales
 * @returns {Promise<Array>} Array de reseñas
 */
export const fetchReviews = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()

    if (filters.field_id) queryParams.append('field_id', filters.field_id)
    if (filters.customer_id) queryParams.append('customer_id', filters.customer_id)
    if (filters.rating) queryParams.append('rating', filters.rating)

    const url = `${API_CONFIG.REVIEWS.GET_ALL}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

    console.log('⭐ Obteniendo reseñas:', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener reseñas')
    }

    console.log('✅ Reseñas obtenidas:', data.count || data.data?.length)

    // Transformar de snake_case a camelCase
    const reviews = (data.data || []).map(transformReview)
    console.log('📋 Reviews transformadas:', reviews)

    return reviews
  } catch (error) {
    console.error('❌ Error al obtener reseñas:', error)
    throw new Error(error.message || 'Error al obtener reseñas')
  }
}

/**
 * Obtener reseñas de una cancha específica
 * @param {string} fieldId - ID de la cancha
 * @returns {Promise<Array>} Array de reseñas
 */
export const fetchReviewsByField = async (fieldId) => {
  try {
    console.log('⭐ Obteniendo reseñas de cancha:', fieldId)

    const response = await fetch(API_CONFIG.REVIEWS.GET_BY_FIELD(fieldId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener reseñas de la cancha')
    }

    console.log('✅ Reseñas de cancha obtenidas:', data.count || data.data?.length)

    // Transformar de snake_case a camelCase
    return (data.data || []).map(transformReview)
  } catch (error) {
    console.error('❌ Error al obtener reseñas de la cancha:', error)
    throw new Error(error.message || 'Error al obtener reseñas de la cancha')
  }
}

/**
 * Crear una nueva reseña en el backend
 * @param {Object} reviewData - Datos de la reseña
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Reseña creada
 */
export const createReviewAPI = async (reviewData, token) => {
  try {
    console.log('⭐ Creando reseña')

    const response = await fetch(API_CONFIG.REVIEWS.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(reviewData),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear reseña')
    }

    console.log('✅ Reseña creada:', data.data?.id)

    // Transformar de snake_case a camelCase
    return transformReview(data.data)
  } catch (error) {
    console.error('❌ Error al crear reseña:', error)
    throw new Error(error.message || 'Error al crear reseña')
  }
}

/**
 * Actualizar una reseña en el backend
 * @param {string} reviewId - ID de la reseña
 * @param {Object} updates - Datos a actualizar
 * @param {string} token - Token de autenticación
 * @returns {Promise<Object>} Reseña actualizada
 */
export const updateReviewAPI = async (reviewId, updates, token) => {
  try {
    console.log('⭐ Actualizando reseña:', reviewId)

    const response = await fetch(API_CONFIG.REVIEWS.UPDATE(reviewId), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify(updates),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al actualizar reseña')
    }

    console.log('✅ Reseña actualizada')

    // Transformar de snake_case a camelCase
    return transformReview(data.data)
  } catch (error) {
    console.error('❌ Error al actualizar reseña:', error)
    throw new Error(error.message || 'Error al actualizar reseña')
  }
}

/**
 * Eliminar una reseña en el backend
 * @param {string} reviewId - ID de la reseña
 * @param {string} token - Token de autenticación
 * @returns {Promise<boolean>} True si se eliminó
 */
export const deleteReviewAPI = async (reviewId, token) => {
  try {
    console.log('⭐ Eliminando reseña:', reviewId)

    const response = await fetch(API_CONFIG.REVIEWS.DELETE(reviewId), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al eliminar reseña')
    }

    console.log('✅ Reseña eliminada')

    return true
  } catch (error) {
    console.error('❌ Error al eliminar reseña:', error)
    throw new Error(error.message || 'Error al eliminar reseña')
  }
}

/**
 * Obtener estadísticas de reseñas de una cancha desde el backend
 * @param {string} fieldId - ID de la cancha
 * @returns {Promise<Object>} Estadísticas de reseñas
 */
export const fetchReviewStatsAPI = async (fieldId) => {
  try {
    console.log('⭐ Obteniendo estadísticas de reseñas de la cancha:', fieldId)

    const response = await fetch(API_CONFIG.REVIEWS.GET_STATS(fieldId), {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener estadísticas')
    }

    console.log('✅ Estadísticas obtenidas')

    return data.data
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error)
    throw new Error(error.message || 'Error al obtener estadísticas')
  }
}
