import * as XLSX from 'xlsx'
import { getPeriodText } from '../formatters'
import {
  calculateFieldRevenue,
  getMostUsedField,
  getReservationTotalPrice,
  getReservationRevenue,
} from '../calculators'

/**
 * Clase para exportar datos a Excel
 */
export class ExcelExporter {
  /**
   * Descargar archivo Excel
   */
  static downloadFile(wb, filename) {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  /**
   * Exportar reporte de ingresos a Excel
   */
  static exportIncomeReport(reservations = [], fields = [], period = 'month') {
    const fieldRevenueData = calculateFieldRevenue(reservations, fields)
    const totalReservations = reservations.length
    const totalRevenue = fieldRevenueData.reduce((sum, field) => sum + field.revenue, 0)

    // Hoja 1: Resumen
    const summaryData = [
      ['REPORTE DE INGRESOS'],
      ['Generado:', new Date().toLocaleDateString('es-PE')],
      ['Período:', getPeriodText(period)],
      [],
      ['Métrica', 'Valor'],
      ['Total de Reservas', totalReservations],
      [
        'Ingresos Totales',
        `S/ ${totalRevenue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ],
      ['Promedio por Reserva', `S/ ${(totalRevenue / (totalReservations || 1)).toFixed(2)}`],
      ['Cancha Más Utilizada', getMostUsedField(reservations, fields)],
    ]

    // Hoja 2: Detalle por cancha
    const detailData = [
      ['DETALLE POR CANCHA'],
      [],
      ['Cancha', 'Reservas', 'Ingresos (S/)', 'Precio/Hora (S/)', 'Utilización (%)'],
      ...fieldRevenueData.map((item) => [
        item.name,
        item.reservations,
        item.revenue.toFixed(2),
        item.pricePerHour,
        item.utilization,
      ]),
    ]

    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
    const ws2 = XLSX.utils.aoa_to_sheet(detailData)

    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen')
    XLSX.utils.book_append_sheet(wb, ws2, 'Detalle por Cancha')

    this.downloadFile(wb, 'reporte-ingresos')
  }

  /**
   * Exportar historial de reservas a Excel
   */
  static exportReservationsHistory(reservations = [], fields = []) {
    const reservationData = [
      ['HISTORIAL DE RESERVAS'],
      ['Generado:', new Date().toLocaleDateString('es-PE')],
      [],
      [
        'ID',
        'Cliente',
        'Teléfono',
        'Cancha',
        'Fecha',
        'Hora',
        'Deporte',
        'Estado Pago',
        'Método de Pago',
        'Monto Total (S/)',
        'Pagado (S/)',
      ],
    ]

    reservations.forEach((reservation) => {
      const field = fields.find((f) => String(f.id) === String(reservation.fieldId))
      // Usar funciones centralizadas
      const totalPrice = getReservationTotalPrice(reservation, field)
      const revenue = getReservationRevenue(reservation, field)

      reservationData.push([
        reservation.id,
        reservation.customerName || reservation.clientName || 'N/A',
        reservation.customerPhone || reservation.phoneNumber || 'N/A',
        field?.name || reservation.fieldName || 'N/A',
        reservation.date,
        reservation.startTime || reservation.time || 'N/A',
        reservation.sportType || field?.sportType || 'N/A',
        reservation.paymentStatus || 'N/A',
        reservation.paymentMethod || 'N/A',
        totalPrice.toFixed(2),
        revenue.toFixed(2),
      ])
    })

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.aoa_to_sheet(reservationData)

    XLSX.utils.book_append_sheet(wb, ws, 'Reservas')

    this.downloadFile(wb, 'historial-reservas')
  }
}
