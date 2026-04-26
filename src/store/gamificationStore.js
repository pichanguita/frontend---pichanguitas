import { create } from 'zustand'
import {
  fetchBadges,
  createBadgeAPI,
  updateBadgeAPI,
  deleteBadgeAPI,
  fetchBadgeCriteria,
  fetchBadgeProgress,
  fetchGamificationConfig,
  updateGamificationConfigAPI,
} from '../services/badges/badgesService'

const useGamificationStore = create((set, get) => ({
  // Configuración global
  isActive: true,
  autoAssign: true,
  notifyClients: true,
  notifyAdmin: true,
  showInProfile: true,
  showPublicRanking: true,
  hideLockedBadges: false,
  enableRewards: true,

  // Insignia que se acaba de desbloquear (para notificación)
  unlockedBadge: null,
  showNotification: false,
  // Cola de insignias pendientes de notificar (cuando se desbloquean varias seguidas)
  pendingBadgeQueue: [],
  // IDs ya notificados en esta sesión (evita repetir notificación al refrescar la lista)
  notifiedBadgeKeys: new Set(),

  // Estado de carga
  isLoading: false,
  error: null,

  // Insignias del sistema (editables por admin)
  badges: [],

  // Criterios disponibles (desde BD)
  criteria: [],

  // ==================== API FUNCTIONS ====================

  /**
   * Cargar badges desde el backend
   * @returns {Promise<Array>} Array de badges
   */
  loadBadges: async () => {
    set({ isLoading: true, error: null })
    try {
      const badges = await fetchBadges()
      set({ badges, isLoading: false })
      return badges
    } catch (error) {
      set({ error: error.message, isLoading: false })
      console.error('Error cargando badges:', error)
      return []
    }
  },

  /**
   * Obtener badge por ID (local)
   * @param {string} badgeId - ID del badge
   * @returns {Object|null} Badge o null
   */
  getBadgeById: (badgeId) => {
    const { badges } = get()
    return badges.find((b) => b.id === badgeId) || null
  },

  /**
   * Cargar criterios desde el backend
   * @returns {Promise<Array>} Array de criterios
   */
  loadCriteria: async () => {
    set({ isLoading: true, error: null })
    try {
      const criteria = await fetchBadgeCriteria()
      set({ criteria, isLoading: false })
      return criteria
    } catch (error) {
      set({ error: error.message, isLoading: false })
      console.error('Error cargando criterios:', error)
      return []
    }
  },

  /**
   * Obtener progreso de insignias de un cliente
   * @param {number} customerId - ID del cliente
   * @returns {Promise<Array>} Progreso de insignias
   */
  loadBadgeProgress: async (customerId) => {
    try {
      const progress = await fetchBadgeProgress(customerId)
      return progress
    } catch (error) {
      console.error('Error cargando progreso de insignias:', error)
      return []
    }
  },

  // Crear nueva insignia (guardando en BD)
  createBadge: async (badgeData) => {
    set({ isLoading: true, error: null })
    try {
      // Preparar datos para el backend (criteria_id obligatorio)
      const apiData = {
        name: badgeData.name,
        icon: badgeData.icon,
        description: badgeData.description,
        criteria_id: badgeData.criteriaId,
        is_active: badgeData.isActive !== false,
        tiers: badgeData.tiers || [],
      }

      const newBadge = await createBadgeAPI(apiData)

      // Actualizar estado local
      set((state) => ({
        badges: [...state.badges, newBadge],
        isLoading: false,
      }))

      return newBadge
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Editar insignia existente (guardando en BD)
  updateBadge: async (badgeId, updates) => {
    set({ isLoading: true, error: null })
    try {
      // Preparar datos para el backend (incluyendo tiers)
      const apiData = {
        name: updates.name,
        icon: updates.icon,
        description: updates.description,
        criteria_id: updates.criteriaId,
        is_active: updates.isActive,
        tiers: updates.tiers || [],
      }

      const updatedBadge = await updateBadgeAPI(badgeId, apiData)

      // Actualizar estado local
      set((state) => ({
        badges: state.badges.map((badge) =>
          badge.id === badgeId ? { ...badge, ...updatedBadge } : badge
        ),
        isLoading: false,
      }))

      return updatedBadge
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  // Eliminar insignia (de BD)
  deleteBadge: async (badgeId) => {
    set({ isLoading: true, error: null })
    try {
      await deleteBadgeAPI(badgeId)

      // Actualizar estado local
      set((state) => ({
        badges: state.badges.filter((badge) => badge.id !== badgeId),
        isLoading: false,
      }))

      return true
    } catch (error) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },

  /**
   * Cargar configuración desde el backend
   * @returns {Promise<Object>} Configuración cargada
   */
  loadConfig: async () => {
    try {
      const config = await fetchGamificationConfig()
      // Mapear claves de BD a claves del store
      set({
        isActive: config.is_active ?? true,
        autoAssign: config.auto_assign ?? true,
        notifyClients: config.notify_clients ?? true,
        notifyAdmin: config.notify_admin ?? true,
        showInProfile: config.show_in_profile ?? true,
        showPublicRanking: config.show_public_ranking ?? true,
        hideLockedBadges: config.hide_locked_badges ?? false,
        enableRewards: config.enable_rewards ?? true,
      })
      return config
    } catch (error) {
      console.error('Error cargando configuración de gamificación:', error)
      return {}
    }
  },

  // Actualizar configuración global (guardando en BD)
  updateConfig: async (config) => {
    // Actualizar estado local inmediatamente
    set(config)

    try {
      // Mapear claves del store a claves de BD
      const apiConfig = {}
      if (config.isActive !== undefined) apiConfig.is_active = config.isActive
      if (config.autoAssign !== undefined) apiConfig.auto_assign = config.autoAssign
      if (config.notifyClients !== undefined) apiConfig.notify_clients = config.notifyClients
      if (config.notifyAdmin !== undefined) apiConfig.notify_admin = config.notifyAdmin
      if (config.showInProfile !== undefined) apiConfig.show_in_profile = config.showInProfile
      if (config.showPublicRanking !== undefined)
        apiConfig.show_public_ranking = config.showPublicRanking
      if (config.hideLockedBadges !== undefined)
        apiConfig.hide_locked_badges = config.hideLockedBadges
      if (config.enableRewards !== undefined) apiConfig.enable_rewards = config.enableRewards

      // Guardar en BD
      await updateGamificationConfigAPI(apiConfig)
    } catch (error) {
      console.error('Error guardando configuración de gamificación:', error)
      // No revertir el estado local para mejor UX
    }
  },

  /**
   * Encolar insignias recién desbloqueadas para mostrarlas como notificación.
   * Acepta payloads del backend (camelCase via badgeAssignmentService).
   * Filtra duplicados ya notificados en la sesión actual.
   * @param {Array<Object>} newBadges
   */
  enqueueUnlockedBadges: (newBadges) => {
    if (!Array.isArray(newBadges) || newBadges.length === 0) return

    const { notifiedBadgeKeys, unlockedBadge, showNotification, pendingBadgeQueue } = get()
    const next = []
    const updatedKeys = new Set(notifiedBadgeKeys)

    for (const b of newBadges) {
      const key = `${b.badgeId}-${b.tier}`
      if (updatedKeys.has(key)) continue
      updatedKeys.add(key)
      next.push(b)
    }

    if (next.length === 0) {
      set({ notifiedBadgeKeys: updatedKeys })
      return
    }

    if (showNotification && unlockedBadge) {
      // Hay una notificación visible: encolar el resto
      set({
        pendingBadgeQueue: [...pendingBadgeQueue, ...next],
        notifiedBadgeKeys: updatedKeys,
      })
      return
    }

    // No hay notificación activa: mostrar la primera y encolar el resto
    const [head, ...rest] = next
    set({
      unlockedBadge: head,
      showNotification: true,
      pendingBadgeQueue: [...pendingBadgeQueue, ...rest],
      notifiedBadgeKeys: updatedKeys,
    })
  },

  /**
   * Marcar insignias ya existentes (cargadas al inicio) como ya notificadas
   * para que en la misma sesión no se vuelvan a mostrar como “nuevas”.
   * @param {Array<{badge_id:number, tier:string}>} userBadges
   */
  primeNotifiedFromExisting: (userBadges) => {
    if (!Array.isArray(userBadges) || userBadges.length === 0) return
    const { notifiedBadgeKeys } = get()
    const updated = new Set(notifiedBadgeKeys)
    for (const b of userBadges) {
      updated.add(`${b.badge_id ?? b.badgeId}-${b.tier}`)
    }
    set({ notifiedBadgeKeys: updated })
  },

  /**
   * Cerrar la notificación actual y, si hay más en cola, mostrar la siguiente.
   */
  closeNotification: () => {
    const { pendingBadgeQueue } = get()
    if (pendingBadgeQueue.length === 0) {
      set({ showNotification: false })
      return
    }
    const [next, ...rest] = pendingBadgeQueue
    set({
      unlockedBadge: next,
      showNotification: true,
      pendingBadgeQueue: rest,
    })
  },
}))

export default useGamificationStore
