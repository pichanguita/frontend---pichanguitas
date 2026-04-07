import { create } from 'zustand'
import {
  fetchReviews,
  createReviewAPI,
  updateReviewAPI,
  deleteReviewAPI,
} from '../../services/reviews/reviewsService'
import useAuthStore from '../authStore'
import { parseLocalDate } from '../../utils/dateFormatters'

/**
 * Review Store
 * Maneja el sistema completo de reseñas y ratings de canchas
 * INTEGRADO CON BACKEND
 */
const useReviewStore = create((set, get) => ({
  // Array de todas las reseñas
  reviews: [],

  // Estado de carga
  isLoading: false,
  error: null,

  // ==================== API FUNCTIONS ====================

  /**
   * Cargar reviews desde el backend
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Array de reviews
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
   * Obtener review por ID (local)
   * @param {string} reviewId - ID de la review
   * @returns {Object|null} Review o null
   */
  getReviewById: (reviewId) => {
    const { reviews } = get()
    return reviews.find((r) => r.id === reviewId) || null
  },

  /**
   * Crear review en el backend
   * @param {Object} reviewData - Datos de la review
   * @returns {Promise<Object>} Review creada
   */
  createReviewAPI: async (reviewData) => {
    set({ isLoading: true, error: null })
    try {
      const token = useAuthStore.getState().token
      if (!token) throw new Error('No hay token de autenticación')

      const newReview = await createReviewAPI(reviewData, token)
      set((state) => ({
        reviews: [...state.reviews, newReview],
        isLoading: false,
      }))
      return newReview
    } catch (error) {
      set({ error: error.message, isLoading: false })
      console.error('Error creando review:', error)
      throw error
    }
  },

  /**
   * Actualizar review en el backend
   * @param {string} reviewId - ID de la review
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise<Object>} Review actualizada
   */
  updateReviewAPI: async (reviewId, updates) => {
    set({ isLoading: true, error: null })
    try {
      const token = useAuthStore.getState().token
      if (!token) throw new Error('No hay token de autenticación')

      const updatedReview = await updateReviewAPI(reviewId, updates, token)
      set((state) => ({
        reviews: state.reviews.map((r) => (r.id === reviewId ? updatedReview : r)),
        isLoading: false,
      }))
      return updatedReview
    } catch (error) {
      set({ error: error.message, isLoading: false })
      console.error('Error actualizando review:', error)
      throw error
    }
  },

  /**
   * Eliminar review en el backend
   * @param {string} reviewId - ID de la review
   * @returns {Promise<boolean>} True si se eliminó
   */
  deleteReviewAPI: async (reviewId) => {
    set({ isLoading: true, error: null })
    try {
      const token = useAuthStore.getState().token
      if (!token) throw new Error('No hay token de autenticación')

      await deleteReviewAPI(reviewId, token)
      set((state) => ({
        reviews: state.reviews.filter((r) => r.id !== reviewId),
        isLoading: false,
      }))
      return true
    } catch (error) {
      set({ error: error.message, isLoading: false })
      console.error('Error eliminando review:', error)
      throw error
    }
  },

  // ==================== LOCAL FUNCTIONS (LEGACY) ====================

  _legacyReviews: [
    // Reseñas para campo-1 (Cancha Sintética Los Campeones)
    {
      id: 'review-1',
      reservationId: 'res-1',
      fieldId: 'campo-1',
      customerId: 'customer-001',
      customerName: 'Carlos Mendoza',
      cleanliness: 5,
      service: 5,
      facilities: 4,
      overallRating: '4.7',
      comment:
        '¡Excelente cancha! El césped sintético está en perfecto estado y la iluminación es muy buena.',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 5
      ).toISOString(),
      isVisible: true,
    },
    {
      id: 'review-2',
      reservationId: 'res-2',
      fieldId: 'campo-1',
      customerId: 'customer-002',
      customerName: 'María López',
      cleanliness: 4,
      service: 5,
      facilities: 5,
      overallRating: '4.7',
      comment: 'Muy buena experiencia, los vestuarios están limpios y el personal muy atento.',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 10
      ).toISOString(),
      isVisible: true,
    },
    {
      id: 'review-3',
      reservationId: 'res-3',
      fieldId: 'campo-1',
      customerId: 'customer-003',
      customerName: 'Pedro Ramírez',
      cleanliness: 3,
      service: 4,
      facilities: 3,
      overallRating: '3.3',
      comment: 'La cancha está bien, pero los vestuarios necesitan mantenimiento.',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 15
      ).toISOString(),
      isVisible: true,
    },

    // Reseñas para campo-2 (Estadio Municipal San Martín)
    {
      id: 'review-4',
      reservationId: 'res-4',
      fieldId: 'campo-2',
      customerId: 'customer-001',
      customerName: 'Carlos Mendoza',
      cleanliness: 5,
      service: 5,
      facilities: 5,
      overallRating: '5.0',
      comment: 'Perfecto! El estadio está impecable, todo muy profesional.',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 3
      ).toISOString(),
      isVisible: true,
    },
    {
      id: 'review-5',
      reservationId: 'res-5',
      fieldId: 'campo-2',
      customerId: 'customer-004',
      customerName: 'Ana Torres',
      cleanliness: 4,
      service: 4,
      facilities: 5,
      overallRating: '4.3',
      comment: 'Muy buena cancha, recomendada para partidos importantes.',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 7
      ).toISOString(),
      isVisible: true,
    },

    // Reseñas para campo-3 (Complejo Deportivo Andahuaylas)
    {
      id: 'review-6',
      reservationId: 'res-6',
      fieldId: 'campo-3',
      customerId: 'customer-002',
      customerName: 'María López',
      cleanliness: 4,
      service: 3,
      facilities: 4,
      overallRating: '3.7',
      comment: 'Buen complejo, aunque el servicio podría mejorar un poco.',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 12
      ).toISOString(),
      isVisible: true,
    },
    {
      id: 'review-7',
      reservationId: 'res-7',
      fieldId: 'campo-3',
      customerId: 'customer-005',
      customerName: 'Jorge Sánchez',
      cleanliness: 5,
      service: 5,
      facilities: 5,
      overallRating: '5.0',
      comment: 'Excelente lugar, amplias instalaciones y todo muy limpio.',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 8
      ).toISOString(),
      isVisible: true,
    },

    // Reseñas para campo-5 (Arena Deportiva El Dorado)
    {
      id: 'review-8',
      reservationId: 'res-8',
      fieldId: 'campo-5',
      customerId: 'customer-003',
      customerName: 'Pedro Ramírez',
      cleanliness: 5,
      service: 5,
      facilities: 4,
      overallRating: '4.7',
      comment: 'Arena de primera calidad, muy recomendable.',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 2
      ).toISOString(),
      isVisible: true,
    },

    // Reseñas para campo-9 (Cancha de Vóley Arena)
    {
      id: 'review-9',
      reservationId: 'res-9',
      fieldId: 'campo-9',
      customerId: 'customer-001',
      customerName: 'Carlos Mendoza',
      cleanliness: 4,
      service: 4,
      facilities: 4,
      overallRating: '4.0',
      comment: 'Buena cancha de vóley, la arena está en buen estado.',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 6
      ).toISOString(),
      isVisible: true,
    },
    {
      id: 'review-10',
      reservationId: 'res-10',
      fieldId: 'campo-9',
      customerId: 'customer-006',
      customerName: 'Laura Díaz',
      cleanliness: 3,
      service: 3,
      facilities: 3,
      overallRating: '3.0',
      comment: 'Regular, la arena podría estar más limpia.',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 11
      ).toISOString(),
      isVisible: false, // Esta reseña está oculta por el administrador
    },

    // Reseñas para campo-10 (Futsal Pro Abancay)
    {
      id: 'review-11',
      reservationId: 'res-11',
      fieldId: 'campo-10',
      customerId: 'customer-004',
      customerName: 'Ana Torres',
      cleanliness: 5,
      service: 5,
      facilities: 5,
      overallRating: '5.0',
      comment: 'La mejor cancha de futsal que he visitado, todo impecable!',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 1
      ).toISOString(),
      isVisible: true,
    },
    {
      id: 'review-12',
      reservationId: 'res-12',
      fieldId: 'campo-10',
      customerId: 'customer-005',
      customerName: 'Jorge Sánchez',
      cleanliness: 4,
      service: 5,
      facilities: 4,
      overallRating: '4.3',
      comment: 'Muy buena cancha, el piso está perfecto para futsal.',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 4
      ).toISOString(),
      isVisible: true,
    },

    // Reseñas para campo-13 (Centro de Básquet Andahuaylas)
    {
      id: 'review-13',
      reservationId: 'res-13',
      fieldId: 'campo-13',
      customerId: 'customer-002',
      customerName: 'María López',
      cleanliness: 5,
      service: 4,
      facilities: 5,
      overallRating: '4.7',
      comment: 'Excelente cancha de básquet, los tableros son de muy buena calidad.',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 9
      ).toISOString(),
      isVisible: true,
    },

    // Reseñas para campo-15 (Complejo Frontón San Jerónimo)
    {
      id: 'review-14',
      reservationId: 'res-14',
      fieldId: 'campo-15',
      customerId: 'customer-006',
      customerName: 'Laura Díaz',
      cleanliness: 4,
      service: 4,
      facilities: 3,
      overallRating: '3.7',
      comment: 'Buen frontón, aunque las instalaciones podrían mejorar.',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 14
      ).toISOString(),
      isVisible: true,
    },

    // Reseña adicional para campo-2 (oculta)
    {
      id: 'review-15',
      reservationId: 'res-15',
      fieldId: 'campo-2',
      customerId: 'customer-007',
      customerName: 'Roberto Silva',
      cleanliness: 2,
      service: 2,
      facilities: 2,
      overallRating: '2.0',
      comment: 'Mala experiencia, encontré la cancha sucia.',
      createdAt: new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        new Date().getDate() - 20
      ).toISOString(),
      isVisible: false, // Reseña oculta por el administrador
    },
  ],

  /**
   * Agregar nueva review
   * @param {Object} reviewData - Datos de la reseña
   * @param {Function} updateFieldRating - Callback para actualizar rating de cancha
   * @param {Function} markReservationAsReviewed - Callback para marcar reserva como reviewed
   * @returns {Object} Nueva reseña creada
   */
  addReview: (reviewData, updateFieldRating, markReservationAsReviewed) => {
    const { reviews } = get()

    const newReview = {
      id: `review-${Date.now()}`,
      reservationId: reviewData.reservationId,
      fieldId: reviewData.fieldId,
      customerId: reviewData.customerId,
      customerName: reviewData.customerName,
      cleanliness: reviewData.cleanliness, // 1-5
      service: reviewData.service, // 1-5
      facilities: reviewData.facilities, // 1-5
      overallRating: (
        (reviewData.cleanliness + reviewData.service + reviewData.facilities) /
        3
      ).toFixed(1),
      comment: reviewData.comment || '',
      createdAt: new Date().toISOString(),
      isVisible: true,
    }

    // Agregar la reseña al estado
    const updatedReviews = [...reviews, newReview]
    set({ reviews: updatedReviews })

    // Marcar reserva como reviewed
    if (markReservationAsReviewed) {
      markReservationAsReviewed(reviewData.reservationId, newReview.id)
    }

    // Calcular y actualizar rating promedio de la cancha
    if (updateFieldRating) {
      const fieldReviews = updatedReviews.filter(
        (r) => r.fieldId === reviewData.fieldId && r.isVisible
      )
      const avgRating =
        fieldReviews.length > 0
          ? (
              fieldReviews.reduce((sum, r) => sum + parseFloat(r.overallRating), 0) /
              fieldReviews.length
            ).toFixed(1)
          : 0

      updateFieldRating(reviewData.fieldId, parseFloat(avgRating), fieldReviews.length)
    }

    return newReview
  },

  /**
   * Obtener reviews de una cancha específica (solo visibles)
   * @param {string} fieldId - ID de la cancha
   * @returns {Array} Array de reseñas ordenadas por fecha (más recientes primero)
   */
  getFieldReviews: (fieldId) => {
    const { reviews } = get()
    return reviews
      .filter((r) => r.fieldId === fieldId && r.isVisible)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  /**
   * Obtener todas las reviews de una cancha (incluyendo ocultas - para admin)
   * @param {string} fieldId - ID de la cancha
   * @returns {Array} Array de todas las reseñas
   */
  getAllFieldReviews: (fieldId) => {
    const { reviews } = get()
    return reviews
      .filter((r) => r.fieldId === fieldId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  },

  /**
   * Obtener rating promedio de una cancha
   * @param {string} fieldId - ID de la cancha
   * @returns {number} Rating promedio (0-5)
   */
  getFieldRating: (fieldId) => {
    const { reviews } = get()
    const fieldReviews = reviews.filter((r) => r.fieldId === fieldId && r.isVisible)

    if (fieldReviews.length === 0) return 0

    const avg =
      fieldReviews.reduce((sum, r) => sum + parseFloat(r.overallRating), 0) / fieldReviews.length
    return parseFloat(avg.toFixed(1))
  },

  /**
   * Verificar si una reserva puede ser calificada
   * @param {string} reservationId - ID de la reserva
   * @param {Object} reservation - Objeto de la reserva
   * @returns {boolean} True si puede ser calificada
   */
  canReviewReservation: (reservationId, reservation) => {
    if (!reservation) return false
    if (reservation.reviewed) return false
    if (reservation.status !== 'completed') return false

    // Solo se puede calificar si ya pasó la fecha
    const reservationDate = parseLocalDate(reservation.date)
    const now = new Date()
    return reservationDate < now
  },

  /**
   * Admin: Alternar visibilidad de una review
   * @param {string} reviewId - ID de la reseña
   * @param {Function} updateFieldRating - Callback para actualizar rating
   */
  toggleReviewVisibility: (reviewId, updateFieldRating) => {
    const { reviews } = get()

    const updatedReviews = reviews.map((r) =>
      r.id === reviewId ? { ...r, isVisible: !r.isVisible } : r
    )

    set({ reviews: updatedReviews })

    // Recalcular ratings de la cancha afectada
    if (updateFieldRating) {
      const affectedReview = updatedReviews.find((r) => r.id === reviewId)
      if (affectedReview) {
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
      }
    }
  },

  /**
   * Admin: Eliminar review
   * @param {string} reviewId - ID de la reseña
   * @param {Function} updateFieldRating - Callback para actualizar rating
   * @returns {boolean} True si se eliminó correctamente
   */
  deleteReview: (reviewId, updateFieldRating) => {
    const { reviews } = get()
    const review = reviews.find((r) => r.id === reviewId)

    if (!review) return false

    const updatedReviews = reviews.filter((r) => r.id !== reviewId)
    set({ reviews: updatedReviews })

    // Recalcular rating de la cancha
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

  /**
   * Obtener estadísticas de reviews
   * @param {string} fieldId - ID de la cancha
   * @returns {Object} Estadísticas de reviews
   */
  getReviewStats: (fieldId) => {
    const { reviews } = get()
    const fieldReviews = reviews.filter((r) => r.fieldId === fieldId && r.isVisible)

    if (fieldReviews.length === 0) {
      return {
        totalReviews: 0,
        averageRating: 0,
        averageCleanliness: 0,
        averageService: 0,
        averageFacilities: 0,
      }
    }

    const totalReviews = fieldReviews.length
    const avgRating =
      fieldReviews.reduce((sum, r) => sum + parseFloat(r.overallRating), 0) / totalReviews
    const avgCleanliness = fieldReviews.reduce((sum, r) => sum + r.cleanliness, 0) / totalReviews
    const avgService = fieldReviews.reduce((sum, r) => sum + r.service, 0) / totalReviews
    const avgFacilities = fieldReviews.reduce((sum, r) => sum + r.facilities, 0) / totalReviews

    return {
      totalReviews,
      averageRating: parseFloat(avgRating.toFixed(1)),
      averageCleanliness: parseFloat(avgCleanliness.toFixed(1)),
      averageService: parseFloat(avgService.toFixed(1)),
      averageFacilities: parseFloat(avgFacilities.toFixed(1)),
    }
  },
}))

export default useReviewStore
