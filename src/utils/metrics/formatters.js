/**
 * Utilidades de formateo para métricas
 */

/**
 * Formatear moneda en soles peruanos
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount)
}

/**
 * Obtener color de ocupación según porcentaje
 */
export const getOccupancyColor = (rate) => {
  if (rate >= 80) return 'text-green-600 bg-green-100'
  if (rate >= 60) return 'text-blue-600 bg-blue-100'
  if (rate >= 40) return 'text-amber-600 bg-amber-100'
  return 'text-red-600 bg-red-100'
}
