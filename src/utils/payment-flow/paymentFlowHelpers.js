import { CreditCard, Smartphone } from 'lucide-react'
import imageCompression from 'browser-image-compression'

/**
 * Configuración de SweetAlert2
 */
export const SWAL_CONFIG = {
  confirmButtonColor: '#22c55e',
  showCloseButton: true,
  allowEscapeKey: true,
}

/**
 * Opciones de compresión para imágenes de voucher
 */
export const IMAGE_COMPRESSION_OPTIONS = {
  maxSizeMB: 0.3, // Máximo 300KB
  maxWidthOrHeight: 1280,
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.7,
}

/**
 * Obtiene el ícono correspondiente a un método de pago
 */
export const getMethodIcon = (method) => {
  if (method.id === 'yape' || method.id === 'plin') return Smartphone
  return CreditCard
}

/**
 * Valida el archivo de voucher
 */
export const validateVoucherFile = (file) => {
  if (!file) {
    return {
      valid: false,
      error: 'Por favor sube el comprobante de pago',
    }
  }

  if (file.size > 10 * 1024 * 1024) {
    return {
      valid: false,
      error: 'El archivo no debe ser mayor a 10MB',
    }
  }

  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Solo se permiten archivos de imagen',
    }
  }

  return { valid: true }
}

/**
 * Comprime una imagen de voucher
 */
export const compressVoucherImage = async (file) => {
  try {
    const compressedFile = await imageCompression(file, IMAGE_COMPRESSION_OPTIONS)
    const originalSizeKB = (file.size / 1024).toFixed(0)
    const compressedSizeKB = (compressedFile.size / 1024).toFixed(0)

    console.log(`📦 Comprobante comprimido: ${originalSizeKB}KB → ${compressedSizeKB}KB`)

    return {
      success: true,
      file: compressedFile,
    }
  } catch (error) {
    console.error('Error al comprimir imagen:', error)
    return {
      success: false,
      error: 'No se pudo comprimir el comprobante. Intenta con otra imagen.',
    }
  }
}

/**
 * Genera las instrucciones de pago para métodos bancarios
 *
 * @param {string} methodId - 'efectivo' | 'yape' | 'plin' | 'bcp' | 'interbank'
 * @param {object} method - Método de pago (cuenta, titular, etc.)
 * @param {number} amountToPay - Monto que el cliente paga AHORA (adelanto si la cancha lo exige, o total)
 * @param {object} selectedField - Cancha seleccionada
 * @param {array} _selectedTimeRanges
 * @param {object} advanceInfo - Información de adelanto (isAdvanceOnlinePayment, remainingAfterAdvance, ...)
 * @param {number} totalReservation - Total real de la reserva (para mostrar desglose)
 */
