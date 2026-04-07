import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { getPeriodText, getUtilizationStatus } from '../formatters'
import {
  calculateFieldRevenue,
  calculateUtilizationStats,
  calculateTypeUtilization,
  calculateClientStats,
  calculatePaymentMethodStats,
  getMostUsedField,
} from '../calculators'
import {
  PDF_COLORS,
  TABLE_STYLES,
  TABLE_STYLES_COMPACT,
  PDF_MARGINS,
  PDF_POSITIONS,
  FONT_SIZES,
  DEFAULT_TEXTS,
} from '../constants'

/**
 * Clase para generar reportes en PDF
 */
export class PDFReportGenerator {
  constructor() {
    this.pdf = null
  }

  /**
   * Crear nuevo documento PDF
   */
  createDocument() {
    this.pdf = new jsPDF()
    return this
  }

  /**
   * Agregar header al documento
   */
  addHeader(title, period) {
    const currentDate = new Date()

    this.pdf.setFontSize(FONT_SIZES.TITLE)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(title, 20, PDF_POSITIONS.TITLE_Y)

    this.pdf.setFontSize(FONT_SIZES.NORMAL)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text(`Generado: ${currentDate.toLocaleDateString('es-PE')}`, 20, PDF_POSITIONS.DATE_Y)
    this.pdf.text(`Período: ${getPeriodText(period)}`, 20, PDF_POSITIONS.PERIOD_Y)

    this.pdf.setLineWidth(0.5)
    this.pdf.line(20, PDF_POSITIONS.LINE_Y, 190, PDF_POSITIONS.LINE_Y)

    return this
  }

