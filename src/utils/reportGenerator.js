/**
 * Punto de entrada para generación de reportes
 * Este archivo exporta todas las funcionalidades de reportes de manera organizada
 */

import { PDFReportGenerator } from './reports/pdf/PDFReportGenerator'
import { ExcelExporter } from './reports/excel/ExcelExporter'

// Instancia del generador PDF
const pdfGenerator = new PDFReportGenerator()

// ==================== REPORTES PDF ====================

/**
 * Generar reporte de ingresos en PDF
 */
export const generateIncomeReport = (reservations, fields, period) => {
  return pdfGenerator.generateIncomeReport(reservations, fields, period)
}

/**
 * Generar reporte de utilización en PDF
 */
export const generateUtilizationReport = (reservations, fields, period) => {
  return pdfGenerator.generateUtilizationReport(reservations, fields, period)
}

/**
 * Generar reporte de clientes en PDF
 */
export const generateClientReport = (reservations, fields, period) => {
  return pdfGenerator.generateClientReport(reservations, fields, period)
}

/**
 * Generar reporte por método de pago en PDF
 */
export const generatePaymentMethodReport = (reservations, fields, period) => {
  return pdfGenerator.generatePaymentMethodReport(reservations, fields, period)
}

// ==================== EXPORTACIÓN A EXCEL ====================

/**
 * Exportar reporte de ingresos a Excel
 */
export const exportIncomeToExcel = (reservations, fields, period) => {
  ExcelExporter.exportIncomeReport(reservations, fields, period)
}

/**
 * Exportar historial de reservas a Excel
 */
export const exportReservationsToExcel = (reservations, fields) => {
  ExcelExporter.exportReservationsHistory(reservations, fields)
}

// Exportación por defecto
export default {
  // PDF Reports
  generateIncomeReport,
  generateUtilizationReport,
  generateClientReport,
  generatePaymentMethodReport,

  // Excel Exports
  exportIncomeToExcel,
  exportReservationsToExcel,
}
