// Configuración de seguridad del sistema.
// La duración de la sesión NO se define aquí: viene del JWT emitido por el
// backend (env JWT_EXPIRES_IN). El frontend lee el campo `exp` del token.
export const securityConfig = {
  maxLoginAttempts: 5,
  blockDuration: 15 * 60 * 1000, // 15 minutos
  requirePasswordChange: false,
  twoFactorEnabled: false,
}
