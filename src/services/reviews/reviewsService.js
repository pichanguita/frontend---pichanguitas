/**
 * REVIEWS SERVICE
 *
 * Integración con los endpoints de reseñas del backend.
 * Expone únicamente las operaciones consumidas por la aplicación.
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Transformar una reseña de snake_case (backend) a camelCase (frontend).
 */
const transformReview = (review) => ({
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
})

/**
 * Obtener reseñas desde el backend aplicando filtros opcionales
 * (`field_id`, `customer_id`, `rating`).
 */
export const fetchReviews = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams()
    if (filters.field_id) queryParams.append('field_id', filters.field_id)
    if (filters.customer_id) queryParams.append('customer_id', filters.customer_id)
    if (filters.rating) queryParams.append('rating', filters.rating)

    const query = queryParams.toString()
    const url = query ? `${API_CONFIG.REVIEWS.GET_ALL}?${query}` : API_CONFIG.REVIEWS.GET_ALL

    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al obtener reseñas')

    return (data.data || []).map(transformReview)
  } catch (error) {
    console.error('Error al obtener reseñas:', error)
    throw new Error(error.message || 'Error al obtener reseñas')
  }
}

/**
 * Eliminar (soft delete) una reseña desde el panel de administración.
 * El backend marca status='inactive' e is_visible=false; el listado deja de
 * devolverla, por lo que no reaparece al refrescar.
 */
export const deleteReviewAPI = async (id, token) => {
  try {
    const response = await fetch(API_CONFIG.REVIEWS.DELETE(id), {
      method: 'DELETE',
      headers: getAuthHeaders(token),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al eliminar reseña')

    return true
  } catch (error) {
    console.error('Error al eliminar reseña:', error)
    throw new Error(error.message || 'Error al eliminar reseña')
  }
}

/**
 * Cambiar la visibilidad (publicar/ocultar) de una reseña y persistirla.
 */
export const setReviewVisibilityAPI = async (id, isVisible, token) => {
  try {
    const response = await fetch(API_CONFIG.REVIEWS.TOGGLE_VISIBILITY(id), {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ is_visible: isVisible }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al cambiar visibilidad de reseña')

    return transformReview(data.data)
  } catch (error) {
    console.error('Error al cambiar visibilidad de reseña:', error)
    throw new Error(error.message || 'Error al cambiar visibilidad de reseña')
  }
}

/**
 * Obtener reseñas visibles de una cancha desde el endpoint público
 * (sin autenticación). Usado por la landing y el flujo de reserva.
 *
 * @param {number} fieldId - ID de la cancha
 * @param {Object} options - { limit, offset } para paginación incremental
 * @returns {Promise<{ reviews: Array, total: number }>}
 */
export const fetchPublicFieldReviews = async (fieldId, { limit, offset } = {}) => {
  try {
    const queryParams = new URLSearchParams()
    if (limit != null) queryParams.append('limit', limit)
    if (offset != null) queryParams.append('offset', offset)

    const query = queryParams.toString()
    const base = API_CONFIG.REVIEWS.PUBLIC_BY_FIELD(fieldId)
    const url = query ? `${base}?${query}` : base

    const response = await fetch(url, { method: 'GET' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al obtener reseñas')

    return {
      reviews: (data.data || []).map(transformReview),
      total: data.total ?? 0,
    }
  } catch (error) {
    console.error('Error al obtener reseñas de la cancha:', error)
    throw new Error(error.message || 'Error al obtener reseñas')
  }
}

/**
 * Obtener las reseñas destacadas globales desde el endpoint público
 * (sin autenticación). Usado por la sección de reseñas de la landing.
 *
 * @param {number} [limit] - Máximo de reseñas a traer
 * @returns {Promise<Array>}
 */
export const fetchFeaturedReviews = async (limit) => {
  try {
    const query = limit != null ? `?limit=${limit}` : ''
    const response = await fetch(`${API_CONFIG.REVIEWS.PUBLIC_FEATURED}${query}`, { method: 'GET' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al obtener reseñas destacadas')

    return (data.data || []).map(transformReview)
  } catch (error) {
    console.error('Error al obtener reseñas destacadas:', error)
    throw new Error(error.message || 'Error al obtener reseñas destacadas')
  }
}

/**
 * Crear una reseña asociada a una reserva completada.
 */
export const createReviewAPI = async (reviewData, token) => {
  try {
    const response = await fetch(API_CONFIG.REVIEWS.CREATE, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(reviewData),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Error al crear reseña')

    return transformReview(data.data)
  } catch (error) {
    console.error('Error al crear reseña:', error)
    throw new Error(error.message || 'Error al crear reseña')
  }
}
