// Configuración de seguridad del sistema
export const securityConfig = {
  maxLoginAttempts: 5,
  blockDuration: 15 * 60 * 1000, // 15 minutos
  sessionDuration: 8 * 60 * 60 * 1000, // 8 horas
  requirePasswordChange: false,
  twoFactorEnabled: false,
}
