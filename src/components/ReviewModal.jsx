import React, { useState } from 'react'
import { X, Star, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import useAuthStore from '../store/authStore'
import useBookingStore from '../store/bookingStore'
import { createReviewAPI } from '../services/reviews/reviewsService'
import Swal from 'sweetalert2'
import { parseLocalDate } from '../utils/dateFormatters'

const ReviewModal = ({ isOpen, onClose, reservation }) => {
  const { user, token } = useAuthStore()
  const { loadReservations } = useBookingStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [ratings, setRatings] = useState({
    cleanliness: 0,
    service: 0,
    facilities: 0,
  })

  const [hoveredRatings, setHoveredRatings] = useState({
    cleanliness: 0,
    service: 0,
    facilities: 0,
  })

  const [comment, setComment] = useState('')

  if (!isOpen || !reservation) return null

  const handleSubmit = async () => {
    // Validar que todas las categorías tengan al menos 1 estrella
    if (ratings.cleanliness === 0 || ratings.service === 0 || ratings.facilities === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Calificación Incompleta',
        text: 'Por favor califica todas las categorías',
        confirmButtonColor: '#22c55e',
      })
      return
    }

    const reviewData = {
      reservation_id: reservation.id,
      field_id: reservation.fieldId || reservation.field_id,
      customer_id: user.customerId || user.id,
      customer_name: user.name || user.username,
      cleanliness: ratings.cleanliness,
      service: ratings.service,
      facilities: ratings.facilities,
      comment: comment.trim(),
    }

    setIsSubmitting(true)

    try {
      await createReviewAPI(reviewData, token)

      Swal.fire({
        icon: 'success',
        title: '¡Gracias por tu Opinión!',
        text: 'Tu calificación ha sido registrada exitosamente',
        confirmButtonColor: '#22c55e',
        timer: 2000,
      })

      // Recargar reservas para actualizar el estado de "reviewed"
      await loadReservations()

      // Resetear formulario
      setRatings({ cleanliness: 0, service: 0, facilities: 0 })
      setComment('')
      onClose()
    } catch (error) {
      console.error('Error al enviar calificación:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo registrar tu calificación',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (category, value, hoverValue) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRatings({ ...ratings, [category]: star })}
            onMouseEnter={() => setHoveredRatings({ ...hoveredRatings, [category]: star })}
            onMouseLeave={() => setHoveredRatings({ ...hoveredRatings, [category]: 0 })}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hoverValue || value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  const categories = [
    {
      id: 'cleanliness',
      label: 'Limpieza',
      description: 'Estado de la cancha, vestuarios y área común',
    },
    {
      id: 'service',
      label: 'Atención',
      description: 'Amabilidad y disposición del personal',
    },
    {
      id: 'facilities',
      label: 'Servicios',
      description: 'Calidad de vestuarios, estacionamiento, etc.',
    },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-yellow-300" />
                <div>
                  <h3 className="text-xl font-bold text-white">Califica tu Experiencia</h3>
                  <p className="text-green-100 text-sm">{reservation.fieldName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-green-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Información de la reserva */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">Fecha del partido</p>
                <p className="text-lg font-semibold text-gray-900">
                  {parseLocalDate(reservation.date).toLocaleDateString('es-PE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-sm text-gray-600 mt-1">Horario: {reservation.time}</p>
              </div>

              {/* Categorías de calificación */}
              <div className="space-y-6">
                {categories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">{category.label}</h4>
                      <p className="text-sm text-gray-600">{category.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {renderStars(category.id, ratings[category.id], hoveredRatings[category.id])}
                      {ratings[category.id] > 0 && (
                        <span className="text-sm font-medium text-gray-700">
                          {ratings[category.id]} / 5
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Comentario opcional */}
              <div>
                <label className="block font-semibold text-gray-900 mb-2">
                  Comentario (Opcional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos más sobre tu experiencia..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows="4"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{comment.length} / 500 caracteres</p>
              </div>

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`flex-1 px-6 py-3 text-white rounded-lg font-medium transition-all shadow-lg ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 transform hover:scale-105'
                  }`}
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Calificación'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ReviewModal
