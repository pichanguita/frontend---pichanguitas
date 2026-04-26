import { API_CONFIG } from '../config/api.config'

const MEDIA_PROXY_PATH = '/api/media'

/**
 * Convierte cualquier referencia de archivo (proxy /api/media, URL absoluta
 * Wasabi o key pelada) en una URL absoluta lista para usar en <img>/<a>.
 * Devuelve null si la entrada es vacía.
 */
export const resolveMediaUrl = (value) => {
  if (!value) return null
  if (typeof value !== 'string') return value
  // URL absoluta (http/https): úsala directa
  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value
  }
  // Ruta del backend (proxy u otra)
  if (value.startsWith('/')) {
    return `${API_CONFIG.BASE_URL}${value}`
  }
  // Key sin prefijo → asumir proxy
  return `${API_CONFIG.BASE_URL}${MEDIA_PROXY_PATH}/${value}`
}
