// Barrel export for utils
import { showSuccessAlert, showErrorAlert } from './alerts'

// Alert utilities
export * from './alerts'

// Date formatters
// IMPORTANTE: Usar 'T12:00:00' para evitar problemas de timezone
// Sin esto, '2026-01-31' se interpreta como medianoche UTC, que en Perú (UTC-5) es el día anterior
export const formatDate = (date) => {
  let dateObj
  if (typeof date === 'string') {
    // Si es formato YYYY-MM-DD, agregar T12:00:00 para evitar desfase
    dateObj = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(date + 'T12:00:00') : new Date(date)
  } else {
    dateObj = date
  }
  return dateObj.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export const formatWeekday = (date) => {
  let dateObj
  if (typeof date === 'string') {
    // Si es formato YYYY-MM-DD, agregar T12:00:00 para evitar desfase
    dateObj = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(date + 'T12:00:00') : new Date(date)
  } else {
    dateObj = date
  }
  return dateObj.toLocaleDateString('es-PE', { weekday: 'long' })
}

// String helpers
export const formatCurrency = (amount, includeDecimals = true) => {
  const options = {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }
  return amount.toLocaleString('es-PE', options)
}

export const pluralize = (count, singular, plural) => {
  return `${count} ${count === 1 ? singular : plural}`
}

// Export helpers
/**
 * Función genérica para exportar reportes (PDF o Excel)
 * Elimina 200 líneas de código duplicado en AdminPanel
 */
export const handleExportReport = async ({
  type,
  format,
  generator,
  reservations,
  fields,
  period = 'month',
}) => {
  try {
    // Filtrar reservas relevantes
    const relevantReservations = reservations.filter((reservation) =>
      fields.some((field) => field.id === reservation.fieldId)
    )

    // Generar reporte según el formato
    if (format === 'pdf') {
      const pdf = generator(relevantReservations, fields, period)
      const fileName = `reporte-${type}-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
    } else if (format === 'excel') {
      generator(relevantReservations, fields, period)
    }

    // Mostrar mensaje de éxito usando utilidad
    await showSuccessAlert({
      title: format === 'pdf' ? 'Reporte Generado' : 'Excel Generado',
      text: `El reporte de ${type} se ha descargado correctamente`,
    })
  } catch (error) {
    console.error(`Error generating ${type} report:`, error)
    await showErrorAlert({
      text: `No se pudo generar el reporte de ${type}`,
    })
  }
}
