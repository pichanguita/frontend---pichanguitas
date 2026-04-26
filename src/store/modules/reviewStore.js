import { create } from 'zustand'
import { fetchReviews } from '../../services/reviews/reviewsService'
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
   * Admin: alternar visibilidad local de una reseña y recalcular rating.
   */
  toggleReviewVisibility: (reviewId, updateFieldRating) => {
    const { reviews } = get()
    const updatedReviews = reviews.map((r) =>
      r.id === reviewId ? { ...r, isVisible: !r.isVisible } : r
    )
    set({ reviews: updatedReviews })

    if (!updateFieldRating) return
    const affectedReview = updatedReviews.find((r) => r.id === reviewId)
    if (!affectedReview) return

    const fieldReviews = updatedReviews.filter(
      (r) => r.fieldId === affectedReview.fieldId && r.isVisible
    )
    const avgRating =
      fieldReviews.length > 0
        ? (
            fieldReviews.reduce((sum, r) => sum + parseFloat(r.overallRating), 0) /
            fieldReviews.length
          ).toFixed(1)
        : 0
    updateFieldRating(affectedReview.fieldId, parseFloat(avgRating), fieldReviews.length)
  },

  /**
   * Admin: eliminar localmente una reseña y recalcular rating.
   */
  deleteReview: (reviewId, updateFieldRating) => {
    const { reviews } = get()
    const review = reviews.find((r) => r.id === reviewId)
    if (!review) return false

    const updatedReviews = reviews.filter((r) => r.id !== reviewId)
    set({ reviews: updatedReviews })

    if (updateFieldRating) {
      const fieldReviews = updatedReviews.filter((r) => r.fieldId === review.fieldId && r.isVisible)
      const avgRating =
        fieldReviews.length > 0
          ? (
              fieldReviews.reduce((sum, r) => sum + parseFloat(r.overallRating), 0) /
              fieldReviews.length
            ).toFixed(1)
          : 0
      updateFieldRating(review.fieldId, parseFloat(avgRating), fieldReviews.length)
    }
    return true
  },
}))

export default useReviewStore
