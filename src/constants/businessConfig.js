/**
 * Configuraciones de Negocio
 *
 * Constantes numéricas y de configuración del negocio
 */

// Configuración de pagos
export const PAYMENT_CONFIG = {
  PARTIAL_PAYMENT_PERCENTAGE: 0.3, // 30% para pagos parciales
  FULL_PAYMENT_PERCENTAGE: 1.0, // 100% para pagos completos
}

// Configuración de horarios
export const SCHEDULE_CONFIG = {
  DAYS_PER_MONTH: 30, // Días promedio por mes
  BUSINESS_HOURS_PER_DAY: 12, // Horas de operación por día
  DEFAULT_SLOT_DURATION: 1, // Duración por defecto de slot en horas
}

// Configuración de UI
export const UI_CONFIG = {
  MAX_SPORTS_ICONS_DISPLAYED: 3, // Máximo de íconos de deportes mostrados
  SUCCESS_MODAL_TIMER: 2000, // Tiempo de auto-cierre de modales de éxito (ms)
  TABLE_COLSPAN_RESERVATIONS: 7, // Colspan para tabla de reservas vacía
  TABLE_COLSPAN_REFUNDS: 5, // Colspan para tabla de reembolsos vacía
}

// Límites de paginación (para futura implementación)
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
}
