/**
 * CONFIGURACIÓN DE ENTORNO - PICHANGUITAS FRONTEND
 *
 * Este archivo centraliza la configuración del entorno de la aplicación,
 * detectando automáticamente si está en desarrollo o producción.
 *
 * La detección de entorno se hace mediante:
 * 1. import.meta.env.MODE (proporcionado por Vite)
 * 2. window.location.hostname (para detectar Railway u otros despliegues)
 */

// Detectar entorno actual
const isDevelopment = import.meta.env.MODE === 'development'
const isProduction = import.meta.env.MODE === 'production'

// Detectar si estamos en Railway o similar basado en el hostname
const isRailway =
  typeof window !== 'undefined' &&
  (window.location.hostname.includes('railway.app') ||
    window.location.hostname.includes('up.railway.app'))

/**
 * Obtener la URL base del API
 *
 * PRIORIDAD:
 * 1. Variable de entorno VITE_API_BASE_URL (si está configurada)
 * 2. Detección automática basada en el entorno:
 *    - Desarrollo: http://localhost:4009
 *    - Producción en Railway: usa la URL configurada en .env
 *    - Producción general: usa la URL configurada en .env
 */
const getApiBaseUrl = () => {
  // Si está configurada explícitamente, usarla
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }

  // Fallback para desarrollo
  if (isDevelopment) {
    return 'http://localhost:4009'
  }

  // En producción sin configuración explícita, advertir
  console.warn(
    '⚠️ VITE_API_BASE_URL no está configurada. ' +
      'Por favor, configura la URL del backend en las variables de entorno.'
  )

  // Fallback para evitar errores (aunque debería configurarse)
  return '/api'
}

// Configuración exportada
const config = {
  // Entorno
  env: {
    isDevelopment,
    isProduction,
    isRailway,
    mode: import.meta.env.MODE,
  },

  // API
  api: {
    baseUrl: getApiBaseUrl(),
    timeout: 30000, // 30 segundos
  },

  // Aplicación
  app: {
    version: import.meta.env.VITE_APP_VERSION || '2.2',
    storageVersion: import.meta.env.VITE_STORAGE_VERSION || '2.2',
    name: 'Pichanguitas',
  },

  // Seguridad
  security: {
    sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT) || 28800000, // 8 horas
    maxLoginAttempts: parseInt(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 3,
  },

  // Contacto
  contact: {
    phone: import.meta.env.VITE_CONTACT_PHONE || '',
    email: import.meta.env.VITE_CONTACT_EMAIL || 'contacto@pichanguitas.com',
  },

  // Debug
  debug: {
    enabled: import.meta.env.VITE_DEBUG_MODE === 'true' || isDevelopment,
    logApiCalls: isDevelopment,
  },
}

export default config

// Exportar utilidades individuales
export const { env, api, app, security, contact, debug } = config

/**
 * Helper para construir URLs del API
 * @param {string} endpoint - Endpoint del API (ej: '/users', '/auth/login')
 * @returns {string} URL completa del endpoint
 */
export const buildApiUrl = (endpoint) => {
  const baseUrl = config.api.baseUrl
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${cleanEndpoint}`
}

/**
 * Helper para verificar si una feature está habilitada
 * (útil para feature flags en el futuro)
 */
export const isFeatureEnabled = (featureName) => {
  const envVar = `VITE_FEATURE_${featureName.toUpperCase()}`
  return import.meta.env[envVar] === 'true'
}
