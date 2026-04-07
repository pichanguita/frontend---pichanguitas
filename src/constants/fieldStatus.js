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
export const isApprovalPending = (approvalStatus) => approvalStatus === FIELD_APPROVAL_STATUS.PENDING
export const isApprovalApproved = (approvalStatus) => approvalStatus === FIELD_APPROVAL_STATUS.APPROVED
export const isApprovalRejected = (approvalStatus) => approvalStatus === FIELD_APPROVAL_STATUS.REJECTED
