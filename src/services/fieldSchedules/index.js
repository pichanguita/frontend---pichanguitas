/**
 * Field Schedules Service Index
 * Exporta todas las funciones del servicio de horarios de canchas
 */

export {
  // Core functions
  fetchFieldSchedules,
  fetchFieldScheduleById,
  fetchSchedulesByField,
  createFieldScheduleAPI,
  createWeekScheduleAPI,
  updateFieldScheduleAPI,
  deleteFieldScheduleAPI,
  // Helpers
  fetchActiveSchedulesByField,
  fetchSchedulesByDay,
  groupSchedulesByDay,
  hasScheduleConflict,
} from './fieldSchedulesService'
