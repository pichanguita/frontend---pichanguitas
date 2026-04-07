import React, { useEffect } from 'react'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import useAlertStore from '../store/alertStore'
import useAuthStore from '../store/authStore'
import useBookingStore from '../store/bookingStore'
import { USER_ROLES } from '@/constants'
import { useAlertsManagement } from '../hooks/useAlertsManagement'
import AlertCard from './alerts/AlertCard'
import AlertFilters from './alerts/AlertFilters'
import EditReservationModal from './alerts/EditReservationModal'

const AlertsModule = () => {
  const { user } = useAuthStore()
  const alertStore = useAlertStore()
  const { fields } = useBookingStore()
  const { loadAlerts } = alertStore

  // Cargar alertas desde el backend al montar el componente
  useEffect(() => {
    loadAlerts()
  }, [loadAlerts])

  const {
    alerts,
    filters,
    unreadCount,
    showEditModal,
    editingReservation,
    handleFiltersChange,
    handleMarkAsRead,
    handleDelete,
    handleMarkAllAsRead,
    handleClearAll,
    handleEdit,
    handleReservationChange,
    handleSaveEdit,
    handleCloseEditModal,
  } = useAlertsManagement(user, alertStore, fields)

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="w-7 h-7 mr-3 text-primary-600" />
            Centro de Alertas
          </h1>
          <p className="text-gray-600 mt-1">
            {user?.role === USER_ROLES.ADMIN
              ? 'Alertas de tu cancha asignada'
              : 'Todas las alertas del sistema'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Marcar todas como leídas
            </button>
          )}
          <button
            onClick={handleClearAll}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpiar todo
          </button>
        </div>
      </div>

      {/* Filters */}
      <AlertFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        unreadCount={unreadCount}
      />

      {/* Alerts List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Historial de Alertas ({alerts.length})
          </h2>

          {alerts.length > 0 ? (
            <div className="max-h-[600px] overflow-y-auto">
              <AnimatePresence>
                {alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                  />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No hay alertas</h3>
              <p className="text-gray-400 mb-4">
                {filters.status !== 'all' || filters.type !== 'all' || filters.dateRange !== 'all'
                  ? 'No se encontraron alertas con los filtros aplicados'
                  : 'Cuando recibas alertas aparecerán aquí'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Reservation Modal */}
      <EditReservationModal
        isOpen={showEditModal}
        reservation={editingReservation}
        fields={fields}
        onSave={handleSaveEdit}
        onClose={handleCloseEditModal}
        onChange={handleReservationChange}
      />
    </div>
  )
}

export default AlertsModule