export const getPaymentInstructions = (
  methodId,
  method,
  amountToPay,
  selectedField,
  _selectedTimeRanges,
  advanceInfo = null,
  totalReservation = null
) => {
  const isAdvance = Boolean(advanceInfo?.isAdvanceOnlinePayment)
  const remainingAfterAdvance = Number(advanceInfo?.remainingAfterAdvance || 0)
  const totalToShow = totalReservation != null ? Number(totalReservation) : Number(amountToPay)
  const amountFmt = Number(amountToPay).toFixed(2)
  const totalFmt = totalToShow.toFixed(2)
  const remainingFmt = remainingAfterAdvance.toFixed(2)

  // Etiqueta y bloque de desglose reutilizable
  const amountLabel = isAdvance ? 'Monto del adelanto' : 'Monto'
  const advanceBreakdownBlock = isAdvance
    ? `
        <div class="mt-2 p-2 rounded bg-amber-100 border border-amber-300 text-xs text-amber-800">
          💡 Estás pagando solo el <strong>adelanto</strong> para confirmar tu reserva.<br/>
          Saldo restante (se paga en cancha): <strong>S/ ${remainingFmt}</strong><br/>
          Total de la reserva: <strong>S/ ${totalFmt}</strong>
        </div>
      `
    : ''

  const instructions = {
    efectivo: {
      icon: 'question',
      title: '🔒 Confirmar Reserva Sin Pago',
      html: `
        <div class="text-left space-y-4">
          <div class="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
            <h4 class="font-semibold text-amber-800 mb-3">⚠️ Confirmación importante:</h4>
            <p class="text-sm text-amber-700 mb-3">
              ¿Está dispuesto a cancelar sabiendo que el monto pendiente por cancelar es de
              <strong class="text-lg">S/ ${totalFmt}</strong> soles?
            </p>
            <ul class="space-y-2 text-sm text-amber-700">
              <li>• Su reserva quedará confirmada sin pago previo</li>
              <li>• Deberá cancelar el monto completo al llegar a la cancha</li>
              <li>• El encargado estará esperando su pago antes del partido</li>
              <li>• Lleve el monto exacto si es posible</li>
            </ul>
          </div>
          <div class="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
            <p class="text-sm text-red-700">
              <strong>Advertencia:</strong> Si no se presenta o cancela muy tarde, podría ser penalizado para futuras reservas.
            </p>
          </div>
        </div>
      `,
      confirmButtonText: 'Sí, confirmar reserva sin pago',
      confirmButtonColor: '#f59e0b',
    },
    yape: {
      icon: 'info',
      title: isAdvance ? 'Pagar adelanto con Yape' : 'Pagar con Yape',
      html: `
        <div class="text-left space-y-4">
          <div class="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <h4 class="font-semibold text-purple-800 mb-2">Instrucciones:</h4>
            <ol class="space-y-2 text-sm text-purple-700">
              <li>1. Abre tu app Yape</li>
              <li>2. Selecciona "Transferir dinero"</li>
              <li>3. Ingresa el número: <strong>${method?.accountNumber || 'No configurado'}</strong></li>
              <li>4. ${amountLabel}: <strong>S/ ${amountFmt}</strong></li>
              <li>5. Concepto: <strong>${isAdvance ? 'Adelanto ' : ''}Cancha ${selectedField?.name}</strong></li>
              <li>6. Confirma la transferencia</li>
            </ol>
            ${advanceBreakdownBlock}
          </div>
          <div class="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
            <p class="text-sm text-amber-700">
              <strong>Importante:</strong> Después de realizar el pago, sube el voucher de confirmación.
            </p>
          </div>
        </div>
      `,
      confirmButtonText: 'Ya realicé el pago',
    },
    plin: {
      icon: 'info',
      title: isAdvance ? 'Pagar adelanto con Plin' : 'Pagar con Plin',
      html: `
        <div class="text-left space-y-4">
          <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 class="font-semibold text-blue-800 mb-2">Instrucciones:</h4>
            <ol class="space-y-2 text-sm text-blue-700">
              <li>1. Abre tu app Plin</li>
              <li>2. Selecciona "Enviar dinero"</li>
              <li>3. Ingresa el número: <strong>${method?.accountNumber || 'No configurado'}</strong></li>
              <li>4. ${amountLabel}: <strong>S/ ${amountFmt}</strong></li>
              <li>5. Concepto: <strong>${isAdvance ? 'Adelanto ' : ''}Reserva ${selectedField?.name}</strong></li>
              <li>6. Confirma la operación</li>
            </ol>
            ${advanceBreakdownBlock}
          </div>
          <div class="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
            <p class="text-sm text-amber-700">
              <strong>Importante:</strong> Después de realizar el pago, sube el voucher de confirmación.
            </p>
          </div>
        </div>
      `,
      confirmButtonText: 'Ya realicé el pago',
    },
    bcp: {
      icon: 'info',
      title: isAdvance ? 'Transferencia BCP (Adelanto)' : 'Transferencia BCP',
      html: `
        <div class="text-left space-y-4">
          <div class="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 class="font-semibold text-blue-800 mb-2">Datos para transferencia:</h4>
            <div class="space-y-2 text-sm text-blue-700">
              <div><strong>Banco:</strong> BCP</div>
              <div class="flex items-center justify-between">
                <span><strong>Número de cuenta:</strong> ${method?.accountNumber}</span>
                <button onclick="navigator.clipboard.writeText('${method?.accountNumber}')"
                        class="ml-2 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded transition-colors">
                  Copiar
                </button>
              </div>
              <div><strong>Titular:</strong> Canchas Apurímac</div>
              <div><strong>${amountLabel}:</strong> S/ ${amountFmt}</div>
              <div><strong>Concepto:</strong> ${isAdvance ? 'Adelanto ' : ''}Reserva ${selectedField?.name}</div>
            </div>
            ${advanceBreakdownBlock}
          </div>
          <div class="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
            <p class="text-sm text-amber-700">
              <strong>Importante:</strong> Después de realizar la transferencia, sube el voucher de confirmación.
            </p>
          </div>
        </div>
      `,
      confirmButtonText: 'Ya realicé la transferencia',
    },
    interbank: {
      icon: 'info',
      title: isAdvance ? 'Transferencia Interbank (Adelanto)' : 'Transferencia Interbank',
      html: `
        <div class="text-left space-y-4">
          <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <h4 class="font-semibold text-green-800 mb-2">Datos para transferencia:</h4>
            <div class="space-y-2 text-sm text-green-700">
              <div><strong>Banco:</strong> Interbank</div>
              <div class="flex items-center justify-between">
                <span><strong>Número de cuenta:</strong> ${method?.accountNumber}</span>
                <button onclick="navigator.clipboard.writeText('${method?.accountNumber}')"
                        class="ml-2 px-2 py-1 bg-green-100 hover:bg-green-200 text-green-800 text-xs rounded transition-colors">
                  Copiar
                </button>
              </div>
              <div><strong>Titular:</strong> Canchas Apurímac</div>
              <div><strong>${amountLabel}:</strong> S/ ${amountFmt}</div>
              <div><strong>Concepto:</strong> ${isAdvance ? 'Adelanto ' : ''}Reserva ${selectedField?.name}</div>
            </div>
            ${advanceBreakdownBlock}
          </div>
          <div class="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-500">
            <p class="text-sm text-amber-700">
              <strong>Importante:</strong> Después de realizar la transferencia, sube el voucher de confirmación.
            </p>
          </div>
        </div>
      `,
      confirmButtonText: 'Ya realicé la transferencia',
    },
  }

  return instructions[methodId] || null
}

