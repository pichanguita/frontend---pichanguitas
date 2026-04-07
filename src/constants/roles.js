/**
 * Constantes de Roles de Usuario
 *
 * Valores extraídos del código existente para eliminar "magic strings"
 * y centralizar los valores de roles en un solo lugar.
 */

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  CUSTOMER: 'customer',
}

export const ADMIN_TYPES = {
  FIELD: 'field',
  GENERAL: 'general',
}

// Helper functions para verificación de roles
export const isAdmin = (role) => role === USER_ROLES.ADMIN
export const isSuperAdmin = (role) => role === USER_ROLES.SUPER_ADMIN
export const isCustomer = (role) => role === USER_ROLES.CUSTOMER
export const isFieldAdmin = (user) =>
  user?.role === USER_ROLES.ADMIN && user?.adminType === ADMIN_TYPES.FIELD
export const isGeneralAdmin = (user) =>
  user?.role === USER_ROLES.ADMIN && user?.adminType === ADMIN_TYPES.GENERAL

// Array de todos los roles válidos (útil para validación)
export const VALID_ROLES = Object.values(USER_ROLES)
export const VALID_ADMIN_TYPES = Object.values(ADMIN_TYPES)
