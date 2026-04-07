/**
 * Utilidades para exportación de reportes (PDF y Excel)
 *
 * Elimina la duplicación de ~240 líneas de código en AdminPanel
 */

import Swal from 'sweetalert2'
import * as XLSX from 'xlsx'
import { getToday } from './dateFormatters'

/**
 * Tipos de reportes disponibles
 */
export const REPORT_TYPES = {
  INCOME: 'income',
  UTILIZATION: 'utilization',
  CLIENT: 'client',
  PAYMENT_METHOD: 'payment-method',
}

/**
 * Formatos de exportación
 */
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
}

/**
 * Filtra reservas relevantes para el reporte
 * @param {Array} reservations - Todas las reservas
 * @param {Array} visibleFields - Canchas visibles para el usuario
 * @returns {Array} Reservas filtradas
 */
const filterRelevantReservations = (reservations, visibleFields) => {
  const fieldIds = visibleFields.map((f) => f.id)
  return reservations.filter((reservation) => fieldIds.includes(reservation.fieldId))
}

/**
 * Genera un reporte en PDF
 * @param {string} reportType - Tipo de reporte
 * @param {Array} reservations - Reservas a incluir
 * @param {Array} fields - Canchas
 * @param {string} period - Período del reporte (ej: 'month', 'year')
 * @param {Function} generateFunction - Función generadora específica del reporte
 * @returns {Object} Objeto PDF generado
 */
const generatePDFReport = (reportType, reservations, fields, period, generateFunction) => {
  return generateFunction(reservations, fields, period)
}

/**
 * Genera un reporte en Excel
 * @param {string} reportType - Tipo de reporte
 * @param {Array} reservations - Reservas a incluir
 * @param {Array} fields - Canchas
 * @param {Function} generateFunction - Función generadora específica del reporte
 * @returns {Object} Workbook de Excel generado
 */
const generateExcelReport = (reportType, reservations, fields, generateFunction) => {
  return generateFunction(reservations, fields)
}

/**
 * Muestra mensaje de éxito después de exportar
 * @param {string} format - Formato del reporte ('pdf' o 'excel')
 */
const showSuccessMessage = (format) => {
  Swal.fire({
    icon: 'success',
    title: 'Reporte Generado',
    text: `El reporte en ${format.toUpperCase()} ha sido generado exitosamente`,
    timer: 2000,
    showConfirmButton: false,
  })
}

/**
 * Función principal para exportar reportes
 * Unifica las 8 funciones de export que estaban duplicadas en AdminPanel
 *
 * @param {Object} params - Parámetros de exportación
 * @param {string} params.reportType - Tipo de reporte (REPORT_TYPES)
 * @param {string} params.format - Formato de exportación (EXPORT_FORMATS)
 * @param {Array} params.reservations - Todas las reservas
 * @param {Array} params.visibleFields - Canchas visibles para el usuario
 * @param {string} params.period - Período del reporte (para PDF)
 * @param {Function} params.pdfGenerator - Función generadora de PDF
 * @param {Function} params.excelGenerator - Función generadora de Excel
 */
export const exportReport = async ({
  reportType,
  format,
  reservations,
  visibleFields,
  period = 'month',
  pdfGenerator,
  excelGenerator,
}) => {
  try {
    // Filtrar reservas relevantes
    const relevantReservations = filterRelevantReservations(reservations, visibleFields)

    // Generar según formato
    if (format === EXPORT_FORMATS.PDF && pdfGenerator) {
      const pdf = generatePDFReport(
        reportType,
        relevantReservations,
        visibleFields,
        period,
        pdfGenerator
      )
      pdf.save(`reporte-${reportType}-${getToday()}.pdf`)
    } else if (format === EXPORT_FORMATS.EXCEL && excelGenerator) {
      const workbook = generateExcelReport(
        reportType,
        relevantReservations,
        visibleFields,
        excelGenerator
      )
      XLSX.writeFile(workbook, `reporte-${reportType}-${getToday()}.xlsx`)
    }

    // Mostrar mensaje de éxito
    showSuccessMessage(format)
  } catch (error) {
    console.error(`Error al exportar reporte ${reportType}:`, error)
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo generar el reporte. Intenta nuevamente.',
      confirmButtonColor: '#22c55e',
    })
  }
}

/**
 * Helper para crear handlers de export de forma simple
 * @param {string} reportType - Tipo de reporte
 * @param {string} format - Formato ('pdf' o 'excel')
 * @param {Function} pdfGenerator - Generador de PDF
 * @param {Function} excelGenerator - Generador de Excel
 * @returns {Function} Handler de export listo para usar
 */
export const createExportHandler = (reportType, format, pdfGenerator, excelGenerator) => {
  return async (reservations, visibleFields, period = 'month') => {
    return exportReport({
      reportType,
      format,
      reservations,
      visibleFields,
      period,
      pdfGenerator,
      excelGenerator,
    })
  }
}
