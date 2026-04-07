import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  fetchPayments,
  fetchPaymentById,
  createPaymentAPI,
  updatePaymentAPI,
  markPaymentAsPaidAPI,
} from '../services/payments/paymentsService'
import useAuthStore from './authStore'
import { API_CONFIG } from '../config/api.config'

const API_URL = API_CONFIG.BASE_URL

// Función para calcular el estado de un pago
const calculatePaymentStatus = (payment, dueDay) => {
  const today = new Date()

  // Crear fecha de vencimiento para el mes del pago
  const [year, month] = payment.month.split('-').map(Number)
  const dueDate = new Date(year, month - 1, dueDay)

  if (payment.status === 'paid') {
    return 'paid'
  }

  // Calcular si está atrasado
  if (today > dueDate) {
    const daysLate = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24))
    return `overdue_${daysLate}` // overdue_5 = 5 días atrasado
  }

  // Si aún no vence
  if (today <= dueDate) {
    return 'pending'
  }

  return 'pending'
}

const usePaymentStore = create(
  persist(
    (set, get) => ({
      // Configuraciones de pago por cancha
      paymentConfigs: [],

      // Historial de todos los pagos
      payments: [],

      // Estado de carga
      isLoading: false,
      error: null,

      // Monto pendiente de mensualidades (para dashboard)
      monthlyPendingAmount: 0,

      // Cargar monto pendiente desde API
      loadMonthlyPendingAmount: async () => {
        try {
          const token = useAuthStore.getState().token
          if (!token) return 0

          const today = new Date()
          const currentMonth = today.getMonth() + 1
          const currentYear = today.getFullYear()

          const response = await fetch(
            `${API_URL}/api/monthly-payments/stats?month=${currentMonth}&year=${currentYear}`,
            { headers: { Authorization: `Bearer ${token}` } }
          )

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.data) {
              const pendingAmount = parseFloat(data.data.pending_amount) || 0
              const overdueAmount = parseFloat(data.data.overdue_amount) || 0
              const total = pendingAmount + overdueAmount
              set({ monthlyPendingAmount: total })
              return total
            }
          }
          return 0
        } catch (error) {
          console.error('Error cargando monto pendiente:', error)
          return 0
        }
      },

      // ============================================
      // API FUNCTIONS
      // ============================================

      /**
       * Cargar pagos desde el backend
       * @param {Object} filters - Filtros opcionales
       * @returns {Promise<Array>} Array de pagos
       */
      loadPayments: async (filters = {}) => {
        set({ isLoading: true, error: null })
        try {
          const payments = await fetchPayments(filters)
          set({ payments, isLoading: false })
          return payments
        } catch (error) {
          set({ error: error.message, isLoading: false })
          console.error('Error cargando pagos:', error)
          return []
        }
      },

      /**
       * Obtener pago por ID desde el backend
       * @param {string} paymentId - ID del pago
       * @returns {Promise<Object|null>} Pago o null
       */
      getPaymentByIdAPI: async (paymentId) => {
        try {
          return await fetchPaymentById(paymentId)
        } catch (error) {
          console.error('Error obteniendo pago:', error)
          return null
        }
      },

      /**
       * Crear pago en el backend
       * @param {Object} paymentData - Datos del pago
       * @returns {Promise<Object>} Pago creado
       */
      createPaymentAPI: async (paymentData) => {
        set({ isLoading: true, error: null })
        try {
          const token = useAuthStore.getState().token
          if (!token) throw new Error('No hay token de autenticación')

          const newPayment = await createPaymentAPI(paymentData, token)
          set((state) => ({
            payments: [...state.payments, newPayment],
            isLoading: false,
          }))
          return newPayment
        } catch (error) {
          set({ error: error.message, isLoading: false })
          console.error('Error creando pago:', error)
          throw error
        }
      },

      /**
       * Actualizar pago en el backend
       * @param {string} paymentId - ID del pago
       * @param {Object} updates - Datos a actualizar
       * @returns {Promise<Object>} Pago actualizado
       */
      updatePaymentAPI: async (paymentId, updates) => {
        set({ isLoading: true, error: null })
        try {
          const token = useAuthStore.getState().token
          if (!token) throw new Error('No hay token de autenticación')

          const updatedPayment = await updatePaymentAPI(paymentId, updates, token)
          set((state) => ({
            payments: state.payments.map((p) => (p.id === paymentId ? updatedPayment : p)),
            isLoading: false,
          }))
          return updatedPayment
        } catch (error) {
          set({ error: error.message, isLoading: false })
          console.error('Error actualizando pago:', error)
          throw error
        }
      },

      /**
       * Marcar pago como pagado en el backend
       * @param {string} paymentId - ID del pago
       * @returns {Promise<Object>} Pago actualizado
       */
      markPaymentAsPaidAPI: async (paymentId) => {
        set({ isLoading: true, error: null })
        try {
          const token = useAuthStore.getState().token
          if (!token) throw new Error('No hay token de autenticación')

          const paidPayment = await markPaymentAsPaidAPI(paymentId, token)
          set((state) => ({
            payments: state.payments.map((p) => (p.id === paymentId ? paidPayment : p)),
            isLoading: false,
          }))
          return paidPayment
        } catch (error) {
          set({ error: error.message, isLoading: false })
          console.error('Error marcando pago como pagado:', error)
          throw error
        }
      },

      // ============================================
      // CARGA DESDE API (BASE DE DATOS)
      // ============================================

      /**
       * Cargar configuraciones de pago desde la API
       */
      loadPaymentConfigsFromAPI: async () => {
        try {
          const token = useAuthStore.getState().token
          if (!token) return []

          const response = await fetch(`${API_URL}/api/payment-configs`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (!response.ok) return []

          const data = await response.json()
          const configs = (data.data || data || []).map((c) => ({
            id: c.id,
            fieldId: c.field_id,
            fieldName: c.field_name || `Cancha ${c.field_id}`,
            adminId: c.admin_id,
            monthlyFee: parseFloat(c.monthly_fee) || 0,
            dueDay: c.due_day || 10,
            isActive: c.is_active !== false,
          }))

          set({ paymentConfigs: configs })
          return configs
        } catch (error) {
          console.error('Error cargando payment configs:', error)
          return []
        }
      },

      /**
       * Cargar pagos mensuales desde la API
       */
      loadMonthlyPaymentsFromAPI: async (month, year) => {
        try {
          const token = useAuthStore.getState().token
          if (!token) return []

          const params = new URLSearchParams()
          if (month) params.append('month', month)
          if (year) params.append('year', year)

          const response = await fetch(`${API_URL}/api/monthly-payments?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
          })

          if (!response.ok) return []

          const data = await response.json()
          const payments = (data.data || []).map((p) => ({
            id: p.id,
            fieldId: p.field_id,
            fieldName: p.field_name,
            adminId: p.admin_id,
            adminName: p.admin_name,
            month: `${p.year}-${String(p.month).padStart(2, '0')}`,
            dueDate: p.due_date,
            amount: parseFloat(p.amount) || 0,
            status: p.status,
            paidDate: p.paid_at,
            paidAmount: parseFloat(p.paid_amount) || 0,
            paymentMethod: p.payment_method,
            operationNumber: p.payment_reference,
            notes: p.notes,
          }))

          set({ payments })
          return payments
        } catch (error) {
          console.error('Error cargando monthly payments:', error)
          return []
        }
      },

      /**
       * Generar pagos mensuales via API
       */
      generateMonthlyPaymentsAPI: async (year, month) => {
        try {
          const token = useAuthStore.getState().token
          if (!token) throw new Error('No autenticado')

          const response = await fetch(`${API_URL}/api/monthly-payments/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ month, year }),
          })

          const data = await response.json()
          if (data.success) {
            // Recargar pagos
            await get().loadMonthlyPaymentsFromAPI(month, year)
            return data.data.generated.length
          }
          return 0
        } catch (error) {
          console.error('Error generando pagos:', error)
          return 0
        }
      },

      /**
       * Registrar pago via API
       */
      registerPaymentAPI: async (paymentId, paymentData) => {
        try {
          const token = useAuthStore.getState().token
          if (!token) throw new Error('No autenticado')

          const response = await fetch(`${API_URL}/api/monthly-payments/${paymentId}/pay`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              payment_method: paymentData.paymentMethod,
              payment_reference: paymentData.operationNumber,
              paid_amount: paymentData.amount,
              notes: paymentData.notes,
            }),
          })

          const data = await response.json()
          return data.success
        } catch (error) {
          console.error('Error registrando pago:', error)
          return false
        }
      },

      // ============================================
      // CONFIGURACIÓN DE PAGOS POR CANCHA
      // ============================================

      // Crear o actualizar configuración de pago para una cancha
      setPaymentConfig: (fieldId, config) => {
        const { paymentConfigs } = get()
        const existingIndex = paymentConfigs.findIndex((c) => c.fieldId === fieldId)

        if (existingIndex >= 0) {
          // Actualizar existente
          set({
            paymentConfigs: paymentConfigs.map((c, i) =>
              i === existingIndex ? { ...c, ...config, fieldId } : c
            ),
          })
        } else {
          // Crear nuevo
          set({
            paymentConfigs: [...paymentConfigs, { fieldId, ...config }],
          })
        }
      },

      // Obtener configuración de una cancha
      getPaymentConfig: (fieldId) => {
        const { paymentConfigs } = get()
        return paymentConfigs.find((c) => c.fieldId === fieldId)
      },

      // Obtener todas las configuraciones
      getAllPaymentConfigs: () => {
        return get().paymentConfigs
      },

      // Eliminar configuración
      deletePaymentConfig: (fieldId) => {
        set((state) => ({
          paymentConfigs: state.paymentConfigs.filter((c) => c.fieldId !== fieldId),
        }))
      },

      // ============================================
      // GESTIÓN DE PAGOS MENSUALES
      // ============================================

      // Generar pagos pendientes para un mes específico (ejecutar cada mes)
      generateMonthlyPayments: (year, month) => {
        const { paymentConfigs, payments } = get()
        const monthKey = `${year}-${String(month).padStart(2, '0')}`

        const newPayments = []

        paymentConfigs
          .filter((config) => config.isActive)
          .forEach((config) => {
            // Verificar si ya existe un pago para este mes y cancha
            const existingPayment = payments.find(
              (p) => p.fieldId === config.fieldId && p.month === monthKey
            )

            if (!existingPayment) {
              // Crear pago pendiente
              const dueDate = new Date(year, month - 1, config.dueDay)

              newPayments.push({
                id: `payment-${config.fieldId}-${monthKey}-${Date.now()}`,
                fieldId: config.fieldId,
                fieldName: config.fieldName,
                adminId: config.adminId,
                month: monthKey,
                dueDate: dueDate.toISOString(),
                amount: config.monthlyFee,
                status: 'pending', // pending, paid
                paidDate: null,
                paymentMethod: null,
                operationNumber: null,
                notes: '',
                registeredBy: null,
                createdAt: new Date().toISOString(),
              })
            }
          })

        if (newPayments.length > 0) {
          set((state) => ({
            payments: [...state.payments, ...newPayments],
          }))
        }

        return newPayments.length
      },

      // Registrar un pago (marcar como pagado)
      registerPayment: (paymentId, paymentData, registeredBy) => {
        set((state) => ({
          payments: state.payments.map((p) =>
            p.id === paymentId
              ? {
                  ...p,
                  status: 'paid',
                  paidDate: paymentData.paidDate || new Date().toISOString(),
                  paymentMethod: paymentData.paymentMethod,
                  operationNumber: paymentData.operationNumber || '',
                  notes: paymentData.notes || '',
                  registeredBy: registeredBy,
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }))
      },

      // Obtener todos los pagos de un mes específico
      getPaymentsByMonth: (year, month) => {
        const { payments } = get()
        const monthKey = `${year}-${String(month).padStart(2, '0')}`
        return payments.filter((p) => p.month === monthKey)
      },

      // Obtener pagos de una cancha específica
      getPaymentsByField: (fieldId) => {
        const { payments } = get()
        return payments
          .filter((p) => p.fieldId === fieldId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      },

      // Obtener pagos de un admin específico
      getPaymentsByAdmin: (adminId) => {
        const { payments } = get()
        return payments
          .filter((p) => p.adminId === adminId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      },

      // Obtener estado actual de pago de un admin
      getAdminCurrentPaymentStatus: (adminId) => {
        const { payments, paymentConfigs } = get()
        const today = new Date()
        const currentYear = today.getFullYear()
        const currentMonth = today.getMonth() + 1
        const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

        // Buscar configuración del admin
        const config = paymentConfigs.find((c) => c.adminId === adminId && c.isActive)

        if (!config) {
          return {
            hasConfig: false,
            status: 'no_config',
            message: 'No hay configuración de pago',
          }
        }

        // Buscar pago del mes actual
        const currentPayment = payments.find((p) => p.adminId === adminId && p.month === monthKey)

        if (!currentPayment) {
          return {
            hasConfig: true,
            status: 'not_generated',
            message: 'Pago no generado para este mes',
            config,
          }
        }

        // Calcular estado del pago
        const status = calculatePaymentStatus(currentPayment, config.dueDay)

        if (status === 'paid') {
          return {
            hasConfig: true,
            status: 'paid',
            message: 'Pago al día',
            payment: currentPayment,
            config,
            daysLate: 0,
          }
        }

        if (status.startsWith('overdue_')) {
          const daysLate = parseInt(status.split('_')[1])
          return {
            hasConfig: true,
            status: 'overdue',
            message: `Pago atrasado ${daysLate} días`,
            payment: currentPayment,
            config,
            daysLate,
          }
        }

        // Calcular días restantes para vencer
        const dueDate = new Date(currentPayment.dueDate)
        const daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24))

        return {
          hasConfig: true,
          status: 'pending',
          message: daysRemaining > 0 ? `Vence en ${daysRemaining} días` : 'Vence hoy',
          payment: currentPayment,
          config,
          daysRemaining,
        }
      },

      // ============================================
      // MÉTRICAS Y ESTADÍSTICAS
      // ============================================

      // Obtener métricas del mes actual
      getCurrentMonthMetrics: () => {
        const { payments, paymentConfigs } = get()
        const today = new Date()
        const currentYear = today.getFullYear()
        const currentMonth = today.getMonth() + 1
        const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

        const monthPayments = payments.filter((p) => p.month === monthKey)

        const totalExpected = paymentConfigs
          .filter((c) => c.isActive)
          .reduce((sum, c) => sum + (c.monthlyFee || 0), 0)

        const totalPaid = monthPayments
          .filter((p) => p.status === 'paid')
          .reduce((sum, p) => sum + (p.amount || 0), 0)

        const totalPending = monthPayments
          .filter((p) => p.status === 'pending')
          .reduce((sum, p) => sum + (p.amount || 0), 0)

        const paidCount = monthPayments.filter((p) => p.status === 'paid').length
        const pendingCount = monthPayments.filter((p) => p.status === 'pending').length

        // Calcular cuántos están atrasados
        const overdueCount = monthPayments.filter((p) => {
          if (p.status !== 'pending') return false
          const config = paymentConfigs.find((c) => c.fieldId === p.fieldId)
          if (!config) return false
          const status = calculatePaymentStatus(p, config.dueDay)
          return status.startsWith('overdue_')
        }).length

        return {
          month: monthKey,
          totalExpected,
          totalPaid,
          totalPending,
          paidCount,
          pendingCount,
          overdueCount,
          totalFields: paymentConfigs.filter((c) => c.isActive).length,
          collectionRate: totalExpected > 0 ? (totalPaid / totalExpected) * 100 : 0,
        }
      },

      // Obtener historial de ingresos por mes
      getMonthlyRevenue: (months = 12) => {
        const { payments } = get()
        const today = new Date()
        const revenue = []

        for (let i = 0; i < months; i++) {
          const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
          const year = date.getFullYear()
          const month = date.getMonth() + 1
          const monthKey = `${year}-${String(month).padStart(2, '0')}`

          const monthPayments = payments.filter((p) => p.month === monthKey && p.status === 'paid')
          const total = monthPayments.reduce((sum, p) => sum + (p.amount || 0), 0)

          revenue.unshift({
            month: monthKey,
            total,
            count: monthPayments.length,
          })
        }

        return revenue
      },

      // Obtener todas las canchas con deuda
      getFieldsWithDebt: () => {
        const { payments, paymentConfigs } = get()
        const today = new Date()
        const fieldsWithDebt = []

        paymentConfigs
          .filter((c) => c.isActive)
          .forEach((config) => {
            const fieldPayments = payments.filter(
              (p) => p.fieldId === config.fieldId && p.status === 'pending'
            )

            const overduePayments = fieldPayments.filter((p) => {
              const status = calculatePaymentStatus(p, config.dueDay)
              return status.startsWith('overdue_')
            })

            if (overduePayments.length > 0) {
              const totalDebt = overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0)
              const maxDaysLate = Math.max(
                ...overduePayments.map((p) => {
                  const status = calculatePaymentStatus(p, config.dueDay)
                  return parseInt(status.split('_')[1])
                })
              )

              fieldsWithDebt.push({
                ...config,
                totalDebt,
                overdueCount: overduePayments.length,
                maxDaysLate,
              })
            }
          })

        return fieldsWithDebt.sort((a, b) => b.maxDaysLate - a.maxDaysLate)
      },

      // ============================================
      // UTILIDADES
      // ============================================

      // Limpiar datos (para desarrollo/testing)
      clearAllPayments: () => {
        set({ payments: [] })
      },

      clearAllConfigs: () => {
        set({ paymentConfigs: [] })
      },
    }),
    {
      name: 'payment-storage',
      version: 1,
    }
  )
)

export default usePaymentStore
export { calculatePaymentStatus }
