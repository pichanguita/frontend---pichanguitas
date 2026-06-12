import React, { useState, useEffect, useCallback } from 'react'
import { MessageSquare, ChevronDown } from 'lucide-react'
import StarRating from '../common/StarRating'
import ReviewItem from './ReviewItem'
import { fetchPublicFieldReviews } from '../../services/reviews/reviewsService'

// Tamaño de página: cuántas reseñas se traen por carga. Coincide con el default
// del endpoint público; "Ver más" pide la siguiente página por offset.
const PAGE_SIZE = 5

/**
 * FieldReviews - Promedio + lista de reseñas visibles de una cancha.
 *
 * Autocontenido: hace su propio fetch al endpoint público por `fieldId`, por lo
 * que puede usarse tanto en el modal de detalle de la landing como en el flujo
 * de reserva sin acoplarse al estado del padre.
 *
 * @param {number} fieldId - ID de la cancha.
 * @param {number} [rating=0] - Promedio derivado (viene del field) para el encabezado.
 * @param {number} [totalReviews=0] - Total de reseñas visibles (viene del field).
 * @param {boolean} [collapsible=false] - Si true, arranca colapsado tras un botón.
 */
const FieldReviews = ({ fieldId, rating = 0, totalReviews = 0, collapsible = false }) => {
  const [expanded, setExpanded] = useState(!collapsible)
  const [reviews, setReviews] = useState([])
  const [total, setTotal] = useState(totalReviews)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadPage = useCallback(
    async (offset) => {
      setIsLoading(true)
      setError(null)
      try {
        const { reviews: page, total: serverTotal } = await fetchPublicFieldReviews(fieldId, {
          limit: PAGE_SIZE,
          offset,
        })
        setReviews((prev) => (offset === 0 ? page : [...prev, ...page]))
        setTotal(serverTotal)
      } catch (err) {
        setError(err.message || 'No se pudieron cargar las reseñas')
      } finally {
        setIsLoading(false)
      }
    },
    [fieldId]
  )

  // Cargar la primera página al expandir (y al cambiar de cancha si está abierto).
  useEffect(() => {
    if (expanded) {
      setReviews([])
      loadPage(0)
    }
  }, [expanded, loadPage])

  // Sin reseñas visibles: no renderizar nada en modo colapsable (evita ruido en
  // la tarjeta de reserva); en modo expandido mostrar un vacío informativo.
  if (totalReviews === 0 && reviews.length === 0) {
    if (collapsible) return null
    return (
      <div className="mt-2">
        <h4 className="font-bold text-secondary-900 mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary-600" />
          Reseñas
        </h4>
        <p className="text-sm text-gray-500">Esta cancha aún no tiene reseñas.</p>
      </div>
    )
  }

  if (collapsible && !expanded) {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setExpanded(true)
        }}
        className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
      >
        <MessageSquare className="w-4 h-4 text-primary-600" />
        Ver reseñas ({totalReviews})
      </button>
    )
  }

  const hasMore = reviews.length < total

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-secondary-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary-600" />
          Reseñas
        </h4>
        {total > 0 && <StarRating rating={rating} count={total} showValue size={4} />}
      </div>

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      <div className="space-y-3">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            loadPage(reviews.length)
          }}
          disabled={isLoading}
          className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors disabled:opacity-50"
        >
          <ChevronDown className="w-4 h-4" />
          {isLoading ? 'Cargando...' : 'Ver más reseñas'}
        </button>
      )}

      {isLoading && reviews.length === 0 && (
        <p className="text-sm text-gray-500">Cargando reseñas...</p>
      )}
    </div>
  )
}

export default FieldReviews
