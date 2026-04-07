import { parseLocalDate } from '../dateFormatters'

/**
 * Utilidades de formateo para reportes
 */

/**
 * Obtener texto del período
 */
export const getPeriodText = (period) => {
  const periods = {
    week: 'Última semana',
    month: 'Último mes',
    quarter: 'Último trimestre',
    year: 'Este año',
  }
  return periods[period] || 'Período personalizado'
}

/**
 * Obtener estado de utilización
 */
export const getUtilizationStatus = (utilization) => {
  if (utilization >= 80) return 'Excelente'
  if (utilization >= 60) return 'Bueno'
  if (utilization >= 40) return 'Regular'
  return 'Bajo'
}

/**
 * Formatear fecha en formato peruano
 */
export const formatDate = (date) => {
  return parseLocalDate(date).toLocaleDateString('es-PE')
}

/**
 * Formatear moneda en soles
 */
export const formatCurrency = (amount) => {
  return `S/ ${amount.toLocaleString()}`
}
