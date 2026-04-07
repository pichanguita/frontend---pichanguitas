/**
 * Constantes de Tipos de Alertas
 *
 * Tipos de alerta para el sistema de reservas de canchas
 */

export const ALERT_TYPES = {
  NEW_RESERVATION: 'new_reservation',
  RESERVATION_CANCELLED: 'reservation_cancelled',
  RESERVATION_NO_SHOW: 'reservation_no_show',
  FIELD_APPROVED: 'field_approved',
  FIELD_REJECTED: 'field_rejected',
}

export const ALERT_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
}

export const ALERT_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
}

// Labels para UI (útiles para selects y displays)
export const ALERT_TYPE_LABELS = {
  [ALERT_TYPES.NEW_RESERVATION]: 'Nueva Reserva',
  [ALERT_TYPES.RESERVATION_CANCELLED]: 'Reserva Cancelada',
  [ALERT_TYPES.RESERVATION_NO_SHOW]: 'Cliente No Llegó',
  [ALERT_TYPES.FIELD_APPROVED]: 'Cancha Aprobada',
  [ALERT_TYPES.FIELD_REJECTED]: 'Cancha Rechazada',
}

export const ALERT_STATUS_LABELS = {
  [ALERT_STATUS.UNREAD]: 'Sin leer',
  [ALERT_STATUS.READ]: 'Leídas',
}

export const ALERT_PRIORITY_LABELS = {
  [ALERT_PRIORITY.LOW]: 'Baja',
  [ALERT_PRIORITY.MEDIUM]: 'Media',
  [ALERT_PRIORITY.HIGH]: 'Alta',
}

// Array de valores válidos (útil para validación)
export const VALID_ALERT_TYPES = Object.values(ALERT_TYPES)
export const VALID_ALERT_STATUS = Object.values(ALERT_STATUS)
export const VALID_ALERT_PRIORITIES = Object.values(ALERT_PRIORITY)
