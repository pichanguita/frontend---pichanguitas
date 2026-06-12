import React from 'react'
import StarRating from '../common/StarRating'

/**
 * ReviewItem - Tarjeta de una reseña individual para la vista pública.
 *
 * Reutilizada por la lista de reseñas de una cancha (FieldReviews) y por la
 * sección de reseñas destacadas de la landing (FeaturedReviews).
 *
 * @param {Object} review - Reseña en formato camelCase (reviewsService).
 * @param {boolean} [showFieldName=false] - Mostrar el nombre de la cancha (destacadas).
 */
const ReviewItem = ({ review, showFieldName = false }) => {
  const formattedDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{review.customerName}</p>
          {showFieldName && review.fieldName && (
            <p className="text-xs text-primary-600 font-medium truncate">{review.fieldName}</p>
          )}
          {formattedDate && <p className="text-xs text-gray-400">{formattedDate}</p>}
        </div>
        <StarRating rating={review.overallRating} showValue size={4} />
      </div>

      {review.comment && (
        <p className="text-sm text-gray-700 italic leading-relaxed">"{review.comment}"</p>
      )}
    </div>
  )
}

export default ReviewItem
