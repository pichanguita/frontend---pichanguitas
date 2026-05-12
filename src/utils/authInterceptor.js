/**
 * Interceptor global de autenticación.
 *
 * Monkey-patchea window.fetch una sola vez para detectar respuestas 401/403
 * provenientes del backend que indiquen token ausente, inválido o expirado.
 * Cuando se detecta, fuerza el logout del store y redirige al login,
 * eliminando el caso en que la sesión queda abierta pero los módulos no cargan.
 */

import useAuthStore from '@/store/authStore'
import { API_CONFIG } from '@/config/api.config'

const INSTALLED_FLAG = '__pichanguitasAuthInterceptorInstalled__'

// Rutas del FE donde NO se debe redirigir al login (evitar bucle).
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password']

const isPublicRoute = () => {
  const pathname = window.location.pathname || ''
  return PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
}

const isApiRequest = (input) => {
  try {
    const url = typeof input === 'string' ? input : input?.url
    if (!url) return false
    // Solo nos interesan respuestas del backend de la app
    return url.startsWith(API_CONFIG.BASE_URL)
  } catch {
    return false
  }
}

/**
 * Devuelve true si la respuesta es una expiración/invalidez de token.
 * Aceptamos 401 (sin token / token inválido en algunos flujos) y 403 con
 * mensaje de token (que es lo que devuelve authMiddleware del backend).
 * Se clona la respuesta para no consumir el body original.
 */
const isAuthFailure = async (response) => {
  if (response.status !== 401 && response.status !== 403) return false

  // 401: sin token o credenciales rechazadas en endpoints autenticados
  // 403: middleware devuelve "Token inválido o expirado"
  try {
    const clone = response.clone()
    const data = await clone.json()
    const message = (data?.error || data?.message || '').toLowerCase()

    if (response.status === 401) {
      // Si es login fallido por credenciales, NO cerrar sesión global
      if (message.includes('contraseña') || message.includes('password')) {
        return false
      }
      return message.includes('token') || message.includes('no proporcionado')
    }

    // 403: solo si menciona token (otros 403 son de permisos, no de sesión)
    return message.includes('token')
  } catch {
    // Si no se puede parsear, asumimos sesión expirada solo en 403
    return response.status === 403
  }
}

const handleAuthFailure = () => {
  if (isPublicRoute()) return

  try {
    useAuthStore.getState().logout()
  } catch (error) {
    console.error('Error al cerrar sesión por token expirado:', error)
  }

  // Redirección dura para garantizar limpieza completa del estado en memoria.
  window.location.assign('/login')
}

export const installAuthInterceptor = () => {
  if (typeof window === 'undefined') return
  if (window[INSTALLED_FLAG]) return

  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init)

    if (isApiRequest(input) && (await isAuthFailure(response))) {
      handleAuthFailure()
    }

    return response
  }

  window[INSTALLED_FLAG] = true
}
