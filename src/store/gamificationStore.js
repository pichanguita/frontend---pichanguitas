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
   * Obtener tipos de criterios disponibles (desde BD)
   * @returns {Array} Lista de criterios
   */
  getCriteriaTypes: () => {
    const { criteria } = get()
    // Transformar a formato compatible con el selector
    return criteria.reduce((acc, crit) => {
      acc[crit.code] = {
        id: crit.id,
        label: crit.name,
        description: crit.description,
      }
      return acc
    }, {})
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
      // Preparar datos para el backend
      const apiData = {
        name: badgeData.name,
        icon: badgeData.icon,
        description: badgeData.description,
        criteria_type: badgeData.criteriaType,
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
        criteria_type: updates.criteriaType,
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
      if (config.showPublicRanking !== undefined) apiConfig.show_public_ranking = config.showPublicRanking
      if (config.hideLockedBadges !== undefined) apiConfig.hide_locked_badges = config.hideLockedBadges
      if (config.enableRewards !== undefined) apiConfig.enable_rewards = config.enableRewards

      // Guardar en BD
      await updateGamificationConfigAPI(apiConfig)
    } catch (error) {
      console.error('Error guardando configuración de gamificación:', error)
      // No revertir el estado local para mejor UX
    }
  },

  // Mostrar notificación de insignia desbloqueada
  showBadgeNotification: (badge) => {
    set({
      unlockedBadge: badge,
      showNotification: true,
    })

    // Auto-cerrar después de 5 segundos
    setTimeout(() => {
      set({ showNotification: false })
    }, 5000)
  },

  // Cerrar notificación manualmente
  closeNotification: () => {
    set({ showNotification: false })
  },
}))

export default useGamificationStore
