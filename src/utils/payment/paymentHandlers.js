/**
 * Handlers para PaymentControlModule
 *
 * Maneja las acciones de generación, registro y visualización de pagos con SweetAlert
 */

import Swal from 'sweetalert2'
import { getPaymentStatusInfo, getMonthName } from './paymentUtils'
import { API_CONFIG } from '../../config/api.config'

/**
 * Maneja la generación de pagos mensuales
 */
export const handleGeneratePayments = async ({
  selectedYear,
  selectedMonth,
  getAllPaymentConfigs,
  generateMonthlyPayments,
  _refreshAll,
}) => {
  const configs = getAllPaymentConfigs()
  const activeConfigs = configs.filter((c) => c.isActive)

  if (activeConfigs.length === 0) {
    // Intentar generar de todas formas (los configs pueden estar en la BD)
    const result = await Swal.fire({
      title: '¿Generar pagos mensuales?',
      html: `Se generarán los cobros para <strong>${getMonthName(selectedMonth)} ${selectedYear}</strong> basados en las configuraciones de la base de datos.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, generar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
    })

    if (result.isConfirmed) {
      try {
        const generated = await generateMonthlyPayments(selectedYear, selectedMonth)
        if (generated > 0) {
          Swal.fire({
            icon: 'success',
            title: '¡Pagos generados!',
            text: `Se generaron ${generated} pagos pendientes`,
            timer: 2000,
          })
          await refreshAll()
        } else {
          Swal.fire({
            icon: 'info',
            title: 'Ya existen',
            text: 'Los pagos para este mes ya fueron generados',
          })
        }
      } catch (_error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron generar los pagos',
        })
      }
    }
    return
  }

  const result = await Swal.fire({
    title: '¿Generar pagos mensuales?',
    html: `Se crearán <strong>${activeConfigs.length}</strong> pagos pendientes para <strong>${getMonthName(
      selectedMonth
    )} ${selectedYear}</strong>`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, generar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#10b981',
  })

  if (result.isConfirmed) {
    try {
      const generated = await generateMonthlyPayments(selectedYear, selectedMonth)

      if (generated > 0) {
        Swal.fire({
          icon: 'success',
          title: '¡Pagos generados!',
          text: `Se generaron ${generated} pagos pendientes`,
          timer: 2000,
        })
        await refreshAll()
      } else {
        Swal.fire({
          icon: 'info',
          title: 'Ya existen',
          text: 'Los pagos para este mes ya fueron generados',
        })
      }
    } catch (_error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron generar los pagos',
      })
    }
  }
}

/**
 * Maneja el registro de un pago
 */
export const handleRegisterPayment = async ({ payment, registerPayment, refreshAll }) => {
  const result = await Swal.fire({
    title: '¿Confirmar pago?',
    html: `
      <div class="text-center">
        <p class="font-bold text-lg">${payment.fieldName}</p>
        <p class="text-2xl font-bold text-green-600 mt-3">S/. ${payment.amount.toFixed(2)}</p>
      </div>
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, registrar pago',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#10b981',
  })

  if (result.isConfirmed) {
    const success = await registerPayment(payment)

    if (success) {
      Swal.fire({
        icon: 'success',
        title: '¡Pago registrado!',
        timer: 2000,
        showConfirmButton: false,
      })
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo registrar el pago',
      })
    }
  }
}

/**
 * Maneja la visualización de detalles de un pago
 */
export const handleViewPaymentDetails = (payment) => {
  const statusInfo = getPaymentStatusInfo(payment)

  // Construir URL del voucher si existe
  // Soportar URLs absolutas (Wasabi) y relativas (/uploads/...)
  const voucherUrl = payment.payment_voucher_url
    ? payment.payment_voucher_url.startsWith('http')
      ? payment.payment_voucher_url
      : `${API_CONFIG.BASE_URL}${payment.payment_voucher_url}`
    : null

  Swal.fire({
    title: 'Detalles del Pago',
    html: `
      <div class="text-left space-y-3">
        <div class="bg-gray-50 p-3 rounded">
          <p class="text-sm text-gray-600">Cancha:</p>
          <p class="font-bold text-lg">${payment.fieldName}</p>
          <p class="text-sm text-gray-500">${payment.adminName || 'Admin'}</p>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <p class="text-sm text-gray-600">Monto:</p>
            <p class="font-bold text-green-600">S/. ${payment.amount.toFixed(2)}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Estado:</p>
            <p class="font-bold ${statusInfo.color}">${statusInfo.text}</p>
          </div>
        </div>
        <div>
          <p class="text-sm text-gray-600">Fecha de vencimiento:</p>
          <p class="font-medium">${new Date(payment.dueDate).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}</p>
        </div>
        ${
          payment.status === 'reported'
            ? `
          <div class="bg-blue-50 p-3 rounded border border-blue-200">
            <p class="text-sm font-semibold text-blue-800 mb-2">Pago Reportado - Pendiente de Confirmación</p>
            <div class="space-y-1 text-sm">
              ${payment.payment_method ? `<p><span class="text-gray-600">Método:</span> <span class="font-medium">${payment.payment_method}</span></p>` : ''}
              ${payment.payment_reference ? `<p><span class="text-gray-600">Referencia:</span> <span class="font-medium">${payment.payment_reference}</span></p>` : ''}
              ${payment.reportedAt ? `<p><span class="text-gray-600">Reportado el:</span> <span class="font-medium">${new Date(payment.reportedAt).toLocaleDateString('es-PE')}</span></p>` : ''}
              ${payment.notes ? `<p><span class="text-gray-600">Notas:</span> <span class="font-medium">${payment.notes}</span></p>` : ''}
            </div>
            ${
              voucherUrl
                ? `
              <div class="mt-3">
                <p class="text-sm text-gray-600 mb-2">Comprobante:</p>
                <img src="${voucherUrl}" alt="Comprobante de pago" class="max-w-full max-h-48 rounded border cursor-pointer" onclick="window.open('${voucherUrl}', '_blank')" />
              </div>
            `
                : ''
            }
          </div>
        `
            : ''
        }
        ${
          payment.status === 'paid' && payment.paidAt
            ? `
          <div class="bg-green-50 p-3 rounded border border-green-200">
            <p class="text-sm font-semibold text-green-800 mb-2">Pago Confirmado</p>
            <div class="space-y-1 text-sm">
              <p><span class="text-gray-600">Pagado el:</span> <span class="font-medium">${new Date(
                payment.paidAt
              ).toLocaleDateString('es-PE')}</span></p>
              ${payment.payment_method ? `<p><span class="text-gray-600">Método:</span> <span class="font-medium">${payment.payment_method}</span></p>` : ''}
              ${payment.payment_reference ? `<p><span class="text-gray-600">Referencia:</span> <span class="font-medium">${payment.payment_reference}</span></p>` : ''}
            </div>
            ${
              voucherUrl
                ? `
              <div class="mt-3">
                <p class="text-sm text-gray-600 mb-2">Comprobante:</p>
                <img src="${voucherUrl}" alt="Comprobante de pago" class="max-w-full max-h-48 rounded border cursor-pointer" onclick="window.open('${voucherUrl}', '_blank')" />
              </div>
            `
                : ''
            }
          </div>
        `
            : ''
        }
      </div>
    `,
    confirmButtonText: 'Cerrar',
    width: '500px',
  })
}
