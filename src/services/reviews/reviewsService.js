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
