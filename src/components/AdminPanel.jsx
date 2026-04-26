import { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import useBookingStore from '../store/bookingStore'
import useAuthStore from '../store/authStore'
import useAlertStore from '../store/alertStore'
import useFieldStore from '../store/modules/fieldStore'
import { deleteFieldAPI } from '../services/field/fieldService'
import { AdminHeader } from './admin/AdminHeader'
import { AdminNavigation } from './admin/AdminNavigation'
import TabsContent from './admin/TabsContent'
import ModalsContainer from './admin/ModalsContainer'
import { useModalManager, useFieldManagement, useAnniversaryCheck, useAdminCounts } from '../hooks'
import { useAdminPanelLogic } from '../hooks/useAdminPanelLogic'
import { getAdminTabs } from '../config/adminTabs.config'
import { fetchRegistrationRequestStatsAPI } from '../services/registrationRequests/registrationRequestsService'
import { USER_ROLES, ADMIN_TYPES } from '../constants/roles'
import { POLLING_CONFIG } from '../constants/businessConfig'

const AdminPanel = () => {
  const [pendingRegistrationsCount, setPendingRegistrationsCount] = useState(0)

  // Store access - hooks always execute
  const authStore = useAuthStore()
  const bookingStore = useBookingStore()
  const alertStore = useAlertStore()

  // Safe destructuring with defaults
  const {
    isAuthenticated = false,
    user = null,
    logout = () => {},
    checkSession = () => true,
    extendSession = () => {},
    hasPermission = () => false,
    addActivityLog = () => {},
    createAdmin = () => {},
    updateUser = () => {},
    isSuperAdmin = () => false,
    users = [],
  } = authStore || {}

  const {
    fields = [],
    existingReservations = [],
    addField = () => {},
    updateField = () => {},
    addReservation = () => {},
    createReservationWithAPI = () => {},
    getPendingRefunds = () => [],
    pendingRefunds = [],
    markRefundAsProcessed = () => {},
    sportTypes = [],
  } = bookingStore || {}

  const { alerts = [] } = alertStore || {}

  // Obtener funciones y fields del fieldStore para actualizar estado y obtener canchas pendientes
  const { updateFieldLocal, fields: fieldStoreFields } = useFieldStore()

  // Hook for centralized modal management
  const { modals, openModal, closeModal } = useModalManager([
    'newField',
    'editField',
    'configField',
    'details',
    'newAdmin',
    'editUser',
    'clientRegistration',
    'dayReservations',
    'booking',
  ])

  // Hook for field management with auto-logging
  const { handleNewField, handleUpdateField, handleUpdateFieldConfig } = useFieldManagement({
    user,
    addField,
    updateField,
    updateFieldLocal,
    addActivityLog,
  })

  // Hook for admin panel logic
  const {
    activeTab,
    setActiveTab,
    selectedField,
    selectedUser,
    selectedDate,
    selectedDayReservations,
    handleLogout,
    handleEditField,
    handleConfigField,
    handleViewField,
    handleDateClick,
    closeEditFieldModal,
    closeConfigFieldModal,
    closeDetailsModal,
    closeEditUserModal,
    closeClientRegistrationModal,
    closeDayReservationsModal,
  } = useAdminPanelLogic({
    user,
    isAuthenticated,
    isSuperAdmin,
    existingReservations,
    openModal,
    closeModal,
    addActivityLog,
    logout,
    checkSession,
    extendSession,
  })

  // Check user anniversaries (super admin only)
  useAnniversaryCheck({
    enabled: isSuperAdmin() && isAuthenticated,
    users,
    userId: user?.id,
    checkUserAnniversaries: alertStore?.checkUserAnniversaries,
  })

  // Calculate counts using optimized hook
  const {
    unreadAlerts,
    pendingFieldsCount,
    pendingRegistrations,
    pendingReservationsCount,
    pendingRefundsCount,
    actionRequiredPaymentsCount,
  } = useAdminCounts({
    user,
    existingReservations,
    alerts,
    pendingRefunds,
    pendingRegistrationsCount,
    fields: fieldStoreFields,
  })

  // Get tabs from centralized configuration
  const tabs = getAdminTabs({
    isSuperAdmin: isSuperAdmin(),
    isRegularAdmin: user?.role === USER_ROLES.ADMIN,
    pendingFieldsCount,
    pendingRegistrations,
    pendingReservationsCount,
    pendingRefundsCount,
    unreadAlerts,
    actionRequiredPaymentsCount,
  })

  const availableTabs = tabs.filter((tab) => !tab.permission || hasPermission(tab.permission))

  // Helper function to get field owner
  const getFieldOwner = (fieldId) => {
    try {
      const owner = users.find(
        (u) =>
          u.role === USER_ROLES.ADMIN &&
          u.adminType === ADMIN_TYPES.FIELD &&
          u.managedFields?.includes(fieldId)
      )
      return owner || null
    } catch (error) {
      console.error('Error getting field owner:', error)
      return null
    }
  }

  // Handler para eliminar una cancha
  const handleDeleteField = async (field) => {
    const result = await Swal.fire({
      title: '¿Eliminar cancha?',
      html: `
        <p>Estás a punto de eliminar la cancha:</p>
        <p class="font-semibold text-lg mt-2">${field.name}</p>
        <p class="text-sm text-gray-500 mt-2">Esta acción no se puede deshacer.</p>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      try {
        await deleteFieldAPI(field.id, authStore?.token)

        // Recargar canchas desde el backend
        const fieldStore = useFieldStore.getState()
        await fieldStore.loadFields()

        // Registrar actividad
        addActivityLog({
          action: 'delete_field',
          details: `Cancha "${field.name}" eliminada`,
          fieldId: field.id,
        })

        await Swal.fire({
          icon: 'success',
          title: 'Cancha eliminada',
          text: `La cancha "${field.name}" ha sido eliminada correctamente`,
          timer: 2000,
          showConfirmButton: false,
        })
      } catch (error) {
        console.error('Error al eliminar cancha:', error)
        await Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo eliminar la cancha',
          confirmButtonColor: '#22c55e',
        })
      }
    }
  }

  // Refrescar el conteo de solicitudes de registro (solo aplica a super admin)
  const refreshRegistrationStats = useCallback(async () => {
    if (user?.role !== USER_ROLES.SUPER_ADMIN) return
    try {
      const stats = await fetchRegistrationRequestStatsAPI(authStore?.token || null)
      setPendingRegistrationsCount(parseInt(stats.pending_requests) || 0)
    } catch (error) {
      console.error('❌ Error cargando stats de registration requests:', error)
      setPendingRegistrationsCount(0)
    }
  }, [user?.role, authStore?.token])

  // Cargar datos del backend al montar el componente
  useEffect(() => {
    const loadInitialData = async () => {
      if (!isAuthenticated) return

      try {
        const fieldStore = useFieldStore.getState()

        // Cargar datos en paralelo
        const promises = [
          fieldStore.loadFields(),
          fieldStore.loadSportTypes(),
          bookingStore.loadReservations?.() || Promise.resolve(),
          bookingStore.loadRefunds?.() || Promise.resolve(), // Cargar reembolsos del backend
          authStore.loadAllUsers?.() || Promise.resolve(),
          alertStore.loadAlerts?.() || Promise.resolve(), // Cargar alertas para mostrar toasts al iniciar sesion
          refreshRegistrationStats(),
        ]

        await Promise.all(promises)
      } catch {
        // Error cargando datos iniciales
      }
    }

    loadInitialData()
    // Solo disparar en cambios de autenticación; los stores cambian constantemente
    // y causarían loops. refreshRegistrationStats es estable por useCallback.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  // Iniciar polling de alertas para notificaciones en tiempo real
  useEffect(() => {
    if (!isAuthenticated) return

    // Obtener funciones del store directamente para evitar dependencias cambiantes
    const { startPolling } = useAlertStore.getState()

    if (startPolling) {
      startPolling(POLLING_CONFIG.ADMIN_COUNTERS_INTERVAL_MS)
    }

    // Cleanup: detener polling al desmontar o logout
    return () => {
      const { stopPolling: stop } = useAlertStore.getState()
      stop?.()
    }
  }, [isAuthenticated])

  // Polling periódico de fields y solicitudes de registro para mantener los
  // badges de "Aprobaciones" y "Solicitudes" sincronizados con el backend.
  useEffect(() => {
    if (!isAuthenticated) return

    const interval = setInterval(() => {
      useFieldStore.getState().loadFields()
      refreshRegistrationStats()
    }, POLLING_CONFIG.ADMIN_COUNTERS_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isAuthenticated, refreshRegistrationStats])

  // Show nothing while redirecting to login
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <AdminHeader user={user} onLogout={handleLogout} />

      {/* Navigation */}
      <AdminNavigation tabs={availableTabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <TabsContent
          activeTab={activeTab}
          user={user}
          isSuperAdmin={isSuperAdmin()}
          hasPermission={hasPermission}
          handlers={{
            onOpenBookingModal: () => openModal('booking'),
            onDateClick: handleDateClick,
            onOpenNewFieldModal: () => openModal('newField'),
            onViewField: handleViewField,
            onEditField: handleEditField,
            onConfigField: handleConfigField,
            onDeleteField: handleDeleteField,
            getFieldOwner,
          }}
          data={{
            pendingRefunds: getPendingRefunds(),
            fields,
            sportTypes,
            users,
            markRefundAsProcessed,
            addActivityLog,
          }}
        />
      </div>

      {/* Modals */}
      <ModalsContainer
        modals={modals}
        selectedField={selectedField}
        selectedUser={selectedUser}
        selectedDate={selectedDate}
        selectedDayReservations={selectedDayReservations}
        fields={fields}
        handlers={{
          handleNewField,
          handleUpdateField,
          handleUpdateFieldConfig,
          createAdmin,
          updateUser,
          addReservation,
          createReservationWithAPI,
        }}
        closers={{
          closeNewFieldModal: () => closeModal('newField'),
          closeEditFieldModal,
          closeConfigFieldModal,
          closeDetailsModal,
          closeNewAdminModal: () => closeModal('newAdmin'),
          closeEditUserModal,
          closeClientRegistrationModal,
          closeDayReservationsModal,
          closeBookingModal: () => closeModal('booking'),
        }}
      />
    </div>
  )
}

export default AdminPanel
