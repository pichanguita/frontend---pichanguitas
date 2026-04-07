import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  fetchMyClients,
  fetchCustomerById,
  fetchCustomerByPhone,
  createCustomerAPI,
  updateCustomerAPI,
  updateCustomerStatsAPI,
  deleteCustomerAPI,
} from '../services/customers/customersService'

// Función para normalizar números de teléfono (Perú)
const normalizePhoneNumber = (phone) => {
  if (!phone) return ''

  // Eliminar todos los caracteres no numéricos
  let cleaned = phone.replace(/\D/g, '')

  // Si empieza con 51 (código de Perú), mantenerlo
  if (cleaned.startsWith('51')) {
    cleaned = cleaned.substring(2)
  }

  // Si es un número móvil (9 dígitos empezando con 9)
  if (cleaned.length === 9 && cleaned.startsWith('9')) {
    return cleaned
  }

  // Si tiene 9 dígitos pero no empieza con 9, podría ser un error
  if (cleaned.length === 9) {
    return cleaned
  }

  // Si tiene menos o más de 9 dígitos, devolver tal cual para validación posterior
  return cleaned
}

const useCustomerStore = create(
  persist(
    (set, get) => ({
      customers: [],
      isLoading: false,
      error: null,

      // ==================== API FUNCTIONS ====================

      /**
       * Cargar clientes desde el backend (mis clientes - basado en reservas)
       */
      loadCustomers: async () => {
        set({ isLoading: true, error: null })
        try {
          const customers = await fetchMyClients()
          set({ customers, isLoading: false })
          return customers
        } catch (error) {
          set({ error: error.message, isLoading: false })
          console.error('Error cargando clientes:', error)
          return []
        }
      },

      /**
       * Obtener cliente por ID desde backend
       */
      getCustomerByIdAPI: async (customerId) => {
        try {
          return await fetchCustomerById(customerId)
        } catch (error) {
          console.error('Error obteniendo cliente:', error)
          return null
        }
      },

      /**
       * Buscar cliente por teléfono desde backend
       */
      getCustomerByPhoneAPI: async (phone) => {
        try {
          return await fetchCustomerByPhone(phone)
        } catch (error) {
          console.error('Error buscando cliente:', error)
          return null
        }
      },

      /**
       * Crear cliente en backend
       */
      createCustomerAPI: async (customerData, token) => {
        set({ isLoading: true, error: null })
        try {
          const newCustomer = await createCustomerAPI(customerData, token)
          set((state) => ({
            customers: [...state.customers, newCustomer],
            isLoading: false,
          }))
          return newCustomer
        } catch (error) {
          set({ error: error.message, isLoading: false })
          console.error('Error creando cliente:', error)
          throw error
        }
      },

      /**
       * Actualizar cliente en backend
       */
      updateCustomerAPI: async (customerId, updates, token) => {
        set({ isLoading: true, error: null })
        try {
          const updatedCustomer = await updateCustomerAPI(customerId, updates, token)
          set((state) => ({
            customers: state.customers.map((c) => (c.id === customerId ? updatedCustomer : c)),
            isLoading: false,
          }))
          return updatedCustomer
        } catch (error) {
          set({ error: error.message, isLoading: false })
          console.error('Error actualizando cliente:', error)
          throw error
        }
      },

      /**
       * Actualizar estadísticas en backend
       */
      updateCustomerStatsAPI: async (customerId, stats, token) => {
        try {
          const updatedCustomer = await updateCustomerStatsAPI(customerId, stats, token)
          set((state) => ({
            customers: state.customers.map((c) => (c.id === customerId ? updatedCustomer : c)),
          }))
          return updatedCustomer
        } catch (error) {
          console.error('Error actualizando estadísticas:', error)
          throw error
        }
      },

      /**
       * Eliminar cliente en backend
       */
      deleteCustomerAPI: async (customerId, token) => {
        set({ isLoading: true, error: null })
        try {
          await deleteCustomerAPI(customerId, token)
          set((state) => ({
            customers: state.customers.filter((c) => c.id !== customerId),
            isLoading: false,
          }))
          return true
        } catch (error) {
          set({ error: error.message, isLoading: false })
          console.error('Error eliminando cliente:', error)
          throw error
        }
      },

      // ==================== LOCAL FUNCTIONS (LEGACY) ====================

      // Obtener o crear cliente por teléfono
      getOrCreateCustomer: (phoneNumber, customerName = '', createdBy = null) => {
        const normalizedPhone = normalizePhoneNumber(phoneNumber)

        if (!normalizedPhone || normalizedPhone.length !== 9) {
          console.error('Número de teléfono inválido:', phoneNumber)
          return null
        }

        const { customers } = get()

        // Buscar cliente existente por teléfono normalizado
        let customer = customers.find((c) => c.phoneNumber === normalizedPhone)

        if (!customer) {
          // Crear nuevo cliente
          customer = {
            id: `customer-${normalizedPhone}-${Date.now()}`,
            phoneNumber: normalizedPhone,
            name: customerName || `Cliente ${normalizedPhone}`,
            createdAt: new Date().toISOString(),
            createdBy: createdBy, // ID del admin que registró al cliente

            // Estadísticas de reservas
            totalReservations: 0,
            totalHours: 0,
            totalSpent: 0,

            // Datos de promociones
            earnedFreeHours: 0,
            usedFreeHours: 0,
            availableFreeHours: 0,

            // Historial
            reservationHistory: [],
            promotionHistory: [],

            // Información adicional
            email: null,
            notes: '',
            lastReservation: null,
            isVIP: false,
          }

          set((state) => ({
            customers: [...state.customers, customer],
          }))
        } else if (customerName && customer.name === `Cliente ${normalizedPhone}`) {
          // Actualizar nombre si era genérico y ahora tenemos uno real
          customer.name = customerName
          set((state) => ({
            customers: state.customers.map((c) =>
              c.id === customer.id ? { ...c, name: customerName } : c
            ),
          }))
        }

        return customer
      },

      // Actualizar estadísticas del cliente después de una reserva
      updateCustomerStats: (phoneNumber, reservationData) => {
        const normalizedPhone = normalizePhoneNumber(phoneNumber)
        const { customers } = get()

        const customer = customers.find((c) => c.phoneNumber === normalizedPhone)
        if (!customer) return

        const updatedCustomer = {
          ...customer,
          totalReservations: customer.totalReservations + 1,
          totalHours: customer.totalHours + (reservationData.duration || 1),
          totalSpent: customer.totalSpent + (reservationData.totalAmount || 0),
          lastReservation: new Date().toISOString(),
          reservationHistory: [
            ...customer.reservationHistory,
            {
              id: reservationData.id || `res-${Date.now()}`,
              date: reservationData.date,
              fieldName: reservationData.fieldName,
              startTime: reservationData.startTime,
              endTime: reservationData.endTime,
              duration: reservationData.duration || 1,
              amount: reservationData.totalAmount || 0,
              status: reservationData.status || 'confirmed',
              createdAt: new Date().toISOString(),
            },
          ].slice(-50), // Mantener solo las últimas 50 reservas
        }

        set((state) => ({
          customers: state.customers.map((c) => (c.id === customer.id ? updatedCustomer : c)),
        }))

        return updatedCustomer
      },

      // Calcular y actualizar horas gratis según las reglas de promoción
      calculateFreeHours: (phoneNumber, promotionRules) => {
        const normalizedPhone = normalizePhoneNumber(phoneNumber)
        const { customers } = get()

        const customer = customers.find((c) => c.phoneNumber === normalizedPhone)
        if (!customer) return

        let totalEarnedHours = 0

        // Aplicar cada regla activa
        promotionRules
          .filter((rule) => rule.isActive)
          .forEach((rule) => {
            // Calcular cuántos sets completos tiene el cliente
            const completeSets = Math.floor(customer.totalHours / rule.hoursRequired)
            const earnedFromThisRule = completeSets * rule.freeHours
            totalEarnedHours += earnedFromThisRule
          })

        const updatedCustomer = {
          ...customer,
          earnedFreeHours: totalEarnedHours,
          availableFreeHours: totalEarnedHours - customer.usedFreeHours,
        }

        set((state) => ({
          customers: state.customers.map((c) => (c.id === customer.id ? updatedCustomer : c)),
        }))

        return updatedCustomer
      },

      // Usar horas gratis
      useFreeHours: (phoneNumber, hoursToUse) => {
        const normalizedPhone = normalizePhoneNumber(phoneNumber)
        const { customers } = get()

        const customer = customers.find((c) => c.phoneNumber === normalizedPhone)
        if (!customer || customer.availableFreeHours < hoursToUse) {
          return false
        }

        const updatedCustomer = {
          ...customer,
          usedFreeHours: customer.usedFreeHours + hoursToUse,
          availableFreeHours: customer.availableFreeHours - hoursToUse,
          promotionHistory: [
            ...customer.promotionHistory,
            {
              id: `promo-${Date.now()}`,
              type: 'redemption',
              hoursRedeemed: hoursToUse,
              date: new Date().toISOString(),
              remainingHours: customer.availableFreeHours - hoursToUse,
            },
          ],
        }

        set((state) => ({
          customers: state.customers.map((c) => (c.id === customer.id ? updatedCustomer : c)),
        }))

        return true
      },

      // Obtener cliente por teléfono
      getCustomerByPhone: (phoneNumber) => {
        const normalizedPhone = normalizePhoneNumber(phoneNumber)
        const { customers } = get()
        return customers.find((c) => c.phoneNumber === normalizedPhone)
      },

      // Obtener todos los clientes
      getAllCustomers: () => {
        return get().customers
      },

      // Obtener clientes por admin (filtrados por createdBy)
      getCustomersByAdmin: (adminId) => {
        const { customers } = get()
        return customers.filter((c) => c.createdBy === adminId)
      },

      // Actualizar información del cliente
      updateCustomer: (customerId, updates) => {
        set((state) => ({
          customers: state.customers.map((c) => (c.id === customerId ? { ...c, ...updates } : c)),
        }))
      },

      // Marcar cliente como VIP
      toggleVIPStatus: (customerId) => {
        const { customers } = get()
        const customer = customers.find((c) => c.id === customerId)
        if (!customer) return

        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === customerId ? { ...c, isVIP: !c.isVIP } : c
          ),
        }))
      },

      // Obtener estadísticas generales
      getCustomerStats: () => {
        const { customers } = get()

        return {
          totalCustomers: customers.length,
          vipCustomers: customers.filter((c) => c.isVIP).length,
          activeCustomers: customers.filter((c) => {
            if (!c.lastReservation) return false
            const lastDate = new Date(c.lastReservation)
            const thirtyDaysAgo = new Date()
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
            return lastDate > thirtyDaysAgo
          }).length,
          totalHoursBooked: customers.reduce((sum, c) => sum + c.totalHours, 0),
          totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
          totalFreeHoursAvailable: customers.reduce((sum, c) => sum + c.availableFreeHours, 0),
        }
      },

      // Limpiar datos (para desarrollo/testing)
      clearAllCustomers: () => {
        set({ customers: [] })
      },
    }),
    {
      name: 'customer-storage',
      version: 1,
    }
  )
)

export default useCustomerStore
export { normalizePhoneNumber }
