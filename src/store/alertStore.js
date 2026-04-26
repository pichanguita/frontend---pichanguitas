import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  fetchAlerts,
  fetchAlertById,
  createAlertAPI,
  markAlertAsReadAPI,
  markAllAlertsAsReadAPI,
  deleteAlertAPI,
} from '../services/alerts/alertsService'
import useAuthStore from './authStore'
import { POLLING_CONFIG } from '../constants/businessConfig'

// Variable global para el intervalo de polling (fuera del store para evitar re-renders)
let pollingInterval = null

const useAlertStore = create(
  persist(
    (set, get) => ({
      alerts: [],
      unreadCount: 0,
      filters: {
        status: 'all',
        type: 'all',
        dateRange: 'all',
      },

      // Estado de carga
      isLoading: false,
      error: null,

      // Estado de polling
      isPolling: false,
      lastPollTime: null,

      // ==================== POLLING FUNCTIONS ====================

      /**
       * Iniciar polling de alertas
       * @param {number} intervalMs - Intervalo en milisegundos (default: POLLING_CONFIG.ADMIN_COUNTERS_INTERVAL_MS)
       */
      startPolling: (intervalMs = POLLING_CONFIG.ADMIN_COUNTERS_INTERVAL_MS) => {
        // Evitar múltiples intervalos
        if (pollingInterval) {
          return
        }

        set({ isPolling: true })

        // Cargar alertas inmediatamente
        get().loadAlerts()

        // Configurar polling periódico
        pollingInterval = setInterval(async () => {
          try {
            const newAlerts = await fetchAlerts({})

            // Actualizar el estado con todas las alertas
            const unreadCount = newAlerts.filter(
              (a) => a.status === 'unread' || (!a.status && a.is_read === false)
            ).length

            set({
              alerts: newAlerts,
              unreadCount,
              lastPollTime: new Date().toISOString(),
            })
          } catch (_error) {
            // Error silencioso en polling
          }
        }, intervalMs)
      },

      /**
       * Detener polling de alertas
       */
      stopPolling: () => {
        if (pollingInterval) {
          clearInterval(pollingInterval)
          pollingInterval = null
          set({ isPolling: false })
        }
      },

      // ==================== API FUNCTIONS ====================

      /**
       * Cargar alertas desde el backend
       * @param {Object} filters - Filtros opcionales
       * @returns {Promise<Array>} Array de alertas
       */
      loadAlerts: async (filters = {}) => {
        set({ isLoading: true, error: null })
        try {
          const alerts = await fetchAlerts(filters)
          // Compatibilidad: verificar tanto 'status' (backend) como 'is_read' (legacy)
          const unreadCount = alerts.filter(
            (a) => a.status === 'unread' || (!a.status && a.is_read === false)
          ).length
          set({ alerts, unreadCount, isLoading: false })
          return alerts
        } catch (error) {
          set({ error: error.message, isLoading: false })
          return []
        }
      },

      /**
       * Obtener alerta por ID desde el backend
       * @param {string} alertId - ID de la alerta
       * @returns {Promise<Object|null>} Alerta o null
       */
      getAlertByIdAPI: async (alertId) => {
        try {
          return await fetchAlertById(alertId)
        } catch (_error) {
          return null
        }
      },

      /**
       * Crear alerta en el backend
       * @param {Object} alertData - Datos de la alerta
       * @returns {Promise<Object>} Alerta creada
       */
      createAlertAPI: async (alertData) => {
        set({ isLoading: true, error: null })
        try {
          const token = useAuthStore.getState().token
          if (!token) throw new Error('No hay token de autenticación')

          const newAlert = await createAlertAPI(alertData, token)
          set((state) => ({
            alerts: [newAlert, ...state.alerts],
            unreadCount: newAlert.is_read ? state.unreadCount : state.unreadCount + 1,
            isLoading: false,
          }))
          return newAlert
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      /**
       * Marcar alerta como leída en el backend
       * @param {string} alertId - ID de la alerta
       * @returns {Promise<Object>} Alerta actualizada
       */
      markAsReadAPI: async (alertId) => {
        set({ isLoading: true, error: null })
        try {
          const token = useAuthStore.getState().token
          if (!token) throw new Error('No hay token de autenticación')

          const updatedAlert = await markAlertAsReadAPI(alertId, token)
          set((state) => ({
            alerts: state.alerts.map((a) => (a.id === alertId ? updatedAlert : a)),
            unreadCount: Math.max(0, state.unreadCount - 1),
            isLoading: false,
          }))
          return updatedAlert
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      /**
       * Marcar todas las alertas como leídas en el backend
       * @returns {Promise<boolean>} True si se marcaron
       */
      markAllAsReadAPI: async () => {
        set({ isLoading: true, error: null })
        try {
          const token = useAuthStore.getState().token
          if (!token) throw new Error('No hay token de autenticación')

          await markAllAlertsAsReadAPI(token)
          set((state) => ({
            alerts: state.alerts.map((a) => ({ ...a, is_read: true, status: 'read' })),
            unreadCount: 0,
            isLoading: false,
          }))
          return true
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      /**
       * Eliminar alerta en el backend
       * @param {string} alertId - ID de la alerta
       * @returns {Promise<boolean>} True si se eliminó
       */
      deleteAlertAPI: async (alertId) => {
        set({ isLoading: true, error: null })
        try {
          const token = useAuthStore.getState().token
          if (!token) throw new Error('No hay token de autenticación')

          await deleteAlertAPI(alertId, token)

          set((state) => {
            const alertToDelete = state.alerts.find((a) => a.id === alertId)
            const wasUnread =
              alertToDelete && (!alertToDelete.is_read || alertToDelete.status === 'unread')

            return {
              alerts: state.alerts.filter((a) => a.id !== alertId),
              unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
              isLoading: false,
            }
          })
          return true
        } catch (error) {
          set({ error: error.message, isLoading: false })
          throw error
        }
      },

      // ==================== LOCAL FUNCTIONS (LEGACY) ====================

      addAlert: (alertData) => {
        // Usar un ID único con timestamp + número aleatorio para evitar duplicados
        const newAlert = {
          id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: alertData.type || 'reservation',
          title: alertData.title,
          message: alertData.message,
          fieldId: alertData.fieldId,
          fieldName: alertData.fieldName,
          customerName: alertData.customerName,
          customerPhone: alertData.customerPhone,
          reservationData: alertData.reservationData,
          status: 'unread',
          priority: alertData.priority || 'medium',
          createdAt: new Date().toISOString(),
          adminId: alertData.adminId,
        }

        set((state) => ({
          alerts: [newAlert, ...state.alerts],
          unreadCount: state.unreadCount + 1,
        }))
      },

      markAsRead: (alertId) => {
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === alertId ? { ...alert, status: 'read' } : alert
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }))
      },

      markAllAsRead: (adminId = null) => {
        set((state) => {
          const alertsToUpdate = adminId
            ? state.alerts.filter((alert) => alert.adminId === adminId && alert.status === 'unread')
            : state.alerts.filter((alert) => alert.status === 'unread')

          return {
            alerts: state.alerts.map((alert) => {
              if (adminId) {
                return alert.adminId === adminId && alert.status === 'unread'
                  ? { ...alert, status: 'read' }
                  : alert
              }
              return alert.status === 'unread' ? { ...alert, status: 'read' } : alert
            }),
            unreadCount: adminId ? state.unreadCount - alertsToUpdate.length : 0,
          }
        })
      },

      deleteAlert: (alertId) => {
        set((state) => {
          const alertToDelete = state.alerts.find((alert) => alert.id === alertId)
          const wasUnread = alertToDelete?.status === 'unread'

          return {
            alerts: state.alerts.filter((alert) => alert.id !== alertId),
            unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
          }
        })
      },

      // Función para actualizar una alerta existente
      updateAlert: (alertId, updatedData) => {
        set((state) => ({
          alerts: state.alerts.map((alert) =>
            alert.id === alertId
              ? {
                  ...alert,
                  ...updatedData,
                  updatedAt: new Date().toISOString(),
                }
              : alert
          ),
        }))
      },

      // Alias para compatibilidad con ToastNotification
      removeAlert: (alertId) => {
        get().deleteAlert(alertId)
      },

      clearAllAlerts: (adminId = null) => {
        set((state) => {
          if (adminId) {
            const alertsToRemove = state.alerts.filter((alert) => alert.adminId === adminId)
            const unreadToRemove = alertsToRemove.filter(
              (alert) => alert.status === 'unread'
            ).length

            return {
              alerts: state.alerts.filter((alert) => alert.adminId !== adminId),
              unreadCount: Math.max(0, state.unreadCount - unreadToRemove),
            }
          }

          return {
            alerts: [],
            unreadCount: 0,
          }
        })
      },

      getFilteredAlerts: (userRole, adminId = null) => {
        const { alerts, filters } = get()
        let filteredAlerts = alerts

        // Filtrar por admin (para admins de cancha)
        // Compatibilidad: verificar tanto adminId (local) como admin_id (backend)
        if (userRole === 'admin' && adminId) {
          filteredAlerts = alerts.filter(
            (alert) => alert.adminId === adminId || alert.admin_id === adminId
          )
        }

        // Filtrar por estado (unread/read)
        if (filters.status !== 'all') {
          filteredAlerts = filteredAlerts.filter((alert) => alert.status === filters.status)
        }

        // Filtrar por tipo
        if (filters.type !== 'all') {
          filteredAlerts = filteredAlerts.filter((alert) => alert.type === filters.type)
        }

        // Filtrar por rango de fecha
        if (filters.dateRange !== 'all') {
          const now = new Date()
          const filterDate = new Date()

          switch (filters.dateRange) {
            case 'today':
              filterDate.setHours(0, 0, 0, 0)
              break
            case 'week':
              filterDate.setDate(now.getDate() - 7)
              break
            case 'month':
              filterDate.setMonth(now.getMonth() - 1)
              break
          }

          if (filters.dateRange !== 'all') {
            // Compatibilidad: verificar tanto createdAt (local) como date_time_registration (backend)
            filteredAlerts = filteredAlerts.filter((alert) => {
              const alertDate = new Date(alert.createdAt || alert.date_time_registration)
              return alertDate >= filterDate
            })
          }
        }

        // Ordenar por fecha descendente
        // Compatibilidad: verificar tanto createdAt (local) como date_time_registration (backend)
        return filteredAlerts.sort((a, b) => {
          const dateA = new Date(b.createdAt || b.date_time_registration)
          const dateB = new Date(a.createdAt || a.date_time_registration)
          return dateA - dateB
        })
      },

      setFilters: (newFilters) => {
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        }))
      },

      getUnreadCount: (adminId = null) => {
        const { alerts } = get()
        if (adminId) {
          // Compatibilidad: verificar tanto adminId (local) como admin_id (backend)
          return alerts.filter(
            (alert) =>
              (alert.adminId === adminId || alert.admin_id === adminId) && alert.status === 'unread'
          ).length
        }
        return get().unreadCount
      },

      // ==================== FUNCIONES DE CREACIÓN DE ALERTAS ====================

      /**
       * Helper para crear alerta en BD y mostrar toast
       * @param {Object} alertData - Datos de la alerta (formato frontend)
       * @param {Object} apiData - Datos para la API (formato backend snake_case)
       */
      _createAlertWithPersistence: async (alertData, apiData) => {
        const token = useAuthStore.getState().token

        // Mostrar toast inmediatamente (UX)
        get().addAlert(alertData)

        // Persistir en BD si hay token
        if (token) {
          try {
            await createAlertAPI(apiData, token)
          } catch (_error) {
            // El toast ya se mostró, no hay rollback necesario
          }
        }
      },

      /**
       * Crear alerta de nueva reserva
       */
      createNewReservationAlert: async (reservationData, fieldData, adminId) => {
        const message = `${reservationData.customerName} reservó ${fieldData.name} para el ${reservationData.date} de ${reservationData.startTime} a ${reservationData.endTime}`

        // Datos para toast local
        const alertData = {
          type: 'new_reservation',
          title: 'Nueva Reserva',
          message,
          fieldId: fieldData.id,
          fieldName: fieldData.name,
          customerName: reservationData.customerName,
          customerPhone: reservationData.customerPhone,
          reservationData: reservationData,
          priority: 'high',
          adminId: adminId,
        }

        // Datos para API (snake_case)
        const apiData = {
          type: 'new_reservation',
          title: 'Nueva Reserva',
          message,
          field_id: fieldData.id,
          customer_id: reservationData.customerId || null,
          reservation_id: reservationData.id || null,
          priority: 'high',
          admin_id: adminId,
          reservation_data: JSON.stringify(reservationData),
        }

        await get()._createAlertWithPersistence(alertData, apiData)
      },

      /**
       * Crear alerta de reserva cancelada
       */
      createReservationCancelledAlert: async (
        reservationData,
        fieldData,
        adminId,
        cancelledBy = null
      ) => {
        const message = `La reserva de ${reservationData.customerName} en ${fieldData.name} para el ${reservationData.date} fue cancelada${cancelledBy ? ` por ${cancelledBy}` : ''}`

        const alertData = {
          type: 'reservation_cancelled',
          title: 'Reserva Cancelada',
          message,
          fieldId: fieldData.id,
          fieldName: fieldData.name,
          customerName: reservationData.customerName,
          reservationData: reservationData,
          priority: 'medium',
          adminId: adminId,
        }

        const apiData = {
          type: 'cancellation',
          title: 'Reserva Cancelada',
          message,
          field_id: fieldData.id,
          customer_id: reservationData.customerId || null,
          reservation_id: reservationData.id || null,
          priority: 'medium',
          admin_id: adminId,
          reservation_data: JSON.stringify({ ...reservationData, cancelledBy }),
        }

        await get()._createAlertWithPersistence(alertData, apiData)
      },

      /**
       * Crear alerta de no show (cliente no llegó)
       */
      createNoShowAlert: async (reservationData, fieldData, adminId) => {
        const message = `${reservationData.customerName} no se presentó a su reserva en ${fieldData.name} del ${reservationData.date}`

        const alertData = {
          type: 'reservation_no_show',
          title: 'Cliente No Llegó',
          message,
          fieldId: fieldData.id,
          fieldName: fieldData.name,
          customerName: reservationData.customerName,
          customerPhone: reservationData.customerPhone,
          reservationData: reservationData,
          priority: 'medium',
          adminId: adminId,
        }

        const apiData = {
          type: 'no_show',
          title: 'Cliente No Llegó',
          message,
          field_id: fieldData.id,
          customer_id: reservationData.customerId || null,
          reservation_id: reservationData.id || null,
          priority: 'medium',
          admin_id: adminId,
          reservation_data: JSON.stringify(reservationData),
        }

        await get()._createAlertWithPersistence(alertData, apiData)
      },

      /**
       * Crear alerta de cancha aprobada
       */
      createFieldApprovedAlert: async (fieldData, approvedBy, adminId) => {
        const message = `Tu cancha "${fieldData.name}" fue aprobada y ya está disponible para reservas`

        const alertData = {
          type: 'field_approved',
          title: 'Cancha Aprobada',
          message,
          fieldId: fieldData.id,
          fieldName: fieldData.name,
          approvedBy: approvedBy?.name || 'Administrador',
          priority: 'high',
          adminId: adminId,
        }

        const apiData = {
          type: 'field_approved',
          title: 'Cancha Aprobada',
          message,
          field_id: fieldData.id,
          priority: 'high',
          admin_id: adminId,
          reservation_data: JSON.stringify({ approvedBy: approvedBy?.name || 'Administrador' }),
        }

        await get()._createAlertWithPersistence(alertData, apiData)
      },

      /**
       * Crear alerta de cancha rechazada
       */
      createFieldRejectedAlert: async (fieldData, rejectedBy, reason, adminId) => {
        const message = `Tu cancha "${fieldData.name}" fue rechazada${reason ? '. Motivo: ' + reason : ''}`

        const alertData = {
          type: 'field_rejected',
          title: 'Cancha Rechazada',
          message,
          fieldId: fieldData.id,
          fieldName: fieldData.name,
          rejectedBy: rejectedBy?.name || 'Administrador',
          rejectionReason: reason,
          priority: 'high',
          adminId: adminId,
        }

        const apiData = {
          type: 'field_rejected',
          title: 'Cancha Rechazada',
          message,
          field_id: fieldData.id,
          priority: 'high',
          admin_id: adminId,
          reservation_data: JSON.stringify({
            rejectedBy: rejectedBy?.name || 'Administrador',
            reason,
          }),
        }

        await get()._createAlertWithPersistence(alertData, apiData)
      },

      /**
       * Crear alerta de nuevo admin (para superadmin)
       */
      createNewAdminAlert: async (adminData, createdBy) => {
        const message = `Se ha creado una nueva cuenta de administrador para ${adminData.name}`

        const alertData = {
          type: 'new_admin',
          title: 'Nuevo Administrador',
          message,
          priority: 'medium',
          adminId: createdBy,
        }

        const apiData = {
          type: 'new_admin',
          title: 'Nuevo Administrador',
          message,
          user_id: adminData.id,
          priority: 'medium',
          admin_id: createdBy,
          reservation_data: JSON.stringify({
            adminName: adminData.name,
            adminEmail: adminData.email,
          }),
        }

        await get()._createAlertWithPersistence(alertData, apiData)
      },

      /**
       * Crear alerta de backup completado
       */
      createBackupAlert: async (backupData, adminId) => {
        const message = 'Respaldo automático de base de datos completado exitosamente'

        const alertData = {
          type: 'backup',
          title: 'Backup Completado',
          message,
          priority: 'low',
          adminId: adminId,
        }

        const apiData = {
          type: 'backup',
          title: 'Backup Completado',
          message,
          priority: 'low',
          admin_id: adminId,
          reservation_data: JSON.stringify(backupData || { timestamp: new Date().toISOString() }),
        }

        await get()._createAlertWithPersistence(alertData, apiData)
      },
    }),
    {
      name: 'alert-store',
      version: 2,
      // Solo persistir los filtros, no las alertas (vienen del backend)
      partialize: (state) => ({
        filters: state.filters,
      }),
    }
  )
)

export default useAlertStore
