/**
 * Utilidades de JWT (cliente).
 *
 * Fuente única para leer el payload y la expiración del token sin verificar la
 * firma. La verificación real la hace el backend en cada request; aquí sólo
 * leemos `exp` para detectar expiración de forma proactiva en el cliente.
 */

/**
 * Decodifica el payload de un JWT sin verificar la firma.
 * @param {string} token
 * @returns {object|null} payload o null si no se puede parsear
 */
export const parseJwt = (token) => {
  if (!token || typeof token !== 'string') return null
  try {
    const base64Payload = token.split('.')[1]
    if (!base64Payload) return null
    const padded = base64Payload.replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

/**
 * Instante (ms epoch) en que expira el JWT.
 * @param {string} token
 * @returns {number|null} ms de expiración, o null si no se puede determinar
 */
export const getTokenExpiryMs = (token) => {
  const payload = parseJwt(token)
  if (!payload || typeof payload.exp !== 'number') return null
  return payload.exp * 1000
}

/**
 * Indica si la sesión derivada del token debe considerarse inválida AHORA.
 * Falla cerrado: un token presente pero ilegible (exp indeterminable) se
 * considera inválido, no válido.
 * @param {string} token
 * @returns {boolean}
 */
export const isTokenExpired = (token) => {
  if (!token) return true
  const expiryMs = getTokenExpiryMs(token)
  if (expiryMs === null) return true
  return expiryMs <= Date.now()
}
