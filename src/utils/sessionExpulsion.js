/**
 * Autoridad única de expulsión de sesión.
 *
 * Centraliza el cierre de sesión + redirección al login para que tanto el
 * interceptor reactivo (respuestas 401/403 del backend) como el watcher
 * proactivo (expiración por tiempo) usen exactamente la misma lógica.
 */

import useAuthStore from '@/store/authStore'

// Rutas del FE donde NO se debe redirigir al login (evitar bucle / vistas públicas).
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password']

export const isPublicRoute = () => {
  const pathname = (typeof window !== 'undefined' && window.location.pathname) || ''
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

/**
 * Cierra la sesión y redirige al login con recarga dura para garantizar la
 * limpieza completa del estado en memoria. Es idempotente: si ya no hay sesión
 * activa o estamos en una ruta pública, no hace nada.
 */
export const expelToLogin = () => {
  if (typeof window === 'undefined') return
  if (isPublicRoute()) return

  const { isAuthenticated, logout } = useAuthStore.getState()
  // Si ya no hay sesión, no reintentar (evita bucles de redirección).
  if (!isAuthenticated) return

  try {
    logout()
  } catch (error) {
    console.error('Error al cerrar sesión por sesión expirada:', error)
  }

  window.location.assign('/login')
}
