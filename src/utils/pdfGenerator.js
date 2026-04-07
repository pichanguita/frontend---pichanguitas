import jsPDF from 'jspdf'

// Logo en base64 - se cargará dinámicamente
let logoBase64 = null

// Función para cargar el logo como base64
const loadLogo = async () => {
  if (logoBase64) return logoBase64

  try {
    const response = await fetch('/LOGO.png')
    if (!response.ok) {
      console.warn('Logo no encontrado, continuando sin logo')
      return null
    }
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        logoBase64 = reader.result
        resolve(logoBase64)
      }
      reader.onerror = () => {
        console.warn('Error al leer el logo')
        resolve(null)
      }
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.warn('No se pudo cargar el logo:', error)
    return null
  }
}

export const generateReservationPDF = async (reservationSummary) => {
  console.log('📄 Iniciando generación de PDF...', reservationSummary)

  try {
    const pdf = new jsPDF()

    // Cargar logo
    const logo = await loadLogo()
    console.log('🖼️ Logo cargado:', logo ? 'Sí' : 'No')

    // Determinar si es pago en efectivo
    const isCashPayment = reservationSummary.isPendingCashPayment === true

    // Configuración de colores - Paleta profesional
    const brandGreen = [34, 197, 94] // Verde principal
    const brandYellow = [255, 213, 0] // Amarillo de la marca
    const brandDark = [10, 36, 36] // Verde oscuro
    const amberColor = [245, 158, 11] // Ámbar para pagos pendientes
    const grayText = [71, 85, 105] // Texto secundario
    const lightGray = [243, 244, 246] // Fondo claro
    const white = [255, 255, 255]

    const primaryColor = isCashPayment ? amberColor : brandGreen

    // ═══════════════════════════════════════════════════════════════
    // HEADER PROFESIONAL
    // ═══════════════════════════════════════════════════════════════

    // Fondo del header
    pdf.setFillColor(...brandDark)
    pdf.rect(0, 0, 210, 45, 'F')

    // Franja decorativa amarilla
    pdf.setFillColor(...brandYellow)
    pdf.rect(0, 45, 210, 3, 'F')

    // Logo (si está disponible)
    if (logo) {
      try {
        pdf.addImage(logo, 'PNG', 15, 8, 30, 30)
      } catch (_e) {
        console.warn('Error al agregar logo al PDF')
      }
    }

    // Nombre de la empresa
    pdf.setTextColor(...white)
    pdf.setFontSize(22)
    pdf.setFont('helvetica', 'bold')
    pdf.text('PICHANGUITAS', logo ? 50 : 15, 22)

    // Subtítulo
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...brandYellow)
    pdf.text('Sistema de Reservas de Canchas Deportivas', logo ? 50 : 15, 30)

    // Tipo de documento (derecha)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...white)
    const docType = isCashPayment ? 'CONFIRMACIÓN' : 'VOUCHER DE PAGO'
    pdf.text(docType, 195, 22, { align: 'right' })

    // Número de documento
    pdf.setFontSize(11)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...brandYellow)
    const docNum = `N° ${isCashPayment ? 'RES' : 'VOU'}-${String(reservationSummary.id).padStart(6, '0')}`
    pdf.text(docNum, 195, 30, { align: 'right' })

    let yPos = 58
    const leftMargin = 15
    const colWidth = 90

    // ═══════════════════════════════════════════════════════════════
    // INFORMACIÓN PRINCIPAL EN DOS COLUMNAS
    // ═══════════════════════════════════════════════════════════════

    // Sección izquierda: Datos de la Reserva
    const drawSectionHeader = (title, x, y, width) => {
      pdf.setFillColor(...brandDark)
      pdf.rect(x, y, width, 8, 'F')
      pdf.setTextColor(...white)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'bold')
      pdf.text(title, x + 3, y + 5.5)
      return y + 12
    }

    const drawField = (label, value, x, y) => {
      pdf.setTextColor(...grayText)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      pdf.text(label, x, y)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(0, 0, 0)
      pdf.text(value || '-', x, y + 5)
      return y + 12
    }

    // ── COLUMNA IZQUIERDA: DATOS DE RESERVA ──
    let leftY = drawSectionHeader('DATOS DE LA RESERVA', leftMargin, yPos, colWidth)

    // Fecha de emisión
    leftY = drawField(
      'Fecha de Emisión:',
      new Date().toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      leftMargin + 3,
      leftY
    )

    // Fecha de la reserva
    leftY = drawField(
      'Fecha de Juego:',
      new Date(reservationSummary.date + 'T12:00:00').toLocaleDateString('es-PE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      leftMargin + 3,
      leftY
    )

    // Horarios
    const horariosText = reservationSummary.timeSlots?.join(' | ') || reservationSummary.time || '-'
    leftY = drawField('Horario:', horariosText, leftMargin + 3, leftY)

    // Total de horas
    leftY = drawField(
      'Duración:',
      `${reservationSummary.totalHours} ${reservationSummary.totalHours === 1 ? 'hora' : 'horas'}`,
      leftMargin + 3,
      leftY
    )

    // ── COLUMNA DERECHA: INFORMACIÓN DE LA CANCHA ──
    let rightY = drawSectionHeader(
      'INFORMACIÓN DE LA CANCHA',
      leftMargin + colWidth + 5,
      yPos,
      colWidth
    )

    // Nombre de la cancha
    rightY = drawField('Cancha:', reservationSummary.field.name, leftMargin + colWidth + 8, rightY)

    // Dirección
    rightY = drawField(
      'Dirección:',
      reservationSummary.field.address || 'No especificada',
      leftMargin + colWidth + 8,
      rightY
    )

    // Teléfono
    rightY = drawField(
      'Teléfono:',
      reservationSummary.field.phone || 'No disponible',
      leftMargin + colWidth + 8,
      rightY
    )

    // Precio por hora
    rightY = drawField(
      'Precio/Hora:',
      `S/ ${reservationSummary.field.pricePerHour}`,
      leftMargin + colWidth + 8,
      rightY
    )

    yPos = Math.max(leftY, rightY) + 5

    // ═══════════════════════════════════════════════════════════════
    // SECCIÓN DE CLIENTE
    // ═══════════════════════════════════════════════════════════════

    yPos = drawSectionHeader('DATOS DEL CLIENTE', leftMargin, yPos, 180)

    pdf.setFillColor(...lightGray)
    pdf.rect(leftMargin, yPos, 180, 15, 'F')

    pdf.setTextColor(...grayText)
    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Teléfono de Contacto:', leftMargin + 5, yPos + 6)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(11)
    pdf.text(reservationSummary.phoneNumber || '-', leftMargin + 50, yPos + 6)

    if (reservationSummary.customerName) {
      pdf.setTextColor(...grayText)
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Nombre:', leftMargin + 100, yPos + 6)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(11)
      pdf.text(reservationSummary.customerName, leftMargin + 120, yPos + 6)
    }

    yPos += 22

    // ═══════════════════════════════════════════════════════════════
    // SECCIÓN DE PAGO - DESTACADA
    // ═══════════════════════════════════════════════════════════════

    yPos = drawSectionHeader('DETALLE DE PAGO', leftMargin, yPos, 180)

    // Calcular valores de precio
    const pricePerHour = reservationSummary.field?.pricePerHour || 0
    const totalHours = reservationSummary.totalHours || 1
    const originalAmount = reservationSummary.originalAmount || pricePerHour * totalHours
    const discountAmount = reservationSummary.discountAmount || 0
    const freeHoursUsed = reservationSummary.freeHoursUsed || 0
    const freeHoursDiscount = reservationSummary.freeHoursDiscount || 0
    const appliedDiscounts = reservationSummary.appliedDiscounts || []
    const finalTotal = reservationSummary.totalAmount || originalAmount

    // Calcular altura dinámica del recuadro según los descuentos
    let boxHeight = 28 // Altura base (subtotal + total)
    if (discountAmount > 0) boxHeight += 8
    if (freeHoursDiscount > 0) boxHeight += 8

    // Tabla de desglose
    pdf.setFillColor(...lightGray)
    pdf.rect(leftMargin, yPos, 180, boxHeight, 'F')

    // Desglose de precios
    pdf.setFontSize(10)
    pdf.setTextColor(...grayText)

    let lineY = yPos + 8

    // Subtotal (precio original)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Subtotal:', leftMargin + 5, lineY)
    pdf.text(`S/ ${pricePerHour} x ${totalHours} hrs`, leftMargin + 100, lineY)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`S/ ${originalAmount.toFixed(2)}`, leftMargin + 155, lineY)
    lineY += 8

    // Descuento por precio especial (si aplica)
    if (discountAmount > 0) {
      const discountName =
        appliedDiscounts.length > 0
          ? `Desc. ${appliedDiscounts[0].name} (${appliedDiscounts[0].value}%)`
          : 'Descuento especial'
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(34, 197, 94) // Verde
      pdf.text(discountName + ':', leftMargin + 5, lineY)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`- S/ ${discountAmount.toFixed(2)}`, leftMargin + 155, lineY)
      lineY += 8
    }

    // Descuento por horas gratis (si aplica)
    if (freeHoursDiscount > 0) {
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(245, 158, 11) // Ámbar
      pdf.text(`Horas gratis (${freeHoursUsed}h):`, leftMargin + 5, lineY)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`- S/ ${freeHoursDiscount.toFixed(2)}`, leftMargin + 155, lineY)
      lineY += 8
    }

    // Línea separadora
    pdf.setDrawColor(...grayText)
    pdf.setLineWidth(0.5)
    pdf.line(leftMargin + 5, lineY - 2, leftMargin + 175, lineY - 2)

    // Total
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.setTextColor(...brandDark)
    pdf.text('TOTAL A PAGAR:', leftMargin + 5, lineY + 6)
    pdf.setTextColor(...primaryColor)
    pdf.setFontSize(14)
    pdf.text(`S/ ${finalTotal.toFixed(2)}`, leftMargin + 145, lineY + 6)

    yPos += boxHeight + 7

    // ═══════════════════════════════════════════════════════════════
    // TÉRMINOS Y CONDICIONES
    // ═══════════════════════════════════════════════════════════════

    pdf.setFontSize(9)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(...grayText)
    pdf.text('INFORMACIÓN IMPORTANTE:', leftMargin, yPos)
    yPos += 6

    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(8)
    const terminos = isCashPayment
      ? [
          'Tu reserva está CONFIRMADA. Deberás pagar el monto total al llegar a la cancha.',
          'Llega 15 minutos antes de tu horario reservado para completar el pago.',
          'El no presentarse sin aviso previo puede resultar en penalizaciones futuras.',
        ]
      : [
          'Esta es una reserva CONFIRMADA con pago verificado.',
          'Llega 15 minutos antes de tu horario reservado.',
          'Presenta este voucher (digital o impreso) al llegar a la cancha.',
        ]

    terminos.forEach((termino) => {
      pdf.text(`• ${termino}`, leftMargin + 3, yPos)
      yPos += 5
    })

    // ═══════════════════════════════════════════════════════════════
    // FOOTER PROFESIONAL
    // ═══════════════════════════════════════════════════════════════

    // Línea decorativa antes del footer
    pdf.setFillColor(...brandYellow)
    pdf.rect(0, 275, 210, 2, 'F')

    // Footer oscuro
    pdf.setFillColor(...brandDark)
    pdf.rect(0, 277, 210, 20, 'F')

    // Texto del footer
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(...white)
    pdf.text('PICHANGUITAS - Sistema de Reservas de Canchas Deportivas', 105, 283, {
      align: 'center',
    })

    pdf.setTextColor(...brandYellow)
    pdf.setFontSize(7)
    pdf.text(
      `Documento generado el ${new Date().toLocaleDateString('es-PE')} a las ${new Date().toLocaleTimeString('es-PE')}`,
      105,
      288,
      { align: 'center' }
    )

    pdf.setTextColor(...grayText)
    pdf.text('Este documento es un comprobante válido de tu reserva', 105, 293, { align: 'center' })

    // Guardar el PDF automáticamente
    const fileName = `Voucher_${reservationSummary.id}_${new Date().getTime()}.pdf`
    console.log('💾 Guardando PDF:', fileName)
    pdf.save(fileName)
    console.log('✅ PDF guardado exitosamente')

    return pdf
  } catch (error) {
    console.error('❌ Error generando PDF:', error)
    throw error
  }
}

export const downloadReservationPDF = async (reservationSummary) => {
  console.log('📥 downloadReservationPDF llamado')
  await generateReservationPDF(reservationSummary)
  console.log('✅ downloadReservationPDF completado')
}