  /**
   * Agregar footer a todas las páginas
   */
  addFooter() {
    const pageCount = this.pdf.internal.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i)
      this.pdf.setFontSize(FONT_SIZES.SMALL)
      this.pdf.setFont('helvetica', 'normal')
      this.pdf.text(
        `${DEFAULT_TEXTS.PAGE_PREFIX} ${i} ${DEFAULT_TEXTS.PAGE_SEPARATOR} ${pageCount}`,
        PDF_POSITIONS.FOOTER_X_RIGHT,
        PDF_POSITIONS.FOOTER_Y,
        { align: 'right' }
      )
      this.pdf.text(DEFAULT_TEXTS.SYSTEM_NAME, 20, PDF_POSITIONS.FOOTER_Y)
    }
    return this
  }

  /**
   * Generar reporte de ingresos
   */
  generateIncomeReport(reservations = [], fields = [], period = 'month') {
    this.createDocument()
    this.addHeader('REPORTE DE INGRESOS', period)

    // Calcular totales
    const totalReservations = reservations.length
    const fieldRevenueData = calculateFieldRevenue(reservations, fields)
    const totalRevenue = fieldRevenueData.reduce((sum, field) => sum + field.revenue, 0)
    const averageRevenuePerReservation =
      totalReservations > 0 ? totalRevenue / totalReservations : 0

    // Resumen ejecutivo
    this.pdf.setFontSize(FONT_SIZES.SUBTITLE)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('RESUMEN EJECUTIVO', 20, PDF_POSITIONS.FIRST_SECTION_Y)

    const summaryData = [
      ['Total de Reservas', totalReservations.toString()],
      ['Ingresos Totales', `S/ ${totalRevenue.toLocaleString()}`],
      ['Promedio por Reserva', `S/ ${Math.round(averageRevenuePerReservation).toLocaleString()}`],
      ['Canchas Más Utilizadas', getMostUsedField(reservations, fields)],
    ]

    this.pdf.autoTable({
      startY: 70,
      head: [['Métrica', 'Valor']],
      body: summaryData,
      styles: TABLE_STYLES,
      headStyles: { fillColor: PDF_COLORS.PRIMARY, textColor: PDF_COLORS.TEXT },
      alternateRowStyles: { fillColor: PDF_COLORS.ALTERNATE_ROW },
      margin: PDF_MARGINS,
    })

    // Detalle por cancha
    const finalY = this.pdf.lastAutoTable.finalY + 15
    this.pdf.setFontSize(FONT_SIZES.SUBTITLE)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('DETALLE POR CANCHA', 20, finalY)

    this.pdf.autoTable({
      startY: finalY + 10,
      head: [['Cancha', 'Reservas', 'Ingresos', 'Precio/Hora', 'Utilización']],
      body: fieldRevenueData.map((item) => [
        item.name,
        item.reservations.toString(),
        `S/ ${item.revenue.toLocaleString()}`,
        `S/ ${item.pricePerHour}`,
        `${item.utilization}%`,
      ]),
      styles: TABLE_STYLES_COMPACT,
      headStyles: { fillColor: PDF_COLORS.SUCCESS, textColor: PDF_COLORS.TEXT },
      alternateRowStyles: { fillColor: PDF_COLORS.ALTERNATE_PRIMARY },
      margin: PDF_MARGINS,
    })

    this.addFooter()
    return this.pdf
  }

  /**
   * Generar reporte de utilización
   */
  generateUtilizationReport(reservations = [], fields = [], period = 'month') {
    this.createDocument()
    this.addHeader('REPORTE DE UTILIZACIÓN', period)

    const utilizationStats = calculateUtilizationStats(reservations, fields)

    this.pdf.setFontSize(FONT_SIZES.SUBTITLE)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('ESTADÍSTICAS DE UTILIZACIÓN', 20, PDF_POSITIONS.FIRST_SECTION_Y)

    const utilizationSummary = [
      ['Utilización Promedio General', `${utilizationStats.averageUtilization}%`],
      ['Cancha Más Utilizada', utilizationStats.mostUsedField],
      ['Cancha Menos Utilizada', utilizationStats.leastUsedField],
      ['Horario Pico', utilizationStats.peakHour],
    ]

    this.pdf.autoTable({
      startY: 70,
      head: [['Métrica', 'Valor']],
      body: utilizationSummary,
      styles: TABLE_STYLES,
      headStyles: { fillColor: PDF_COLORS.INFO, textColor: PDF_COLORS.TEXT },
      alternateRowStyles: { fillColor: PDF_COLORS.ALTERNATE_ROW },
      margin: PDF_MARGINS,
    })

    // Detalle por tipo de cancha
    const finalY = this.pdf.lastAutoTable.finalY + 15
    this.pdf.setFontSize(FONT_SIZES.SUBTITLE)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('UTILIZACIÓN POR TIPO DE CANCHA', 20, finalY)

    const typeUtilization = calculateTypeUtilization(reservations, fields)

    this.pdf.autoTable({
      startY: finalY + 10,
      head: [['Tipo de Cancha', 'Total Canchas', 'Reservas', 'Utilización Promedio', 'Estado']],
      body: typeUtilization.map((item) => [
        item.type,
        item.totalFields.toString(),
        item.reservations.toString(),
        `${item.utilization}%`,
        getUtilizationStatus(item.utilization),
      ]),
      styles: TABLE_STYLES_COMPACT,
      headStyles: { fillColor: PDF_COLORS.WARNING, textColor: PDF_COLORS.TEXT },
      alternateRowStyles: { fillColor: PDF_COLORS.ALTERNATE_INFO },
      margin: PDF_MARGINS,
    })

    this.addFooter()
    return this.pdf
  }

  /**
   * Generar reporte de clientes
   */
  generateClientReport(reservations = [], fields = [], period = 'month') {
    this.createDocument()
    this.addHeader('REPORTE DE CLIENTES', period)

    const clientStats = calculateClientStats(reservations, fields)

    this.pdf.setFontSize(FONT_SIZES.SUBTITLE)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('ANÁLISIS DE CLIENTES', 20, PDF_POSITIONS.FIRST_SECTION_Y)

    const clientSummary = [
      ['Total de Clientes Únicos', clientStats.uniqueClients.toString()],
      ['Promedio de Reservas por Cliente', clientStats.averageReservationsPerClient.toString()],
      ['Cliente Más Frecuente', clientStats.mostFrequentClient],
      ['Ticket Promedio por Cliente', `S/ ${clientStats.averageTicket}`],
    ]

    this.pdf.autoTable({
      startY: 70,
      head: [['Métrica', 'Valor']],
      body: clientSummary,
      styles: TABLE_STYLES,
      headStyles: { fillColor: PDF_COLORS.EMERALD, textColor: PDF_COLORS.TEXT },
      alternateRowStyles: { fillColor: PDF_COLORS.ALTERNATE_EMERALD },
      margin: PDF_MARGINS,
    })

    // Top clientes
    const finalY = this.pdf.lastAutoTable.finalY + 15
    this.pdf.setFontSize(FONT_SIZES.SUBTITLE)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('TOP 10 CLIENTES', 20, finalY)

    this.pdf.autoTable({
      startY: finalY + 10,
      head: [['Cliente', 'Teléfono', 'Reservas', 'Total Gastado', 'Última Reserva']],
      body: clientStats.topClients
        .slice(0, 10)
        .map((client) => [
          client.name,
          client.phone,
          client.reservations.toString(),
          `S/ ${client.totalSpent.toLocaleString()}`,
          client.lastReservation,
        ]),
      styles: TABLE_STYLES_COMPACT,
      headStyles: { fillColor: PDF_COLORS.PRIMARY, textColor: PDF_COLORS.TEXT },
      alternateRowStyles: { fillColor: PDF_COLORS.ALTERNATE_BLUE },
      margin: PDF_MARGINS,
    })

    this.addFooter()
    return this.pdf
  }

  /**
   * Generar reporte por método de pago
   */
  generatePaymentMethodReport(reservations = [], fields = [], period = 'month') {
    this.createDocument()
    this.addHeader('REPORTE POR MÉTODO DE PAGO', period)

    const { paymentMethods, totalRevenue, mostUsedMethod } = calculatePaymentMethodStats(
      reservations,
      fields
    )

    this.pdf.setFontSize(FONT_SIZES.SUBTITLE)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('RESUMEN EJECUTIVO', 20, PDF_POSITIONS.FIRST_SECTION_Y)

    const summaryData = [
      ['Total de Reservas', reservations.length.toString()],
      ['Ingresos Totales', `S/ ${totalRevenue.toLocaleString()}`],
      ['Método Más Usado', mostUsedMethod],
      ['Promedio por Reserva', `S/ ${(totalRevenue / (reservations.length || 1)).toFixed(2)}`],
    ]

    this.pdf.autoTable({
      startY: 70,
      head: [['Métrica', 'Valor']],
      body: summaryData,
      styles: TABLE_STYLES,
      headStyles: { fillColor: PDF_COLORS.PRIMARY, textColor: PDF_COLORS.TEXT },
      alternateRowStyles: { fillColor: PDF_COLORS.ALTERNATE_ROW },
      margin: PDF_MARGINS,
    })

    // Detalle por método de pago
    const finalY = this.pdf.lastAutoTable.finalY + 15
    this.pdf.setFontSize(FONT_SIZES.SUBTITLE)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('DETALLE POR MÉTODO DE PAGO', 20, finalY)

    const paymentData = Object.values(paymentMethods)
      .filter((method) => method.count > 0)
      .sort((a, b) => b.total - a.total)
      .map((method) => [
        method.name,
        method.count.toString(),
        `S/ ${method.total.toLocaleString()}`,
        `${method.percentage}%`,
      ])

    this.pdf.autoTable({
      startY: finalY + 10,
      head: [['Método', 'Transacciones', 'Total', '% del Total']],
      body: paymentData,
      styles: TABLE_STYLES_COMPACT,
      headStyles: { fillColor: PDF_COLORS.SUCCESS, textColor: PDF_COLORS.TEXT },
      alternateRowStyles: { fillColor: PDF_COLORS.ALTERNATE_PRIMARY },
      margin: PDF_MARGINS,
    })

    this.addFooter()
    return this.pdf
  }
}
