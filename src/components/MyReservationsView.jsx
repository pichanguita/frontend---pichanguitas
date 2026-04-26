import React, { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import useBookingStore from '../store/bookingStore'
import useAuthStore from '../store/authStore'
import useReviewStore from '../store/modules/reviewStore'
import useFieldStore from '../store/modules/fieldStore'
import { canCancelReservation } from '../services/booking/reservationService'
import ReviewModal from './ReviewModal'
import { useMyReservationsView } from '../hooks/useMyReservationsView'
import {
  QuickStats,
  ReservationsTabs,
  CancellationModal,
  ReservationsTabContent,
} from './reservations-view'

const MyReservationsView = () => {
  const { existingReservations, cancelReservation, loadReservations } = useBookingStore()
  const { fields, loadFields } = useFieldStore() // Obtener fields del store correcto
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { canReviewReservation } = useReviewStore()
  const { user } = useAuthStore()

  // Recargar reservas y fields al montar el componente
  useEffect(() => {
    const refreshData = async () => {
      try {
        setIsRefreshing(true)
        // Cargar fields y reservas en paralelo
        await Promise.all([loadFields(), loadReservations()])
      } catch (error) {
        console.error('❌ [MyReservationsView] Error actualizando datos:', error)
      } finally {
        setIsRefreshing(false)
      }
    }
    refreshData()
  }, [loadReservations, loadFields])

  // Función para refrescar manualmente
  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await loadReservations()
    } catch (error) {
      console.error('Error refrescando reservas:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const {
    activeSubTab,
    setActiveSubTab,
    reviewModalOpen,
    selectedReservation,
    showCancelModal,
    reservationToCancel,
    myReservations,
    activeReservations,
    pastReservations,
    fieldRentalCount,
    totalPendingBalance,
    getFieldInfo,
    getStatusBadge,
    handleCancelReservation,
    confirmCancellation,
    handleOpenReview,
    handleCloseReview,
    closeCancelModal,
  } = useMyReservationsView({
    existingReservations,
    fields,
    user,
    cancelReservation,
    canReviewReservation,
    canCancelReservation,
  })

  return (
    <div className="space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Mis Reservas</h2>
          <p className="text-sm sm:text-base text-gray-600">Gestiona y revisa tus reservas</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          aria-label={isRefreshing ? 'Actualizando' : 'Actualizar'}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-2 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isRefreshing ? 'Actualizando...' : 'Actualizar'}</span>
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <QuickStats
        activeCount={activeReservations.length}
        totalCount={myReservations.length}
        pendingBalance={totalPendingBalance}
      />

      {/* Tabs */}
      <ReservationsTabs
        activeTab={activeSubTab}
        onTabChange={setActiveSubTab}
        activeCount={activeReservations.length}
        historyCount={pastReservations.length}
      />

      {/* Contenido de Tabs */}
      <div>
        {activeSubTab === 'activas' && (
          <ReservationsTabContent
            reservations={activeReservations}
            isPast={false}
            getFieldInfo={getFieldInfo}
            getStatusBadge={getStatusBadge}
            handleCancelReservation={handleCancelReservation}
            handleOpenReview={handleOpenReview}
            canReviewReservation={canReviewReservation}
            canCancelReservation={canCancelReservation}
            fieldRentalCount={fieldRentalCount}
          />
        )}

        {activeSubTab === 'historial' && (
          <ReservationsTabContent
            reservations={pastReservations}
            isPast={true}
            getFieldInfo={getFieldInfo}
            getStatusBadge={getStatusBadge}
            handleCancelReservation={handleCancelReservation}
            handleOpenReview={handleOpenReview}
            canReviewReservation={canReviewReservation}
            canCancelReservation={canCancelReservation}
            fieldRentalCount={fieldRentalCount}
          />
        )}
      </div>

      {/* Modal de Cancelación */}
      <CancellationModal
        isOpen={showCancelModal}
        reservation={reservationToCancel}
        fieldInfo={reservationToCancel ? getFieldInfo(reservationToCancel.fieldId) : null}
        onClose={closeCancelModal}
        onConfirm={confirmCancellation}
      />

      {/* Modal de Calificación */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={handleCloseReview}
        reservation={selectedReservation}
      />
    </div>
  )
}

export default MyReservationsView
