import { create } from 'zustand'
import {
  fetchBlacklist,
  fetchBlacklistById,
  checkBlacklistAPI,
  addToBlacklistAPI,
  unblockBlacklistAPI,
} from '../../services/blacklist/blacklistService'
import useAuthStore from '../authStore'

/**
 * Blacklist Store
 * Maneja la lista negra de usuarios bloqueados por no-shows o mal comportamiento
 * INTEGRADO CON BACKEND
 */
const useBlacklistStore = create((set, get) => ({
  // Lista de usuarios bloqueados
  blacklist: [],

  // Estado de carga
  isLoading: false,
  error: null,

  // ==================== API FUNCTIONS ====================

  /**
   * Cargar blacklist desde el backend
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Array de blacklist
   */
  loadBlacklist: async (filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const blacklist = await fetchBlacklist(filters)
      set({ blacklist, isLoading: false })
      return blacklist
    } catch (error) {
      set({ error: error.message, isLoading: false })
      console.error('Error cargando blacklist:', error)
      return []
    }
  },

  /**
   * Obtener entrada de blacklist por ID desde el backend
   * @param {string} blacklistId - ID de la entrada
   * @returns {Promise<Object|null>} Entrada o null
   */
  getBlacklistByIdAPI: async (blacklistId) => {
    try {
      return await fetchBlacklistById(blacklistId)
    } catch (error) {
      console.error('Error obteniendo blacklist:', error)
      return null
    }
  },

  /**
   * Verificar si un identificador está en blacklist (API)
   * @param {string} identifier - Email o teléfono
   * @returns {Promise<Object>} { is_blacklisted, reason, blocked_until }
   */
  checkBlacklistAPI: async (identifier) => {
    try {
      return await checkBlacklistAPI(identifier)
    } catch (error) {
      console.error('Error verificando blacklist:', error)
      return { is_blacklisted: false }
    }
  },

  /**
   * Agregar a blacklist en el backend
   * @param {Object} blacklistData - Datos del bloqueo
   * @returns {Promise<Object>} Entrada creada
   */
  addToBlacklistAPI: async (blacklistData) => {
    set({ isLoading: true, error: null })
    try {
      const token = useAuthStore.getState().token
      if (!token) throw new Error('No hay token de autenticación')

      const newEntry = await addToBlacklistAPI(blacklistData, token)
      set((state) => ({
        blacklist: [...state.blacklist, newEntry],
        isLoading: false,
      }))
      return newEntry
    } catch (error) {
      set({ error: error.message, isLoading: false })
      console.error('Error agregando a blacklist:', error)
      throw error
    }
  },

  /**
   * Desbloquear usuario de blacklist en el backend
   * @param {string} blacklistId - ID de la entrada
   * @returns {Promise<boolean>} True si se desbloqueó
   */
  removeFromBlacklistAPI: async (blacklistId) => {
    set({ isLoading: true, error: null })
    try {
      const token = useAuthStore.getState().token
      if (!token) throw new Error('No hay token de autenticación')

      await unblockBlacklistAPI(blacklistId, token)
      set((state) => ({
        blacklist: state.blacklist.filter((entry) => entry.id !== blacklistId),
        isLoading: false,
      }))
      return true
    } catch (error) {
      set({ error: error.message, isLoading: false })
      console.error('Error desbloqueando de blacklist:', error)
      throw error
    }
  },

  // ==================== LOCAL FUNCTIONS (LEGACY) ====================

  /**
   * Verificar si un usuario está en lista negra (local)
   * @param {string} phoneNumber - Número de teléfono del usuario
   * @returns {Object} { isBlocked, reason, blockedUntil }
   */
  isUserBlacklisted: (phoneNumber) => {
    const { blacklist } = get()
    const blockedUser = blacklist.find((user) => user.phoneNumber === phoneNumber)

    if (!blockedUser) {
      return { isBlocked: false }
    }

    // Verificar si el bloqueo es temporal y ya expiró
    if (blockedUser.blockedUntil) {
      const now = new Date()
      const until = new Date(blockedUser.blockedUntil)

      if (now > until) {
        // El bloqueo temporal ya expiró, remover de la lista
        get().removeFromBlacklist(blockedUser.id)
        return { isBlocked: false }
      }
    }

    return {
      isBlocked: true,
      reason: blockedUser.reason,
      blockedUntil: blockedUser.blockedUntil,
      entry: blockedUser,
    }
  },

  /**
   * Agregar usuario a lista negra
   * @param {Object} userData - Datos del usuario a bloquear
   * @returns {Object} Nueva entrada de blacklist
   */
  addToBlacklist: (userData) => {
    const { blacklist } = get()

    const newBlacklistEntry = {
      id: `blacklist-${Date.now()}`,
      phoneNumber: userData.phoneNumber,
      customerName: userData.customerName || 'Usuario',
      reason: userData.reason || 'No especificado',
      blockedBy: userData.blockedBy || 'system',
      blockedAt: new Date().toISOString(),
      blockedUntil: userData.blockedUntil || null, // null = permanente
      reservationsMissed: userData.reservationsMissed || 0,
    }

    set({ blacklist: [...blacklist, newBlacklistEntry] })
    return newBlacklistEntry
  },

  /**
   * Remover usuario de lista negra
   * @param {string} blacklistId - ID de la entrada en blacklist
   * @returns {boolean} True si se eliminó correctamente
   */
  removeFromBlacklist: (blacklistId) => {
    const { blacklist } = get()
    set({ blacklist: blacklist.filter((entry) => entry.id !== blacklistId) })
    return true
  },

  /**
   * Obtener todas las entradas de lista negra
   * @returns {Array} Lista completa de usuarios bloqueados
   */
  getBlacklist: () => {
    return get().blacklist
  },

  /**
   * Obtener lista negra filtrada (activos, expirados, etc.)
   * @param {string} filter - 'active', 'expired', 'permanent', 'temporary'
   * @returns {Array} Lista filtrada
   */
  getFilteredBlacklist: (filter = 'active') => {
    const { blacklist } = get()
    const now = new Date()

    switch (filter) {
      case 'active':
        return blacklist.filter((entry) => {
          if (!entry.blockedUntil) return true // Permanente
          return new Date(entry.blockedUntil) > now // Temporal no expirado
        })

      case 'expired':
        return blacklist.filter(
          (entry) => entry.blockedUntil && new Date(entry.blockedUntil) <= now
        )

      case 'permanent':
        return blacklist.filter((entry) => !entry.blockedUntil)

      case 'temporary':
        return blacklist.filter((entry) => entry.blockedUntil !== null)

      default:
        return blacklist
    }
  },

  /**
   * Actualizar entrada de lista negra
   * @param {string} blacklistId - ID de la entrada
   * @param {Object} updates - Datos a actualizar
   * @returns {boolean} True si se actualizó correctamente
   */
  updateBlacklistEntry: (blacklistId, updates) => {
    const { blacklist } = get()
    const updatedBlacklist = blacklist.map((entry) =>
      entry.id === blacklistId ? { ...entry, ...updates } : entry
    )
    set({ blacklist: updatedBlacklist })
    return true
  },

  /**
   * Auto-bloquear usuario por múltiples no-shows
   * @param {string} phoneNumber - Número de teléfono
   * @param {string} customerName - Nombre del cliente
   * @param {number} noShowCount - Cantidad de no-shows
   * @param {string} blockedBy - ID de quien bloqueó
   * @returns {Object|null} Entrada de blacklist si se bloqueó, null si no
   */
  autoBlockUserForNoShows: (phoneNumber, customerName, noShowCount, blockedBy = 'system') => {
    // Si tiene 3 o más no-shows, bloquearlo automáticamente
    if (noShowCount >= 3) {
      return get().addToBlacklist({
        phoneNumber,
        customerName,
        reason: `Usuario marcado automáticamente por ${noShowCount} reservas no cumplidas`,
        reservationsMissed: noShowCount,
        blockedUntil: null, // Bloqueo permanente
        blockedBy,
      })
    }

    return null
  },

  /**
   * Verificar si usuario está cerca del límite de no-shows
   * @param {string} phoneNumber - Número de teléfono
   * @param {number} noShowCount - Cantidad actual de no-shows
   * @returns {Object} { isNearLimit, message }
   */
  checkNoShowWarning: (phoneNumber, noShowCount) => {
    const { isUserBlacklisted } = get()

    // Si ya está bloqueado
    const blockCheck = isUserBlacklisted(phoneNumber)
    if (blockCheck.isBlocked) {
      return {
        isNearLimit: false,
        isBlocked: true,
        message: 'Usuario bloqueado',
      }
    }

    // Si tiene 2 no-shows, advertir
    if (noShowCount === 2) {
      return {
        isNearLimit: true,
        message: 'Advertencia: Un no-show más y serás bloqueado automáticamente',
      }
    }

    return {
      isNearLimit: false,
      message: '',
    }
  },

  /**
   * Obtener estadísticas de la blacklist
   * @returns {Object} Estadísticas
   */
  getBlacklistStats: () => {
    const { blacklist } = get()
    const now = new Date()

    const total = blacklist.length
    const permanent = blacklist.filter((entry) => !entry.blockedUntil).length
    const temporary = blacklist.filter((entry) => entry.blockedUntil !== null).length
    const active = blacklist.filter((entry) => {
      if (!entry.blockedUntil) return true
      return new Date(entry.blockedUntil) > now
    }).length
    const expired = blacklist.filter(
      (entry) => entry.blockedUntil && new Date(entry.blockedUntil) <= now
    ).length

    return {
      total,
      permanent,
      temporary,
      active,
      expired,
    }
  },

  /**
   * Limpiar entradas expiradas
   * @returns {number} Cantidad de entradas eliminadas
   */
  cleanExpiredEntries: () => {
    const { blacklist } = get()
    const now = new Date()

    const expiredEntries = blacklist.filter(
      (entry) => entry.blockedUntil && new Date(entry.blockedUntil) <= now
    )

    const updatedBlacklist = blacklist.filter((entry) => {
      if (!entry.blockedUntil) return true // Mantener permanentes
      return new Date(entry.blockedUntil) > now // Mantener no expirados
    })

    set({ blacklist: updatedBlacklist })
    return expiredEntries.length
  },
}))

export default useBlacklistStore
