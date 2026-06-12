import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import ReviewItem from './ReviewItem'
import { fetchFeaturedReviews } from '../../services/reviews/reviewsService'

// Cantidad de reseñas destacadas a mostrar en la landing.
const FEATURED_LIMIT = 6

/**
 * FeaturedReviews - Sección de la landing con reseñas destacadas globales.
 *
 * Consume el endpoint público de destacadas. Si no hay reseñas con comentario,
 * la sección no se renderiza (no deja un hueco vacío en la landing).
 */
const FeaturedReviews = () => {
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetchFeaturedReviews(FEATURED_LIMIT)
      .then((data) => {
        if (active) setReviews(data)
      })
      .catch(() => {
        if (active) setReviews([])
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Mientras carga o si no hay reseñas, no ocupamos espacio en la landing.
  if (isLoading || reviews.length === 0) return null

  return (
    <div className="mt-12 sm:mt-16">
      <div className="text-center mb-8">
        <h3 className="text-2xl sm:text-3xl font-bold text-secondary-900 mb-2">
          Lo que dicen <span className="text-gradient">nuestros jugadores</span>
        </h3>
        <p className="text-base text-secondary-600 max-w-2xl mx-auto px-4">
          Reseñas reales de clientes que ya reservaron sus canchas
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <ReviewItem review={review} showFieldName />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default FeaturedReviews
