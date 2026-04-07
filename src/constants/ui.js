/**
 * Constantes de UI
 *
 * Colores, estilos y configuración visual de la aplicación
 */

// ==================== COLORES ====================

/**
 * Paleta de colores principal
 */
export const COLORS = {
  // Colores primarios
  PRIMARY: '#22c55e', // Verde principal
  PRIMARY_DARK: '#16a34a', // Verde oscuro
  PRIMARY_LIGHT: '#86efac', // Verde claro

  // Colores de estado
  SUCCESS: '#22c55e', // Verde (éxito)
  ERROR: '#dc2626', // Rojo (error)
  WARNING: '#f59e0b', // Amarillo (advertencia)
  INFO: '#3b82f6', // Azul (información)

  // Colores de fondo
  BG_SUCCESS: '#f0fdf4',
  BG_ERROR: '#fef2f2',
  BG_WARNING: '#fffbeb',
  BG_INFO: '#eff6ff',

  // Grises
  GRAY_50: '#f9fafb',
  GRAY_100: '#f3f4f6',
  GRAY_200: '#e5e7eb',
  GRAY_300: '#d1d5db',
  GRAY_400: '#9ca3af',
  GRAY_500: '#6b7280',
  GRAY_600: '#4b5563',
  GRAY_700: '#374151',
  GRAY_800: '#1f2937',
  GRAY_900: '#111827',
}

/**
 * Colores para SweetAlert2
 */
export const SWAL_COLORS = {
  CONFIRM: COLORS.SUCCESS, // #22c55e
  CANCEL: COLORS.ERROR, // #dc2626
  DEFAULT: COLORS.PRIMARY, // #22c55e
}

// ==================== CONFIGURACIÓN DE CANCELACIÓN ====================

/**
 * Configuración de políticas de cancelación
 */
export const CANCELLATION_CONFIG = {
  // Horas mínimas de anticipación para cancelar
  DEFAULT_HOURS_BEFORE: 24,

  // Porcentajes de reembolso por defecto
  DEFAULT_REFUND_PERCENTAGE: 50,
  FULL_REFUND: 100,
  NO_REFUND: 0,

  // Opciones de reembolso para UI
  REFUND_OPTIONS: [
    { value: 0, label: 'Sin reembolso' },
    { value: 25, label: '25%' },
    { value: 50, label: '50%' },
    { value: 75, label: '75%' },
    { value: 100, label: '100% (Reembolso completo)' },
  ],
}

// ==================== FORMATOS ====================

/**
 * Formatos de moneda
 */
export const CURRENCY = {
  SYMBOL: 'S/',
  CODE: 'PEN',
  LOCALE: 'es-PE',
}

/**
 * Formatos de fecha
 */
export const DATE_FORMATS = {
  SHORT: 'dd/MM/yyyy',
  LONG: "EEEE, d 'de' MMMM 'de' yyyy",
  LOCALE: 'es-PE',
}

// ==================== LÍMITES ====================

/**
 * Límites de archivos
 */
export const FILE_LIMITS = {
  MAX_IMAGE_SIZE_MB: 0.5,
  MAX_IMAGE_SIZE_BYTES: 0.5 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
  ACCEPTED_IMAGE_EXTENSIONS: ['.jpg', '.jpeg', '.png'],
}

/**
 * Límites de texto
 */
export const TEXT_LIMITS = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_COMMENT_LENGTH: 500,
  MAX_DESCRIPTION_LENGTH: 1000,
  MIN_NAME_LENGTH: 3,
}

// ==================== ANIMACIONES ====================

/**
 * Duraciones de animaciones
 */
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
}
