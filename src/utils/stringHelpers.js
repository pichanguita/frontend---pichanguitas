/**
 * Utilidades para manipulación de strings
 */

/**
 * Pluraliza una palabra según el contador
 * @param {number} count - Cantidad
 * @param {string} singular - Forma singular
 * @param {string} plural - Forma plural
 * @returns {string} Texto pluralizado (ej: "1 cancha" o "5 canchas")
 */
export const pluralize = (count, singular, plural) => {
  return `${count} ${count === 1 ? singular : plural}`
}

/**
 * Formatea un rango de horarios desde timeSlots
 * @param {Array} timeSlots - Array de slots de tiempo
 * @returns {string} Rango formateado (ej: "14:00 - 16:00")
 */
export const formatTimeRange = (timeSlots) => {
  if (!timeSlots || timeSlots.length === 0) return ''
  return `${timeSlots[0]} - ${timeSlots[timeSlots.length - 1]}`
}

/**
 * Extrae solo la hora de un string de tiempo (ej: "14:00" -> "14")
 * @param {string} timeString - String de tiempo en formato HH:MM
 * @returns {string} Solo la hora
 */
export const extractHour = (timeString) => {
  return timeString?.split(':')[0] || ''
}

/**
 * Formatea un rango de tiempo simple desde start y end
 * @param {string} startTime - Hora de inicio (HH:MM)
 * @param {string} endTime - Hora de fin (HH:MM)
 * @returns {string} Rango formateado (ej: "14-16")
 */
export const formatSimpleTimeRange = (startTime, endTime) => {
  const start = extractHour(startTime)
  const end = extractHour(endTime)
  return `${start}-${end}`
}

/**
 * Formatea un número como moneda peruana
 * @param {number} amount - Monto a formatear
 * @param {boolean} includeDecimals - Si incluir decimales (default: true)
 * @returns {string} Monto formateado (ej: "1,234.56" o "1,235")
 */
export const formatCurrency = (amount, includeDecimals = true) => {
  const options = {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }
  return amount.toLocaleString('es-PE', options)
}

/**
 * Trunca un texto a cierta longitud y agrega "..."
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncate = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
