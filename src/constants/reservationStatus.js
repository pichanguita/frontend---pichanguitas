/**
 * Constantes de Estados de Reservas
 *
 * Valores extraídos de bookingStore.js y componentes de reservas
 */

export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

// Labels para UI
export const RESERVATION_STATUS_LABELS = {
  [RESERVATION_STATUS.PENDING]: 'Pendiente',
  [RESERVATION_STATUS.CONFIRMED]: 'Confirmada',
  [RESERVATION_STATUS.COMPLETED]: 'Completada',
  [RESERVATION_STATUS.CANCELLED]: 'Cancelada',
}

// Colores para badges/indicadores
export const RESERVATION_STATUS_COLORS = {
  [RESERVATION_STATUS.PENDING]: 'yellow',
  [RESERVATION_STATUS.CONFIRMED]: 'green',
  [RESERVATION_STATUS.COMPLETED]: 'blue',
  [RESERVATION_STATUS.CANCELLED]: 'red',
}

// Array de valores válidos
export const VALID_RESERVATION_STATUS = Object.values(RESERVATION_STATUS)

// Helper functions
export const isPending = (status) => status === RESERVATION_STATUS.PENDING
export const isConfirmed = (status) => status === RESERVATION_STATUS.CONFIRMED
export const isCompleted = (status) => status === RESERVATION_STATUS.COMPLETED
export const isCancelled = (status) => status === RESERVATION_STATUS.CANCELLED
