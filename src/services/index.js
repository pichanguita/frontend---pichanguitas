/**
 * INDEX - Exporta todos los servicios del sistema
 *
 * Punto único de importación para todos los servicios.
 *
 * Uso:
 * import { getDepartments, createReservation, validateField } from '@/services'
 */

// ==================== AUTENTICACIÓN ====================
export * from './auth'

// ==================== BOOKING & RESERVAS ====================
export * from './booking'

// ==================== CANCHAS ====================
export * from './field'
export * from './fieldConfig'
export * from './fieldSchedules'
export * from './amenitiesCatalog'
export * from './videoTutorials'
export * from './fieldImages'
export * from './fieldSpecialPricing'
export * from './fieldMaintenanceSchedules'
export * from './fieldRules'
export * from './fieldVideos'
export * from './fieldEquipment'

// ==================== USUARIOS & CLIENTES ====================
export * from './users'
export * from './customers'

// ==================== UBICACIONES ====================
export * from './locations'
export * from './sportTypes'

// ==================== RESEÑAS & ALERTAS ====================
export * from './reviews'
export * from './alerts'

// ==================== CUPONES & PROMOCIONES ====================
export * from './coupons'
export * from './couponUsage'
export * from './promotions'

// ==================== PAGOS & REEMBOLSOS ====================
export * from './payments'
export * from './refunds'

// ==================== SOLICITUDES & ADMINISTRACIÓN ====================
export * from './registrationRequests'
export * from './blacklist'

// ==================== GAMIFICACIÓN ====================
export * from './badges'

// ==================== ROLES & PERMISOS ====================
export * from './rolesPermissions'
