/**
 * Interceptor global de autenticación (red de seguridad reactiva).
 *
 * Monkey-patchea window.fetch una sola vez para detectar respuestas del backend
 * que indiquen sesión inválida/expirada y delega la expulsión en la autoridad
 * única `expelToLogin`. La detección se basa en el `code` estable que devuelve
 * authMiddleware (no en el texto del mensaje).
 *
 * La detección proactiva por tiempo (sin necesidad de una petición) la hace
 * useSessionWatcher; este interceptor cubre el caso en que el backend rechaza
 * una petición en vuelo.
 */

import { API_CONFIG } from '@/config/api.config'
import { SESSION_INVALIDATION_CODES } from '@/config/authErrorCodes'
import { expelToLogin } from './sessionExpulsion'

const INSTALLED_FLAG = '__pichanguitasAuthInterceptorInstalled__'

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
 * Devuelve true si la respuesta corresponde a una sesión inválida/expirada.
 * Se apoya en el `code` estable de authMiddleware. Se clona la respuesta para
 * no consumir el body original que leerá el servicio que hizo la petición.
 */
const isAuthFailure = async (response) => {
  if (response.status !== 401 && response.status !== 403) return false

  try {
    const clone = response.clone()
    const data = await clone.json()
    return SESSION_INVALIDATION_CODES.has(data?.code)
  } catch {
    // Sin body parseable no podemos afirmar que sea una falla de sesión;
    // evitamos cerrar sesión ante 403 de permisos u otros errores.
    return false
  }
}

export const installAuthInterceptor = () => {
  if (typeof window === 'undefined') return
  if (window[INSTALLED_FLAG]) return

  const originalFetch = window.fetch.bind(window)

  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init)

    if (isApiRequest(input) && (await isAuthFailure(response))) {
      expelToLogin()
    }

    return response
  }

  window[INSTALLED_FLAG] = true
}