/**
 * Genera los datos de reserva para el PDF
 */
export const generateReservationData = (
  selectedField,
  selectedDate,
  selectedTimeRanges,
  timeRanges,
  phoneNumber,
  paymentMethod,
  totalAmount
) => {
  return {
    id: Date.now().toString().slice(-6),
    createdAt: new Date(),
    field: {
      name: selectedField?.name,
      address:
        selectedField?.address ||
        `${selectedField?.distrito}, ${selectedField?.provincia}, Apurímac`,
      phone: selectedField?.phone || null,
      pricePerHour: selectedField?.pricePerHour,
      amenities: selectedField?.amenities || [],
    },
    date: selectedDate,
    timeSlots: selectedTimeRanges.map((id) => timeRanges.find((tr) => tr.id === id)?.label),
    totalHours: selectedTimeRanges.length,
    phoneNumber: phoneNumber,
    totalAmount: totalAmount,
    paymentMethod: paymentMethod,
    isPendingCashPayment: paymentMethod === 'efectivo',
  }
}

/**
 * Genera los datos para WhatsApp
 */
export const generateWhatsAppData = (
  phoneNumber,
  selectedDate,
  selectedTimeRanges,
  timeRanges,
  totalAmount,
  paymentMethod
) => {
  return {
    phoneNumber: phoneNumber,
    customerName: phoneNumber,
    date: selectedDate,
    startTime: timeRanges.find((tr) => tr.id === selectedTimeRanges[0])?.startTime,
    endTime: timeRanges.find((tr) => tr.id === selectedTimeRanges[selectedTimeRanges.length - 1])
      ?.endTime,
    totalAmount: totalAmount,
    paymentMethod: paymentMethod,
    totalHours: selectedTimeRanges.length,
  }
}
