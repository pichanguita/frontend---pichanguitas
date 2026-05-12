/**
 * Configuración de API
 *
 * Define las URLs base y endpoints para las llamadas a la API del backend
 */

import config from './environment'

// URL base de la API - obtener desde configuración de entorno
const API_BASE_URL = config.api.baseUrl

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,

  // Endpoints de autenticación
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    FORGOT_PASSWORD: `${API_BASE_URL}/api/auth/forgot-password`,
    VERIFY_RESET_TOKEN: (token) => `${API_BASE_URL}/api/auth/verify-reset-token/${token}`,
    RESET_PASSWORD: `${API_BASE_URL}/api/auth/reset-password`,
  },

  // Endpoints de usuarios
  USERS: {
    GET_ALL: `${API_BASE_URL}/api/users`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/users/${id}`,
    CREATE: `${API_BASE_URL}/api/users`,
    UPDATE: (id) => `${API_BASE_URL}/api/users/${id}`,
    UPDATE_MY_PROFILE: `${API_BASE_URL}/api/users/my-profile`,
    UPDATE_PASSWORD: (id) => `${API_BASE_URL}/api/users/${id}/password`,
    RESET_PASSWORD: (id) => `${API_BASE_URL}/api/users/${id}/reset-password`,
    ASSIGN_FIELDS: (id) => `${API_BASE_URL}/api/users/${id}/assign-fields`,
    DELETE: (id) => `${API_BASE_URL}/api/users/${id}`,
  },

  // Endpoints de canchas
  FIELDS: {
    GET_ALL: `${API_BASE_URL}/api/fields`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/fields/${id}`,
    CREATE: `${API_BASE_URL}/api/fields`,
    UPDATE: (id) => `${API_BASE_URL}/api/fields/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/fields/${id}`,
    APPROVE: (id) => `${API_BASE_URL}/api/fields/${id}/approve`,
    REJECT: (id) => `${API_BASE_URL}/api/fields/${id}/reject`,
    GET_CONFIG: (id) => `${API_BASE_URL}/api/fields/${id}/config`,
    UPDATE_CONFIG: (id) => `${API_BASE_URL}/api/fields/${id}/config`,
  },

  // Endpoints de horarios de canchas
  FIELD_SCHEDULES: {
    GET_ALL: `${API_BASE_URL}/api/field-schedules`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/field-schedules/${id}`,
    GET_BY_FIELD: (fieldId) => `${API_BASE_URL}/api/field-schedules/field/${fieldId}`,
    CREATE: `${API_BASE_URL}/api/field-schedules`,
    CREATE_WEEK: `${API_BASE_URL}/api/field-schedules/week`,
    UPDATE: (id) => `${API_BASE_URL}/api/field-schedules/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/field-schedules/${id}`,
  },

  // Endpoints de reservas
  RESERVATIONS: {
    GET_ALL: `${API_BASE_URL}/api/reservations`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/reservations/${id}`,
    CREATE: `${API_BASE_URL}/api/reservations`,
    UPDATE: (id) => `${API_BASE_URL}/api/reservations/${id}`,
    CANCEL: (id) => `${API_BASE_URL}/api/reservations/${id}/cancel`,
    COMPLETE: (id) => `${API_BASE_URL}/api/reservations/${id}/complete`,
    NO_SHOW: (id) => `${API_BASE_URL}/api/reservations/${id}/no-show`,
    CHECK_AVAILABILITY: `${API_BASE_URL}/api/reservations/check-availability`,
    STATS: (fieldId) => `${API_BASE_URL}/api/reservations/stats/${fieldId}`,
    UPLOAD_VOUCHER: `${API_BASE_URL}/api/reservations/upload-voucher`,
    // Endpoints públicos para clientes (sin autenticación)
    PUBLIC_CANCEL: (id) => `${API_BASE_URL}/api/public/reservations/${id}/cancel`,
    PUBLIC_CANCELLATION_INFO: (id) =>
      `${API_BASE_URL}/api/public/reservations/${id}/cancellation-info`,
    PUBLIC_FIELD_AVAILABILITY: (fieldId) =>
      `${API_BASE_URL}/api/public/fields/${fieldId}/availability`,
  },

  // Endpoints de clientes
  CUSTOMERS: {
    GET_ALL: `${API_BASE_URL}/api/customers`,
    GET_MY_CLIENTS: `${API_BASE_URL}/api/customers/my-clients`,
    GET_MY_FREE_HOURS: `${API_BASE_URL}/api/customers/my-free-hours`,
    GET_BY_ADMIN: (adminId) => `${API_BASE_URL}/api/customers/by-admin/${adminId}`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/customers/${id}`,
    GET_BY_PHONE: (phone) => `${API_BASE_URL}/api/customers/phone/${phone}`,
    CREATE: `${API_BASE_URL}/api/customers`,
    UPDATE: (id) => `${API_BASE_URL}/api/customers/${id}`,
    UPDATE_STATS: (id) => `${API_BASE_URL}/api/customers/${id}/stats`,
    DELETE: (id) => `${API_BASE_URL}/api/customers/${id}`,
  },

  // Endpoints de tipos de deportes
  SPORT_TYPES: {
    GET_ALL: `${API_BASE_URL}/api/sport-types`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/sport-types/${id}`,
    GET_FIELDS_COUNT: (id) => `${API_BASE_URL}/api/sport-types/${id}/fields-count`,
    CREATE: `${API_BASE_URL}/api/sport-types`,
    UPDATE: (id) => `${API_BASE_URL}/api/sport-types/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/sport-types/${id}`,
  },

  // Endpoints de ubicaciones (Locations)
  LOCATIONS: {
    GET_DEPARTMENTS: `${API_BASE_URL}/api/locations/departments`,
    GET_DEPARTMENT_BY_ID: (id) => `${API_BASE_URL}/api/locations/departments/${id}`,
    GET_PROVINCES: `${API_BASE_URL}/api/locations/provinces`,
    GET_PROVINCE_BY_ID: (id) => `${API_BASE_URL}/api/locations/provinces/${id}`,
    GET_DISTRICTS: `${API_BASE_URL}/api/locations/districts`,
    GET_DISTRICT_BY_ID: (id) => `${API_BASE_URL}/api/locations/districts/${id}`,
    GET_COMPLETE: (districtId) => `${API_BASE_URL}/api/locations/complete/${districtId}`,
    // Ubicaciones que tienen canchas registradas
    GET_DEPARTMENTS_WITH_FIELDS: `${API_BASE_URL}/api/locations/departments-with-fields`,
    GET_PROVINCES_WITH_FIELDS: `${API_BASE_URL}/api/locations/provinces-with-fields`,
    GET_DISTRICTS_WITH_FIELDS: `${API_BASE_URL}/api/locations/districts-with-fields`,
  },

  // Endpoints de cupones
  COUPONS: {
    GET_ALL: `${API_BASE_URL}/api/coupons`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/coupons/${id}`,
    GET_BY_CODE: (code) => `${API_BASE_URL}/api/coupons/code/${code}`,
    GET_STATS: (id) => `${API_BASE_URL}/api/coupons/stats${id ? `/${id}` : ''}`,
    CREATE: `${API_BASE_URL}/api/coupons`,
    UPDATE: (id) => `${API_BASE_URL}/api/coupons/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/coupons/${id}`,
    VALIDATE: `${API_BASE_URL}/api/coupons/validate`,
  },

  // Endpoints de pagos
  PAYMENTS: {
    GET_ALL: `${API_BASE_URL}/api/payments`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/payments/${id}`,
    GET_STATS: `${API_BASE_URL}/api/payments/stats`,
    CREATE: `${API_BASE_URL}/api/payments`,
    UPDATE: (id) => `${API_BASE_URL}/api/payments/${id}`,
    MARK_PAID: (id) => `${API_BASE_URL}/api/payments/${id}/mark-paid`,
    CANCEL: (id) => `${API_BASE_URL}/api/payments/${id}/cancel`,
    DELETE: (id) => `${API_BASE_URL}/api/payments/${id}`,
  },

  // Endpoints de alertas
  ALERTS: {
    GET_ALL: `${API_BASE_URL}/api/alerts`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/alerts/${id}`,
    GET_UNREAD_COUNT: (adminId) => `${API_BASE_URL}/api/alerts/unread-count/${adminId}`,
    CREATE: `${API_BASE_URL}/api/alerts`,
    MARK_READ: (id) => `${API_BASE_URL}/api/alerts/${id}/mark-read`,
    MARK_ALL_READ: `${API_BASE_URL}/api/alerts/read-all`,
    DELETE: (id) => `${API_BASE_URL}/api/alerts/${id}`,
  },

  // Endpoints de reseñas
  REVIEWS: {
    GET_ALL: `${API_BASE_URL}/api/reviews`,
    CREATE: `${API_BASE_URL}/api/reviews`,
  },

  // Endpoints de insignias
  BADGES: {
    GET_ALL: `${API_BASE_URL}/api/badges`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/badges/${id}`,
    GET_MY_BADGES: `${API_BASE_URL}/api/badges/my-badges`,
    CREATE: `${API_BASE_URL}/api/badges`,
    UPDATE: (id) => `${API_BASE_URL}/api/badges/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/badges/${id}`,
    GET_BY_CUSTOMER: (customerId) => `${API_BASE_URL}/api/badges/customer/${customerId}`,
    GET_PROGRESS: (customerId) => `${API_BASE_URL}/api/badges/customer/${customerId}/progress`,
    CHECK_AND_ASSIGN: (customerId) => `${API_BASE_URL}/api/badges/customer/${customerId}/check`,
    ASSIGN: `${API_BASE_URL}/api/badges/assign`,
    REVOKE: (id) => `${API_BASE_URL}/api/badges/${id}/revoke`,
  },

  // Endpoints de criterios de insignias
  BADGE_CRITERIA: {
    GET_ALL: `${API_BASE_URL}/api/badge-criteria`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/badge-criteria/${id}`,
    CALCULATE: (customerId) =>
      `${API_BASE_URL}/api/badge-criteria/customer/${customerId}/calculate`,
  },

  // Endpoints de configuración de gamificación
  GAMIFICATION_CONFIG: {
    GET_ALL: `${API_BASE_URL}/api/gamification-config`,
    GET_BY_KEY: (key) => `${API_BASE_URL}/api/gamification-config/${key}`,
    UPDATE: `${API_BASE_URL}/api/gamification-config`,
    UPDATE_BY_KEY: (key) => `${API_BASE_URL}/api/gamification-config/${key}`,
  },

  // Endpoints de promociones
  PROMOTIONS: {
    GET_ALL: `${API_BASE_URL}/api/promotion-rules`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/promotion-rules/${id}`,
    GET_ACTIVE: `${API_BASE_URL}/api/promotion-rules/active`,
    GET_MY_PROMOTIONS: `${API_BASE_URL}/api/promotion-rules/my-promotions`,
    GET_MY_HISTORY: `${API_BASE_URL}/api/promotion-rules/my-history`,
    GET_FIELDS_WITH_RULES: `${API_BASE_URL}/api/promotion-rules/fields-with-rules`,
    REDEEM: `${API_BASE_URL}/api/promotion-rules/redeem`,
    CREATE: `${API_BASE_URL}/api/promotion-rules`,
    UPDATE: (id) => `${API_BASE_URL}/api/promotion-rules/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/promotion-rules/${id}`,
  },

  // Endpoints de reembolsos
  REFUNDS: {
    GET_ALL: `${API_BASE_URL}/api/refunds`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/refunds/${id}`,
    GET_STATS: `${API_BASE_URL}/api/refunds/stats`,
    CREATE: `${API_BASE_URL}/api/refunds`,
    UPDATE: (id) => `${API_BASE_URL}/api/refunds/${id}`,
    PROCESS: (id) => `${API_BASE_URL}/api/refunds/${id}/process`,
    REJECT: (id) => `${API_BASE_URL}/api/refunds/${id}/reject`,
    DELETE: (id) => `${API_BASE_URL}/api/refunds/${id}`,
  },

  // Endpoints de lista negra
  BLACKLIST: {
    GET_ALL: `${API_BASE_URL}/api/blacklist`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/blacklist/${id}`,
    GET_STATS: `${API_BASE_URL}/api/blacklist/stats`,
    CHECK: (identifier) => `${API_BASE_URL}/api/blacklist/check/${identifier}`,
    ADD: `${API_BASE_URL}/api/blacklist`,
    UPDATE: (id) => `${API_BASE_URL}/api/blacklist/${id}`,
    UNBLOCK: (id) => `${API_BASE_URL}/api/blacklist/${id}/unblock`,
    DELETE: (id) => `${API_BASE_URL}/api/blacklist/${id}`,
  },

  // Endpoints de solicitudes de registro
  REGISTRATION_REQUESTS: {
    GET_ALL: `${API_BASE_URL}/api/registration-requests`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/registration-requests/${id}`,
    GET_STATS: `${API_BASE_URL}/api/registration-requests/stats`,
    CREATE: `${API_BASE_URL}/api/registration-requests`,
    CREATE_WITH_FILES: `${API_BASE_URL}/api/registration-requests/with-files`,
    APPROVE: (id) => `${API_BASE_URL}/api/registration-requests/${id}/approve`,
    REJECT: (id) => `${API_BASE_URL}/api/registration-requests/${id}/reject`,
    DOWNLOAD_FILE: (id, fileId) =>
      `${API_BASE_URL}/api/registration-requests/${id}/files/${fileId}/download`,
  },

  // Endpoints de roles y permisos
  ROLES_PERMISSIONS: {
    GET_ROLES: `${API_BASE_URL}/api/roles-permissions/roles`,
    GET_ROLE_BY_ID: (id) => `${API_BASE_URL}/api/roles-permissions/roles/${id}`,
    GET_PERMISSIONS: `${API_BASE_URL}/api/roles-permissions/permissions`,
    GET_PERMISSION_BY_ID: (id) => `${API_BASE_URL}/api/roles-permissions/permissions/${id}`,
    ASSIGN_PERMISSIONS: (roleId) =>
      `${API_BASE_URL}/api/roles-permissions/roles/${roleId}/permissions`,
    GET_ROLE_PERMISSIONS: (roleId) =>
      `${API_BASE_URL}/api/roles-permissions/roles/${roleId}/permissions`,
  },

  // Endpoints de amenidades de canchas
  FIELD_AMENITIES: {
    GET_ALL: `${API_BASE_URL}/api/field-amenities`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/field-amenities/${id}`,
    GET_BY_FIELD: (fieldId) => `${API_BASE_URL}/api/field-amenities/field/${fieldId}`,
    CREATE: `${API_BASE_URL}/api/field-amenities`,
    CREATE_MULTIPLE: `${API_BASE_URL}/api/field-amenities/multiple`,
    UPDATE: (id) => `${API_BASE_URL}/api/field-amenities/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/field-amenities/${id}`,
  },

  // Endpoints de imágenes de canchas
  FIELD_IMAGES: {
    GET_ALL: `${API_BASE_URL}/api/field-images`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/field-images/${id}`,
    GET_BY_FIELD: (fieldId) => `${API_BASE_URL}/api/field-images/field/${fieldId}`,
    CREATE: `${API_BASE_URL}/api/field-images`,
    UPLOAD: `${API_BASE_URL}/api/field-images/upload`,
    UPDATE: (id) => `${API_BASE_URL}/api/field-images/${id}`,
    SET_PRIMARY: (id) => `${API_BASE_URL}/api/field-images/${id}/set-primary`,
    REORDER: `${API_BASE_URL}/api/field-images/reorder`,
    DELETE: (id) => `${API_BASE_URL}/api/field-images/${id}`,
  },

  // Endpoints de precios especiales de canchas
  FIELD_SPECIAL_PRICING: {
    GET_ALL: `${API_BASE_URL}/api/field-special-pricing`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/field-special-pricing/${id}`,
    GET_BY_FIELD: (fieldId) => `${API_BASE_URL}/api/field-special-pricing/field/${fieldId}`,
    GET_APPLICABLE: (fieldId) =>
      `${API_BASE_URL}/api/field-special-pricing/field/${fieldId}/applicable`,
    CREATE: `${API_BASE_URL}/api/field-special-pricing`,
    UPDATE: (id) => `${API_BASE_URL}/api/field-special-pricing/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/field-special-pricing/${id}`,
  },

  // Endpoints de mantenimiento de canchas
  FIELD_MAINTENANCE_SCHEDULES: {
    GET_ALL: `${API_BASE_URL}/api/field-maintenance-schedules`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/field-maintenance-schedules/${id}`,
    GET_BY_FIELD: (fieldId) => `${API_BASE_URL}/api/field-maintenance-schedules/field/${fieldId}`,
    CHECK_DATE: (fieldId) =>
      `${API_BASE_URL}/api/field-maintenance-schedules/field/${fieldId}/check-date`,
    CREATE: `${API_BASE_URL}/api/field-maintenance-schedules`,
    UPDATE: (id) => `${API_BASE_URL}/api/field-maintenance-schedules/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/field-maintenance-schedules/${id}`,
  },

  // Endpoints de uso de cupones
  COUPON_USAGE: {
    GET_ALL: `${API_BASE_URL}/api/coupon-usage`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/coupon-usage/${id}`,
    GET_BY_CUSTOMER: (customerId) => `${API_BASE_URL}/api/coupon-usage/customer/${customerId}`,
    GET_STATS: `${API_BASE_URL}/api/coupon-usage/stats`,
    CREATE: `${API_BASE_URL}/api/coupon-usage`,
    UPDATE: (id) => `${API_BASE_URL}/api/coupon-usage/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/coupon-usage/${id}`,
  },

  // Endpoints de reglas de canchas
  FIELD_RULES: {
    GET_ALL: `${API_BASE_URL}/api/field-rules`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/field-rules/${id}`,
    GET_BY_FIELD: (fieldId) => `${API_BASE_URL}/api/field-rules/field/${fieldId}`,
    CREATE: `${API_BASE_URL}/api/field-rules`,
    CREATE_MULTIPLE: `${API_BASE_URL}/api/field-rules/multiple`,
    UPDATE: (id) => `${API_BASE_URL}/api/field-rules/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/field-rules/${id}`,
  },

  // Endpoints de videos de canchas
  FIELD_VIDEOS: {
    GET_ALL: `${API_BASE_URL}/api/field-videos`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/field-videos/${id}`,
    GET_BY_FIELD: (fieldId) => `${API_BASE_URL}/api/field-videos/field/${fieldId}`,
    CREATE: `${API_BASE_URL}/api/field-videos`,
    UPDATE: (id) => `${API_BASE_URL}/api/field-videos/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/field-videos/${id}`,
  },

  // Endpoints de equipamiento de canchas
  FIELD_EQUIPMENT: {
    GET_ALL: `${API_BASE_URL}/api/field-equipment`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/field-equipment/${id}`,
    GET_BY_FIELD: (fieldId) => `${API_BASE_URL}/api/field-equipment/field/${fieldId}`,
    CREATE: `${API_BASE_URL}/api/field-equipment`,
    UPDATE: (id) => `${API_BASE_URL}/api/field-equipment/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/field-equipment/${id}`,
  },

  // Endpoints de configuración del sitio
  SITE_CONFIG: {
    GET_ALL: `${API_BASE_URL}/api/site-config`,
    GET_BY_KEY: (key) => `${API_BASE_URL}/api/site-config/${key}`,
    UPLOAD_IMAGE: `${API_BASE_URL}/api/site-config/upload-image`,
    UPDATE: (key) => `${API_BASE_URL}/api/site-config/${key}`,
    DELETE: (key) => `${API_BASE_URL}/api/site-config/${key}`,
  },

  // Endpoints de redes sociales
  SOCIAL_MEDIA: {
    GET_ALL: `${API_BASE_URL}/api/social-media`,
    GET_ENABLED: `${API_BASE_URL}/api/social-media/enabled`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/social-media/${id}`,
    CREATE: `${API_BASE_URL}/api/social-media`,
    UPDATE: (id) => `${API_BASE_URL}/api/social-media/${id}`,
    TOGGLE: (id) => `${API_BASE_URL}/api/social-media/${id}/toggle`,
    DELETE: (id) => `${API_BASE_URL}/api/social-media/${id}`,
    BULK_UPDATE: `${API_BASE_URL}/api/social-media/bulk`,
  },

  // Endpoints de registro de actividad
  ACTIVITY_LOGS: {
    GET_BY_USER: (userId) => `${API_BASE_URL}/api/activity-logs/user/${userId}`,
  },

  // Timeout para las peticiones (en milisegundos)
  TIMEOUT: 30000,

  // Headers por defecto
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
}

// Helper para obtener el token desde localStorage
export const getToken = () => {
  try {
    const authData = localStorage.getItem('admin-auth-storage')
    if (authData) {
      const parsed = JSON.parse(authData)
      return parsed.state?.token || null
    }
    return null
  } catch (error) {
    console.error('Error al obtener token:', error)
    return null
  }
}

// Helper para obtener headers con token
export const getAuthHeaders = (token) => {
  // Si no se proporciona token, intentar obtenerlo de localStorage
  const authToken = token || getToken()

  return {
    ...API_CONFIG.DEFAULT_HEADERS,
    Authorization: authToken ? `Bearer ${authToken}` : '',
  }
}

// Helper para logging de configuración
export const logApiConfig = () => {
  console.log('🌐 API Configuration:', {
    baseUrl: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
  })
}
