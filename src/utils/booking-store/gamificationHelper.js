/**
 * Helper para manejo de gamificación en reservas
 *
 * Gestiona el desbloqueo automático de badges cuando se completa una reserva
 * NOTA: Los cálculos se realizan en el backend para consistencia
 */

import { API_CONFIG, getAuthHeaders } from '@/config/api.config'

/**
 * Verifica y desbloquea badges para un cliente tras completar una reserva
 * Llama al backend para verificar y asignar badges automáticamente
 * @param {number} customerId - ID del cliente
 * @returns {Promise<Array>} Lista de badges nuevos asignados
 */
export const checkAndUnlockBadgesForReservation = async (customerId) => {
  if (!customerId) return []

  try {
    // Lazy import para evitar dependencias circulares
    const useGamificationStore = (await import('../../store/gamificationStore')).default

    const gamificationStore = useGamificationStore.getState()

    // Verificar si gamificación está activa
    if (!gamificationStore.isActive || !gamificationStore.autoAssign) {
      return []
    }

    // Llamar al backend para verificar y asignar badges
    const response = await fetch(API_CONFIG.BADGES.CHECK_AND_ASSIGN(customerId), {
      method: 'POST',
      headers: getAuthHeaders(),
    })

    const data = await response.json()

    if (!data.success) {
      console.error('Error verificando badges:', data.error)
      return []
    }

    const newBadges = data.data || []

    // Si hay badges nuevos, mostrar notificación
    if (newBadges.length > 0 && gamificationStore.notifyClients) {
      // Mostrar notificación del primer badge nuevo
      gamificationStore.showBadgeNotification({
        badgeId: newBadges[0].badge_id,
        badgeName: newBadges[0].badge_name,
        badgeIcon: newBadges[0].badge_icon,
        tier: newBadges[0].tier,
        tierIcon: newBadges[0].tier_icon,
        tierLabel: newBadges[0].tier_label,
        tierColor: newBadges[0].tier_color,
        unlockedAt: newBadges[0].unlocked_at,
        autoAssigned: true,
      })
    }

    return newBadges
  } catch (error) {
    console.error('Error in gamification check:', error)
    return []
  }
}
