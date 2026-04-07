/**
 * Helper para validación de blacklist
 *
 * Valida si un usuario está bloqueado antes de crear una reserva
 */

/**
 * Verifica si un usuario está en lista negra
 * @param {Object} blacklistStore - Store de lista negra
 * @param {string} phoneNumber - Teléfono del usuario
 * @returns {Object} - { isBlocked: boolean, message?: string }
 */
export const validateUserBlacklist = (blacklistStore, phoneNumber) => {
  const blacklistCheck = blacklistStore.isUserBlacklisted(phoneNumber)

  if (!blacklistCheck.isBlocked) {
    return { isBlocked: false }
  }

  // Construir mensaje de bloqueo
  const message = blacklistCheck.blockedUntil
    ? `Tu cuenta está bloqueada hasta el ${new Date(blacklistCheck.blockedUntil).toLocaleDateString('es-PE')}. Razón: ${blacklistCheck.reason}`
    : `Tu cuenta está bloqueada. Razón: ${blacklistCheck.reason}. Contacta al administrador para más información.`

  return {
    isBlocked: true,
    message,
  }
}
