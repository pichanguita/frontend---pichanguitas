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
  NO_SHOW: 'no_show',
}

// Labels para UI
export const RESERVATION_STATUS_LABELS = {
  [RESERVATION_STATUS.PENDING]: 'Pendiente',
  [RESERVATION_STATUS.CONFIRMED]: 'Confirmada',
  [RESERVATION_STATUS.COMPLETED]: 'Completada',
  [RESERVATION_STATUS.CANCELLED]: 'Cancelada',
  [RESERVATION_STATUS.NO_SHOW]: 'No completada',
}

// Colores para badges/indicadores
export const RESERVATION_STATUS_COLORS = {
  [RESERVATION_STATUS.PENDING]: 'yellow',
  [RESERVATION_STATUS.CONFIRMED]: 'green',
  [RESERVATION_STATUS.COMPLETED]: 'blue',
  [RESERVATION_STATUS.CANCELLED]: 'red',
  [RESERVATION_STATUS.NO_SHOW]: 'orange',
}

// Array de valores válidos
export const VALID_RESERVATION_STATUS = Object.values(RESERVATION_STATUS)

// Estados de reserva TERMINALES: el ciclo de la reserva ya cerró, por lo que no
// pueden tener un pago "pendiente por registrar". Una reserva en cualquiera de
// estos estados nunca debe listarse como pendiente ni ofrecer "Registrar Pago".
// Fuente única para los filtros del módulo de pagos.
export const TERMINAL_RESERVATION_STATUSES = [
  RESERVATION_STATUS.COMPLETED,
  RESERVATION_STATUS.CANCELLED,
  RESERVATION_STATUS.NO_SHOW,
]

// Helper functions
export const isPending = (status) => status === RESERVATION_STATUS.PENDING
export const isConfirmed = (status) => status === RESERVATION_STATUS.CONFIRMED
export const isCompleted = (status) => status === RESERVATION_STATUS.COMPLETED
export const isCancelled = (status) => status === RESERVATION_STATUS.CANCELLED
export const isNoShow = (status) => status === RESERVATION_STATUS.NO_SHOW
