import React, { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import useBookingStore from '../store/bookingStore'
import useFieldStore from '../store/modules/fieldStore'
import { useMyReservationsLogic } from '../hooks/useMyReservationsLogic'
import { canCancelReservation } from '../services/booking/reservationService'
import { SearchBox, ReservationCard, CancelModal, EmptyState } from './my-reservations'

const MyReservations = () => {
  const { existingReservations, cancelReservation, loadReservations } = useBookingStore()

  // ✅ FIX: Obtener fields directamente del fieldStore para asegurar datos actualizados
  const { fields, loadFields } = useFieldStore()

  // ✅ FIX: Cargar fields y reservas al montar para tener políticas de cancelación actualizadas
  useEffect(() => {
    const refreshData = async () => {
      try {
        await Promise.all([loadFields(), loadReservations()])
        console.log('✅ [MyReservations] Fields y reservas cargados')
      } catch (error) {
        console.error('❌ [MyReservations] Error cargando datos:', error)
      }
    }
    refreshData()
  }, [loadFields, loadReservations])

  const {
    phoneNumber,
    setPhoneNumber,
    reservations,
    hasSearched,
    selectedReservation,
    showCancelModal,
    handleSearch,
    handleCancelClick,
    confirmCancellation,
    closeCancelModal,
  } = useMyReservationsLogic({
    existingReservations,
    fields,
    canCancelReservation,
    cancelReservation,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Mis Reservas</h1>
          <p className="text-secondary-600">Consulta y gestiona tus reservas</p>
        </div>

        {/* Search Box */}
        <SearchBox
          phoneNumber={phoneNumber}
          onPhoneChange={setPhoneNumber}
          onSearch={handleSearch}
        />

        {/* Results */}
        {hasSearched && (
          <AnimatePresence>
            {reservations.length === 0 ? (
              <EmptyState phoneNumber={phoneNumber} />
            ) : (
              <div className="space-y-4">
                {reservations.map((reservation, index) => (
                  <ReservationCard
                    key={reservation.id}
                    reservation={reservation}
                    index={index}
                    onCancel={handleCancelClick}
                  />
                ))}
              </div>
            )}
          </AnimatePresence>
        )}

        {/* Cancellation Modal */}
        <CancelModal
          isOpen={showCancelModal}
          reservation={selectedReservation}
          onClose={closeCancelModal}
          onConfirm={confirmCancellation}
        />
      </div>
    </div>
  )
}

export default MyReservations
