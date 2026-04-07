/**
 * Utilidades para formateo de fechas
 *
 * Centraliza los formatos de fecha usados en toda la aplicación
 */

const LOCALE_PE = 'es-PE'

/**
 * Parsea una fecha string en formato YYYY-MM-DD como fecha local (no UTC)
 * Esto evita el bug de zona horaria donde "2025-01-12" se interpreta como
 * UTC medianoche, que en Perú (UTC-5) es el día anterior
 * @param {Date|string} date - Fecha a parsear
 * @returns {Date} Objeto Date en hora local
 */
export const parseLocalDate = (date) => {
  if (date instanceof Date) return date
  if (typeof date !== 'string') return new Date(date)

  // Si es formato YYYY-MM-DD, parsearlo como fecha local
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  return new Date(date)
}

/**
 * Formatea una fecha en formato DD/MM/YYYY
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDate = (date) => {
  const dateObj = parseLocalDate(date)
  return dateObj.toLocaleDateString(LOCALE_PE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Formatea una fecha mostrando el día de la semana
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Día de la semana (ej: "lunes")
 */
export const formatWeekday = (date) => {
  const dateObj = parseLocalDate(date)
  return dateObj.toLocaleDateString(LOCALE_PE, { weekday: 'long' })
}

/**
 * Formatea una fecha en formato corto por defecto
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatDateShort = (date) => {
  const dateObj = parseLocalDate(date)
  return dateObj.toLocaleDateString(LOCALE_PE)
}

/**
 * Formatea una hora en formato HH:MM
 * @param {Date|string} date - Fecha/hora a formatear
 * @returns {string} Hora formateada
 */
export const formatTime = (date) => {
  const dateObj = parseLocalDate(date)
  return dateObj.toLocaleTimeString(LOCALE_PE, {
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formatea una fecha y hora juntas
 * @param {Date|string} date - Fecha/hora a formatear
 * @returns {Object} Objeto con fecha y hora separadas
 */
export const formatDateTime = (date) => {
  return {
    date: formatDate(date),
    time: formatTime(date),
  }
}

/**
 * Convierte una fecha a string en formato YYYY-MM-DD usando hora LOCAL
 * Esto evita el desfase de zona horaria que ocurre con toISOString()
 * @param {Date} date - Fecha a convertir
 * @returns {string} Fecha en formato YYYY-MM-DD en hora local
 */
export const toISODateString = (date) => {
  if (!date) return null
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Obtiene la fecha de hoy en formato string usando hora LOCAL
 * @returns {string} Fecha de hoy en formato YYYY-MM-DD en hora local
 */
export const getToday = () => {
  const today = new Date()
  return toISODateString(today)
}
