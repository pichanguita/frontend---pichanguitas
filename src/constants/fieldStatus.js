/**
 * Constantes de Estados de Canchas
 *
 * Valores extraídos de bookingStore.js y componentes de fields
 */

// Estados de disponibilidad
export const FIELD_STATUS = {
  AVAILABLE: 'available', // Usado en AdminPanel
  UNAVAILABLE: 'unavailable', // Usado en AdminPanel
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  DELETED: 'deleted', // Eliminación lógica (soft delete)
  CLOSED: 'closed',
}

// Estados de aprobación
// NOTA: La BD almacena 'pending', nunca 'pending_approval'.
// El backend (fieldsController.js:139) siempre sobreescribe a 'pending' o 'approved'.
export const FIELD_APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

// Labels para UI
export const FIELD_STATUS_LABELS = {
  [FIELD_STATUS.AVAILABLE]: 'Disponible',
  [FIELD_STATUS.UNAVAILABLE]: 'No Disponible',
  [FIELD_STATUS.ACTIVE]: 'Activo',
  [FIELD_STATUS.INACTIVE]: 'Inactivo',
  [FIELD_STATUS.MAINTENANCE]: 'Mantenimiento',
  [FIELD_STATUS.DELETED]: 'Eliminado',
  [FIELD_STATUS.CLOSED]: 'Cerrado',
}

export const FIELD_APPROVAL_STATUS_LABELS = {
  [FIELD_APPROVAL_STATUS.PENDING]: 'Pendiente',
  [FIELD_APPROVAL_STATUS.APPROVED]: 'Aprobada',
  [FIELD_APPROVAL_STATUS.REJECTED]: 'Rechazada',
}

// Colores para badges de estado operativo
export const FIELD_STATUS_COLORS = {
  [FIELD_STATUS.AVAILABLE]: 'green',
  [FIELD_STATUS.ACTIVE]: 'green',
  [FIELD_STATUS.INACTIVE]: 'gray',
  [FIELD_STATUS.MAINTENANCE]: 'yellow',
  [FIELD_STATUS.DELETED]: 'red',
  [FIELD_STATUS.CLOSED]: 'gray',
  [FIELD_STATUS.UNAVAILABLE]: 'red',
}

// Colores para badges de estado de aprobación
export const FIELD_APPROVAL_STATUS_COLORS = {
  [FIELD_APPROVAL_STATUS.PENDING]: 'blue',
  [FIELD_APPROVAL_STATUS.APPROVED]: 'green',
  [FIELD_APPROVAL_STATUS.REJECTED]: 'red',
}

// Array de valores válidos
export const VALID_FIELD_STATUS = Object.values(FIELD_STATUS)

// Helper functions — estado operativo
export const isFieldActive = (status) => status === FIELD_STATUS.ACTIVE
export const isFieldAvailable = (status) => status === FIELD_STATUS.AVAILABLE
export const isFieldInMaintenance = (status) => status === FIELD_STATUS.MAINTENANCE

// Helper functions — estado de aprobación
export const isApprovalPending = (approvalStatus) =>
  approvalStatus === FIELD_APPROVAL_STATUS.PENDING
export const isApprovalApproved = (approvalStatus) =>
  approvalStatus === FIELD_APPROVAL_STATUS.APPROVED
export const isApprovalRejected = (approvalStatus) =>
  approvalStatus === FIELD_APPROVAL_STATUS.REJECTED

/**
 * Categorías agregadas usadas por métricas, gráficos y leyendas.
 * Una cancha pertenece a una sola categoría — nunca se duplica — aplicando
 * la prioridad `approvalStatus > status` (mismo criterio que el mapa y la tabla).
 */
export const FIELD_CATEGORY = {
  ACTIVE: 'active',
  MAINTENANCE: 'maintenance',
  CLOSED: 'closed',
  PENDING: 'pending',
  REJECTED: 'rejected',
}

export const FIELD_CATEGORY_LABELS = {
  [FIELD_CATEGORY.ACTIVE]: 'Activas',
  [FIELD_CATEGORY.MAINTENANCE]: 'Mantenimiento',
  [FIELD_CATEGORY.CLOSED]: 'Cerradas',
  [FIELD_CATEGORY.PENDING]: 'Pendientes',
  [FIELD_CATEGORY.REJECTED]: 'Rechazadas',
}

/**
 * Paleta única de colores por categoría de cancha.
 * Fuente única de verdad para marcadores del mapa, leyenda, tarjetas, PieChart y BarChart.
 * Colores separados para 'Rechazada' (rojo) y 'Cerrada' (gris) para distinguir estados.
 */
export const FIELD_CATEGORY_HEX = {
  [FIELD_CATEGORY.ACTIVE]: '#22c55e',
  [FIELD_CATEGORY.MAINTENANCE]: '#f59e0b',
  [FIELD_CATEGORY.CLOSED]: '#6b7280',
  [FIELD_CATEGORY.PENDING]: '#3b82f6',
  [FIELD_CATEGORY.REJECTED]: '#ef4444',
}

/**
 * Clases Tailwind alineadas con la paleta hex (para badges/leyendas).
 * Mantener sincronizado con FIELD_CATEGORY_HEX.
 */
export const FIELD_CATEGORY_TAILWIND = {
  [FIELD_CATEGORY.ACTIVE]: {
    dot: 'bg-green-500',
    text: 'text-green-600',
    bg: 'bg-green-50',
  },
  [FIELD_CATEGORY.MAINTENANCE]: {
    dot: 'bg-amber-500',
    text: 'text-amber-600',
    bg: 'bg-amber-50',
  },
  [FIELD_CATEGORY.CLOSED]: {
    dot: 'bg-gray-500',
    text: 'text-gray-600',
    bg: 'bg-gray-50',
  },
  [FIELD_CATEGORY.PENDING]: {
    dot: 'bg-blue-500',
    text: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  [FIELD_CATEGORY.REJECTED]: {
    dot: 'bg-red-500',
    text: 'text-red-600',
    bg: 'bg-red-50',
  },
}

/**
 * Resuelve la categoría efectiva de una cancha aplicando la prioridad:
 * approvalStatus (pending/rejected) > status (available/maintenance/closed).
 *
 * Esto garantiza que las métricas nunca cuenten doble una cancha y que
 * el mismo criterio se use en mapa, tabla, KPIs y gráficos.
 *
 * @param {{ approvalStatus?: string, status?: string }} field
 * @returns {string} una de las claves de FIELD_CATEGORY
 */
export const getFieldCategory = (field) => {
  if (!field) return FIELD_CATEGORY.CLOSED
  if (field.approvalStatus === FIELD_APPROVAL_STATUS.REJECTED) return FIELD_CATEGORY.REJECTED
  if (field.approvalStatus === FIELD_APPROVAL_STATUS.PENDING) return FIELD_CATEGORY.PENDING
  if (field.status === FIELD_STATUS.AVAILABLE) return FIELD_CATEGORY.ACTIVE
  if (field.status === FIELD_STATUS.MAINTENANCE) return FIELD_CATEGORY.MAINTENANCE
  return FIELD_CATEGORY.CLOSED
}
