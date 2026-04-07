/**
 * Constantes de Textos de UI
 *
 * Textos reutilizables en toda la aplicación
 */

// Valores por defecto
export const DEFAULT_VALUES = {
  CUSTOMER_NAME: 'Cliente',
  NOT_AVAILABLE: 'N/A',
  NOT_SPECIFIED: 'No especificado',
  ALL: 'all',
}

// Mensajes de confirmación
export const CONFIRMATION_MESSAGES = {
  MARK_AS_PROCESSED: '¿Marcar como procesado?',
  RESERVATION_CREATED: '¡Reserva Creada!',
  REFUND_PROCESSED: '¡Reembolso Procesado!',
}

// Mensajes de error
export const ERROR_MESSAGES = {
  GENERIC_ERROR: 'Error',
  CREATE_RESERVATION_ERROR: 'No se pudo crear la reserva. Intenta nuevamente.',
  REFUND_PROCESS_ERROR: 'No se pudo procesar el reembolso',
}

// Mensajes de estados vacíos
export const EMPTY_STATES = {
  NO_RESERVATIONS: 'No hay reservas que coincidan con los filtros seleccionados',
  NO_REFUNDS_PENDING: 'No hay reembolsos pendientes',
  ALL_REFUNDS_PROCESSED: 'Todos los reembolsos han sido procesados',
  NO_FIELDS_AVAILABLE: 'No hay canchas disponibles',
  NO_ASSIGNED_FIELDS: 'No tienes canchas asignadas',
  CREATE_FIRST_FIELD: 'Crea tu primera cancha para comenzar',
}

// Textos de botones
export const BUTTON_TEXTS = {
  NEW_FIELD: 'Nueva Cancha',
  NEW_RESERVATION: 'Nueva Reserva',
  MARK_PROCESSED: 'Marcar Procesado',
  CLEAR_FILTERS: 'Limpiar todos los filtros',
  VIEW: 'Ver',
  EDIT: 'Editar',
  CONFIG: 'Config',
  YES_PROCESSED: 'Sí, procesado',
  CANCEL: 'Cancelar',
}

// Textos de filtros
export const FILTER_TEXTS = {
  ALL_SPORTS: 'Todos los deportes',
  ALL_STATES: 'Todos los estados',
  ALL_OWNERS: 'Todos los propietarios',
  ALL_DEPARTMENTS: 'Todos los departamentos',
  ALL_PROVINCES: 'Todas las provincias',
  ALL_DISTRICTS: 'Todos los distritos',
  SEARCH_BY_NAME: 'Buscar por nombre...',
  FILTERS: 'Filtros',
}

// Textos de contadores
export const COUNTER_TEXTS = {
  FIELD_FOUND: 'cancha encontrada',
  FIELDS_FOUND: 'canchas encontradas',
  HOUR: 'hora',
  HOURS: 'horas',
}

// Colores comunes (hexadecimal)
export const UI_COLORS = {
  SUCCESS_GREEN: '#22c55e',
  CANCEL_GRAY: '#6b7280',
  PRIMARY_BLUE: '#3b82f6',
  WARNING_ORANGE: '#f97316',
  DANGER_RED: '#ef4444',
}

// Íconos emoji por defecto
export const DEFAULT_ICONS = {
  SOCCER: '⚽',
}
