import { create } from 'zustand'
import { parseLocalDate } from '../../utils/dateFormatters'
import { isFieldReservableOnDate } from '../../utils/fieldMaintenance'
import {
  fetchFields,
  fetchFieldById,
  createFieldAPI,
  updateFieldAPI,
  deleteFieldAPI,
  approveFieldAPI,
  rejectFieldAPI,
} from '../../services/field/fieldService'
import { API_CONFIG } from '../../config/api.config'
import {
  fetchSportTypes,
  createSportTypeAPI,
  updateSportTypeAPI,
  deleteSportTypeAPI,
} from '../../services/sportTypes/sportTypesService'
import useAuthStore from '../authStore'
import useAlertStore from '../alertStore'

/**
 * Field Store
 * Maneja toda la gestión de canchas deportivas:
 * - CRUD de canchas
 * - Aprobación/rechazo de canchas
 * - Filtrado y disponibilidad
 * - Gestión de tipos de deporte
 * INTEGRADO CON BACKEND
 */
const useFieldStore = create((set, get) => ({
  // Array de todas las canchas
  fields: [],

  // Tipos de deportes disponibles
  sportTypes: [],

  // Estado de las canchas disponibles (filtradas)
  availableFields: [],

  // Estado de carga
  isLoading: false,
  error: null,

  /**
   * Cargar todas las canchas desde el backend
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Array de canchas
   */
  loadFields: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const fields = await fetchFields(filters)
      set({ fields, isLoading: false })
      return fields
    } catch (error) {
      console.error('Error cargando canchas:', error.message)
      set({ error: error.message, isLoading: false })
      return []
    }
  },

  /**
   * Obtener todas las canchas (desde el estado)
   * @returns {Array} Array de canchas
   */
  getAllFields: () => {
    return get().fields
  },

  /**
   * Obtener cancha por ID desde el backend
   * @param {string} fieldId - ID de la cancha
   * @returns {Promise<Object|null>} Cancha o null
   */
  getFieldById: async (fieldId) => {
    // Primero buscar en el estado local
    const { fields } = get()
    const localField = fields.find((f) => f.id === fieldId)
    if (localField) return localField

    // Si no está, obtener del backend
    try {
      const field = await fetchFieldById(fieldId)
      // Actualizar el estado local con la cancha obtenida
      if (field) {
        set({ fields: [...fields, field] })
      }
      return field
    } catch (error) {
      console.error('Error obteniendo cancha:', error)
      return null
    }
  },

  /**
   * Obtener canchas visibles (aprobadas y activas)
   * @returns {Array} Array de canchas visibles
   */
  getVisibleFields: () => {
    const { fields } = get()

    try {
      if (!Array.isArray(fields)) return []

      // Retornar solo canchas disponibles
      return fields.filter(
        (field) =>
          field.status === 'available' &&
          field.isActive !== false &&
          (field.approvalStatus === 'approved' || !field.approvalStatus)
      )
    } catch (error) {
      console.error('Error in getVisibleFields:', error)
      return []
    }
  },

  /**
   * Agregar nueva cancha (integrado con backend)
   * @param {Object} fieldData - Datos de la cancha
   * @param {Object} _createdBy - Usuario que crea la cancha (unused, kept for API compatibility)
   * @returns {Promise<Object>} Cancha creada
   */
  addField: async (fieldData, _createdBy = null) => {
    const { fields } = get()
    set({ isLoading: true, error: null })

    try {
      // Obtener token del authStore
      const token = useAuthStore.getState().token

      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      // Llamar a la API para crear la cancha
      const newField = await createFieldAPI(fieldData, token)

      // Subir imágenes si existen
      if (fieldData.imageFiles && fieldData.imageFiles.length > 0) {
        const imageCategories = fieldData.images || []

        for (let i = 0; i < fieldData.imageFiles.length; i++) {
          const file = fieldData.imageFiles[i]
          const categoryInfo = imageCategories[i] || {}

          try {
            const formData = new FormData()
            formData.append('image', file)
            formData.append('field_id', newField.id)
            formData.append('category', categoryInfo.category || 'general')
            formData.append('is_primary', i === 0 ? 'true' : 'false')
            formData.append('order_index', i.toString())

            const response = await fetch(API_CONFIG.FIELD_IMAGES.UPLOAD, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            })

            if (response.ok) {
              await response.json()
            }
          } catch {
            // Error subiendo imagen
          }
        }
      }

      // Actualizar el estado local
      const updatedFields = [...fields, newField]
      set({ fields: updatedFields, isLoading: false })

      return newField
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Actualizar cancha existente (integrado con backend)
   * @param {string} fieldId - ID de la cancha
   * @param {Object} updates - Datos a actualizar
   * @returns {Promise<boolean>} True si se actualizó
   */
  updateField: async (fieldId, updates) => {
    const { fields } = get()
    set({ isLoading: true, error: null })

    try {
      // Obtener token del authStore
      const token = useAuthStore.getState().token

      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      // Llamar a la API para actualizar la cancha
      const updatedField = await updateFieldAPI(fieldId, updates, token)

      // Actualizar el estado local
      const updatedFields = fields.map((field) => (field.id === fieldId ? updatedField : field))

      set({ fields: updatedFields, isLoading: false })
      return true
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Actualizar cancha solo en el estado local (sin llamar a la API)
   * Útil cuando la API ya fue llamada y solo necesitamos sincronizar el estado
   * @param {string} fieldId - ID de la cancha
   * @param {Object} updatedField - Datos actualizados de la cancha
   */
  updateFieldLocal: (fieldId, updatedField) => {
    const { fields } = get()
    const updatedFields = fields.map((field) =>
      field.id === fieldId ? { ...field, ...updatedField } : field
    )
    set({ fields: updatedFields })
  },

  /**
   * Eliminar cancha (integrado con backend)
   * @param {string} fieldId - ID de la cancha
   * @returns {Promise<boolean>} True si se eliminó
   */
  deleteField: async (fieldId) => {
    const { fields } = get()
    set({ isLoading: true, error: null })

    try {
      // Obtener token del authStore
      const token = useAuthStore.getState().token

      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      // Llamar a la API para eliminar la cancha (soft delete)
      await deleteFieldAPI(fieldId, token)

      // Actualizar el estado local (remover de la lista)
      set({ fields: fields.filter((f) => f.id !== fieldId), isLoading: false })
      return true
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Aprobar cancha (integrado con backend)
   * @param {string} fieldId - ID de la cancha
   * @param {Object} _approvedBy - Usuario que aprueba (unused, kept for API compatibility)
   * @returns {Promise<boolean>} True si se aprobó
   */
  approveField: async (fieldId, _approvedBy) => {
    const { fields } = get()
    set({ isLoading: true, error: null })

    try {
      // Obtener token del authStore
      const token = useAuthStore.getState().token

      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      // Llamar a la API para aprobar la cancha
      const approvedField = await approveFieldAPI(fieldId, token)

      // Actualizar el estado local
      const updatedFields = fields.map((field) => (field.id === fieldId ? approvedField : field))

      set({ fields: updatedFields, isLoading: false })

      // ✅ Recargar alertas para eliminar las de aprobación pendiente
      useAlertStore.getState().loadAlerts()

      return true
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Rechazar cancha (integrado con backend)
   * @param {string} fieldId - ID de la cancha
   * @param {Object} _rejectedBy - Usuario que rechaza (unused, kept for API compatibility)
   * @param {string} reason - Razón del rechazo
   * @returns {Promise<boolean>} True si se rechazó
   */
  rejectField: async (fieldId, _rejectedBy, reason = '') => {
    const { fields } = get()
    set({ isLoading: true, error: null })

    try {
      // Obtener token del authStore
      const token = useAuthStore.getState().token

      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      // Llamar a la API para rechazar la cancha
      const rejectedField = await rejectFieldAPI(fieldId, reason, token)

      // Actualizar el estado local
      const updatedFields = fields.map((field) => (field.id === fieldId ? rejectedField : field))

      set({ fields: updatedFields, isLoading: false })

      // ✅ Recargar alertas para eliminar las de aprobación pendiente
      useAlertStore.getState().loadAlerts()

      return true
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Obtener canchas por estado de aprobación
   * @param {string} status - Estado: 'pending', 'approved', 'rejected'
   * @returns {Array} Canchas filtradas
   */
  getFieldsByApprovalStatus: (status) => {
    const { fields } = get()
    return fields.filter((field) => field.approvalStatus === status)
  },

  /**
   * Actualizar rating y reseñas de una cancha
   * @param {string} fieldId - ID de la cancha
   * @param {number} rating - Nuevo rating
   * @param {number} totalReviews - Total de reseñas
   * @returns {boolean} True si se actualizó
   */
  updateFieldRating: (fieldId, rating, totalReviews) => {
    return get().updateField(fieldId, { rating, totalReviews })
  },

  /**
   * Filtrar canchas disponibles por criterios
   * @param {Object} filters - Filtros { district, sportType, date }
   * @returns {Array} Canchas filtradas
   */
  filterAvailableFields: (filters) => {
    const { fields } = get()
    const { district, sportTypes, date } = filters

    // Verificar que los filtros básicos estén presentes
    // sportTypes ahora es un array
    if (!district || !sportTypes || sportTypes.length === 0 || !date) {
      set({ availableFields: [] })
      return []
    }

    const filteredFields = fields.filter((field) => {
      try {
        // 1. Verificar distrito (normalizado - case insensitive)
        const normalizedFieldDistrict = field.distrito?.toString().trim().toLowerCase()
        const normalizedSearchDistrict = district?.toString().trim().toLowerCase()

        if (normalizedFieldDistrict !== normalizedSearchDistrict) {
          return false
        }

        // 2. Filtrar por tipo de deporte (ahora acepta múltiples deportes)
        // sportTypes es un array de IDs de deportes seleccionados
        const fieldSportTypeId = parseInt(field.sportType)

        // Verificar si la cancha es multiuso (acepta cualquier deporte)
        if (field.fieldType === 'multiuso') {
          // Canchas multiuso siempre pasan el filtro de deporte
        } else if (!isNaN(fieldSportTypeId)) {
          // Verificar si el deporte de la cancha está en la lista de deportes seleccionados
          const matchesSport = sportTypes.some((sportId) => parseInt(sportId) === fieldSportTypeId)
          if (!matchesSport) {
            return false
          }
        } else {
          // Fallback: comparación legacy por nombre o valor directo
          if (field.sportTypes && Array.isArray(field.sportTypes)) {
            const matchesLegacy = sportTypes.some((sportId) => field.sportTypes.includes(sportId))
            if (!matchesLegacy) {
              return false
            }
          } else {
            const matchesLegacy = sportTypes.some((sportId) => field.sportType === sportId)
            if (!matchesLegacy && field.sportType !== 'multiuso') {
              return false
            }
          }
        }

        // 3. Verificar estado contra la fecha solicitada.
        // Estados administrativos (closed/pending/etc.) excluyen siempre.
        // Para mantenimiento, se compara la fecha pedida contra los rangos
        // programados — una cancha "en mantenimiento HOY" sigue siendo
        // reservable si la fecha pedida está fuera del rango.
        if (!isFieldReservableOnDate(field, date)) {
          return false
        }

        // 4. Verificar si está activa
        if (!field.isActive) {
          return false
        }

        // 5. Solo mostrar canchas aprobadas
        if (field.approvalStatus && field.approvalStatus !== 'approved') {
          return false
        }

        // 6. Verificar horario de operación (solo si tiene schedule configurado)
        if (field.schedule) {
          const dayOfWeek = parseLocalDate(date)
            .toLocaleDateString('en-US', { weekday: 'long' })
            .toLowerCase()
          const schedule = field.schedule[dayOfWeek]

          if (!schedule || !schedule.isOpen) {
            return false
          }
        }

        return true
      } catch {
        return false
      }
    })

    set({ availableFields: filteredFields })
    return filteredFields
  },

  /**
   * Verificar si una cancha está disponible en fecha/hora específica
   * @param {string} fieldId - ID de la cancha
   * @param {string} date - Fecha
   * @param {string} timeSlot - Slot de tiempo
   * @param {Array} existingReservations - Reservas existentes
   * @returns {boolean} True si está disponible
   */
  isFieldAvailable: (fieldId, date, timeSlot, existingReservations) => {
    const field = get().getFieldById(fieldId)

    if (!field || !field.isActive || !isFieldReservableOnDate(field, date)) {
      return false
    }

    // Verificar horario de operación
    if (field.schedule) {
      const dayOfWeek = parseLocalDate(date)
        .toLocaleDateString('en-US', { weekday: 'long' })
        .toLowerCase()
      const schedule = field.schedule[dayOfWeek]

      if (!schedule || !schedule.isOpen) return false
    }

    // Verificar que no haya reserva existente
    const hasConflict = existingReservations.some(
      (reservation) =>
        reservation.fieldId === fieldId &&
        reservation.date === date &&
        reservation.time === timeSlot &&
        reservation.status !== 'cancelled'
    )

    return !hasConflict
  },

  /**
   * Obtener canchas por deporte
   * @param {string} sportType - Tipo de deporte
   * @returns {Array} Canchas que soportan ese deporte
   */
  getFieldsBySport: (sportType) => {
    const { fields } = get()

    return fields.filter((field) => {
      if (field.sportTypes && Array.isArray(field.sportTypes)) {
        return field.sportTypes.includes(sportType)
      }
      return field.sportType === sportType || field.sportType === 'multiuso'
    })
  },

  /**
   * Obtener canchas por ubicación
   * @param {Object} location - { department, province, district }
   * @returns {Array} Canchas en esa ubicación
   */
  getFieldsByLocation: (location) => {
    const { fields } = get()
    const { department, province, district } = location

    return fields.filter((field) => {
      if (department && field.departamento !== department) return false
      if (province && field.provincia !== province) return false
      if (district && field.distrito !== district) return false
      return true
    })
  },

  // ==================== SPORTS MANAGEMENT ====================

  /**
   * Cargar tipos de deportes desde el backend
   * @returns {Promise<Array>} Array de tipos de deportes
   */
  loadSportTypes: async () => {
    set({ isLoading: true, error: null })
    try {
      const sportTypes = await fetchSportTypes()
      set({ sportTypes, isLoading: false })
      return sportTypes
    } catch (error) {
      set({ error: error.message, isLoading: false })
      return []
    }
  },

  /**
   * Agregar nuevo tipo de deporte (super admin) - Integrado con backend
   * @param {Object} sportData - Datos del deporte
   * @returns {Promise<Object>} Tipo de deporte creado
   */
  addSportType: async (sportData) => {
    const { sportTypes } = get()
    set({ isLoading: true, error: null })

    try {
      // Obtener token del authStore
      const token = useAuthStore.getState().token

      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      // Llamar a la API para crear el tipo de deporte
      const newSport = await createSportTypeAPI(sportData, token)

      // Actualizar el estado local
      set({ sportTypes: [...sportTypes, newSport], isLoading: false })

      return newSport
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Actualizar tipo de deporte - Integrado con backend
   * @param {string} sportId - ID del deporte
   * @param {Object} updates - Actualizaciones
   * @returns {Promise<Object>} Tipo de deporte actualizado
   */
  updateSportType: async (sportId, updates) => {
    const { sportTypes } = get()
    set({ isLoading: true, error: null })

    try {
      // Obtener token del authStore
      const token = useAuthStore.getState().token

      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      // Llamar a la API para actualizar el tipo de deporte
      const updatedSport = await updateSportTypeAPI(sportId, updates, token)

      // Actualizar el estado local
      const updatedSports = sportTypes.map((sport) => (sport.id === sportId ? updatedSport : sport))

      set({ sportTypes: updatedSports, isLoading: false })
      return updatedSport
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Eliminar tipo de deporte - Integrado con backend
   * @param {string} sportId - ID del deporte
   * @returns {Promise<boolean>} True si se eliminó
   */
  deleteSportType: async (sportId) => {
    const { sportTypes } = get()
    set({ isLoading: true, error: null })

    try {
      // Obtener token del authStore
      const token = useAuthStore.getState().token

      if (!token) {
        throw new Error('No hay token de autenticación')
      }

      // Llamar a la API para eliminar el tipo de deporte (soft delete)
      await deleteSportTypeAPI(sportId, token)

      // Actualizar el estado local (remover de la lista)
      set({ sportTypes: sportTypes.filter((sport) => sport.id !== sportId), isLoading: false })
      return true
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Obtener tipo de deporte por ID
   * @param {string} sportId - ID del deporte
   * @returns {Object|null} Deporte o null
   */
  getSportTypeById: (sportId) => {
    const { sportTypes } = get()
    return sportTypes.find((sport) => sport.id === sportId) || null
  },

  /**
   * Obtener todos los tipos de deportes
   * @returns {Array} Array de deportes
   */
  getAllSportTypes: () => {
    return get().sportTypes
  },

  /**
   * Resetear campos disponibles
   */
  resetAvailableFields: () => {
    set({ availableFields: [] })
  },
}))

export default useFieldStore
