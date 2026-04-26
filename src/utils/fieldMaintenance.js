/**
 * Helpers para evaluar mantenimientos programados de canchas.
 *
 * El backend devuelve `field.maintenanceSchedules` como array de
 *   `{ id, startDate, endDate, reason }` con fechas en formato YYYY-MM-DD.
 *
 * Estas funciones permiten al frontend decidir si una cancha está bajo
 * mantenimiento PARA LA FECHA QUE EL CLIENTE QUIERE RESERVAR, en lugar de
 * apoyarse en `field.status` (que solo refleja "hoy" y queda obsoleto para
 * reservas con fechas futuras o pasadas al rango del mantenimiento).
 */

/**
 * Indica si una fecha YYYY-MM-DD cae dentro de algún rango de mantenimiento
 * programado para la cancha. La comparación es lexicográfica entre strings
 * con el mismo formato (`YYYY-MM-DD`), evitando problemas de zona horaria.
 *
 * @param {Object} field - Cancha con `maintenanceSchedules` (puede no existir).
 * @param {string} dateStr - Fecha solicitada en formato YYYY-MM-DD.
 * @returns {boolean} `true` si la cancha está en mantenimiento ese día.
 */
export const isFieldUnderMaintenanceOnDate = (field, dateStr) => {
  if (!field || !dateStr) return false
  const schedules = field.maintenanceSchedules
  if (!Array.isArray(schedules) || schedules.length === 0) return false

  return schedules.some((m) => {
    const start = m.startDate || m.start_date
    const end = m.endDate || m.end_date
    if (!start || !end) return false
    return start <= dateStr && dateStr <= end
  })
}

/**
 * Estados administrativos de cancha que NO dependen de la fecha solicitada:
 * cuando una cancha está en estos estados no se debe permitir reservar bajo
 * ninguna circunstancia, sin importar el día elegido.
 */
export const NON_RESERVABLE_FIELD_STATUSES = new Set([
  'closed',
  'pending',
  'inactive',
  'unavailable',
  'rejected',
])

/**
 * Determina si una cancha es reservable para una fecha específica.
 * Combina el estado administrativo con el chequeo de mantenimiento por fecha.
 *
 * @param {Object} field - Cancha en formato camelCase.
 * @param {string} dateStr - Fecha solicitada en formato YYYY-MM-DD.
 * @returns {boolean}
 */
export const isFieldReservableOnDate = (field, dateStr) => {
  if (!field) return false
  if (NON_RESERVABLE_FIELD_STATUSES.has(field.status)) return false
  if (isFieldUnderMaintenanceOnDate(field, dateStr)) return false
  return true
}
