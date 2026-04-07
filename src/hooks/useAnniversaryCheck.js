import { useEffect } from 'react'

/**
 * Hook para verificar aniversarios de usuarios
 * Ejecuta verificación al montar el componente y cada 24 horas
 *
 * Extraído de AdminPanel.jsx para mejor organización y testabilidad
 */
export const useAnniversaryCheck = ({ enabled, users, userId, checkUserAnniversaries }) => {
  useEffect(() => {
    if (!enabled || !users || users.length === 0 || !userId || !checkUserAnniversaries) {
      return
    }

    try {
      // Verificar aniversarios inmediatamente al montar
      checkUserAnniversaries(users, userId)

      // Configurar verificación diaria (cada 24 horas)
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000
      const dailyCheck = setInterval(() => {
        checkUserAnniversaries(users, userId)
      }, TWENTY_FOUR_HOURS)

      // Cleanup: cancelar interval al desmontar
      return () => clearInterval(dailyCheck)
    } catch (error) {
      console.error('Error verificando aniversarios:', error)
    }
  }, [enabled, users, userId, checkUserAnniversaries])
}
