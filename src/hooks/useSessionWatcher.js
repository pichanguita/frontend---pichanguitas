import { useEffect } from 'react'
import useAuthStore from '@/store/authStore'
import { getTokenExpiryMs, isTokenExpired } from '@/utils/jwt'
import { expelToLogin } from '@/utils/sessionExpulsion'

/**
 * Watcher proactivo de expiración de sesión (autoridad única de tiempo).
 *
 * Se monta una sola vez a nivel de App. A diferencia del interceptor (reactivo,
 * necesita una petición), detecta la expiración aunque el usuario no interactúe:
 *
 * - Programa un timeout EXACTO al instante de expiración del JWT (sin polling).
 * - Reevalúa al volver el foco / pestaña visible, cubriendo el caso en que el
 *   equipo estuvo suspendido y los timers quedaron congelados.
 *
 * Al expirar, delega en la autoridad única `expelToLogin` (logout + redirect).
 */
export const useSessionWatcher = () => {
  const token = useAuthStore((s) => s.token)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  useEffect(() => {
    if (!isAuthenticated || !token) return

    // Si ya está vencido (o es ilegible) al montar/cambiar, expulsar de inmediato.
    if (isTokenExpired(token)) {
      expelToLogin()
      return
    }

    const evaluate = () => {
      if (isTokenExpired(token)) expelToLogin()
    }

    // Timeout exacto al instante de expiración. El JWT (horas) está muy por
    // debajo del límite de setTimeout (~24.8 días), por lo que no se desborda.
    const msUntilExpiry = getTokenExpiryMs(token) - Date.now()
    const timeoutId = setTimeout(evaluate, Math.max(0, msUntilExpiry))

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') evaluate()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', evaluate)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', evaluate)
    }
  }, [token, isAuthenticated])
}
