/**
 * Espejo de los códigos de error de autenticación del backend
 * (backend_pichanguitas/constants/authErrorCodes.js).
 *
 * El frontend decide la expulsión de sesión a partir de estos códigos estables,
 * nunca del texto del mensaje (que puede cambiar o traducirse).
 */
export const AUTH_ERROR_CODES = {
  TOKEN_MISSING: 'AUTH_TOKEN_MISSING',
  TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
}

// Códigos que implican que la sesión dejó de ser válida y se debe expulsar.
export const SESSION_INVALIDATION_CODES = new Set([
  AUTH_ERROR_CODES.TOKEN_MISSING,
  AUTH_ERROR_CODES.TOKEN_EXPIRED,
  AUTH_ERROR_CODES.TOKEN_INVALID,
])
