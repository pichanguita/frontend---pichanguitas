import { create } from 'zustand'
import {
  fetchReviews,
  deleteReviewAPI,
  setReviewVisibilityAPI,
} from '../../services/reviews/reviewsService'
import { parseLocalDate } from '../../utils/dateFormatters'

/**
 * Review Store
 *
 * Estado de reseñas consumidas por el panel de administración de reviews y
 * por el flujo del cliente al calificar una reserva.
 *
 * La creación de reseñas ocurre directamente contra el endpoint
 * (`services/reviews/reviewsService.createReviewAPI`) desde `ReviewModal`,
 * por lo que este store se limita a: cargar el listado, permitir ocultar o
 * eliminar localmente (panel admin) y validar si una reserva puede ser
 * reseñada.
 */
const useReviewStore = create((set, get) => ({
  reviews: [],
  isLoading: false,
  error: null,

  /**
   * Cargar reviews desde el backend
   */
  loadReviews: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const reviews = await fetchReviews(filters)
      set({ reviews, isLoading: false })
      return reviews
    } catch (error) {
      set({ error: error.message, isLoading: false })
      console.error('Error cargando reviews:', error)
      return []
    }
  },

  /**
   * Verificar si una reserva puede ser calificada.
   *
   * Reglas:
   *   1. Debe existir la reserva.
   *   2. No puede estar ya reseñada.
   *   3. Su estado debe ser `'completed'` (el admin cerró el pago).
   *   4. La fecha de la reserva debe ser anterior al momento actual, lo que
   *      se cumple automáticamente una vez el admin registra el pago
   *      (el registro solo se habilita tras iniciar el evento).
   */
  canReviewReservation: (_reservationId, reservation) => {
    if (!reservation) return false
    if (reservation.reviewed) return false
    if (reservation.status !== 'completed') return false
    return parseLocalDate(reservation.date) < new Date()
  },

  /**
   * Admin: alternar visibilidad de una reseña.
   *
   * Persiste el cambio en el backend ANTES de tocar el estado local: si la
   * petición falla, propaga el error y el estado no se desincroniza. Sin esto,
   * ocultar/mostrar solo vivía en memoria y se perdía al refrescar.
   *
   * El promedio de la cancha NO se recalcula aquí: es un valor derivado de las
   * reseñas visibles en el backend (fuente única), por lo que se refresca solo
   * al recargar las canchas. Ocultar una reseña la excluye del promedio
   * automáticamente.
   */
  toggleReviewVisibility: async (reviewId) => {
    const { reviews } = get()
    const target = reviews.find((r) => r.id === reviewId)
    if (!target) return false

    const nextVisible = !target.isVisible
    await setReviewVisibilityAPI(reviewId, nextVisible)

    set({
      reviews: reviews.map((r) => (r.id === reviewId ? { ...r, isVisible: nextVisible } : r)),
    })
    return true
  },

  /**
   * Admin: eliminar (soft delete) una reseña.
   *
   * Persiste la eliminación en el backend ANTES de actualizar el estado local;
   * solo si el backend confirma se quita de la lista. Así un refresco no
   * resucita la reseña (antes solo se borraba en memoria). El promedio de la
   * cancha se ajusta solo, por ser derivado en el backend.
   */
  deleteReview: async (reviewId) => {
    const { reviews } = get()
    const review = reviews.find((r) => r.id === reviewId)
    if (!review) return false

    await deleteReviewAPI(reviewId)

    set({ reviews: reviews.filter((r) => r.id !== reviewId) })
    return true
  },
}))

export default useReviewStore
