import React from 'react'
import { motion } from 'framer-motion'
import ReservationCard from './ReservationCard'
import EmptyState from './EmptyState'

const ReservationsTabContent = ({
  reservations,
  isPast,
  getFieldInfo,
  getStatusBadge,
  handleCancelReservation,
  handleOpenReview,
  canReviewReservation,
  canCancelReservation,
  fieldRentalCount,
}) => {
  if (reservations.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-b-xl p-6"
      >
        <EmptyState type={isPast ? 'history' : 'active'} />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-b-xl p-6"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {reservations.map((reservation) => {
          // Obtener la política de cancelación de la cancha
          const field = getFieldInfo(reservation.fieldId)
          const cancellationPolicy = field?.cancellationPolicy || null

          return (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              isPast={isPast}
              field={field}
              statusBadge={getStatusBadge(reservation)}
              onCancel={handleCancelReservation}
              onReview={handleOpenReview}
              canReview={canReviewReservation(reservation.id, reservation)}
              cancellationValidation={canCancelReservation(reservation, cancellationPolicy)}
              rentalCount={isPast ? fieldRentalCount[reservation.fieldId] : null}
            />
          )
        })}
      </div>
    </motion.div>
  )
}

export default ReservationsTabContent
