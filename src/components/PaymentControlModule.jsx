import React from 'react'
import Swal from 'sweetalert2'
import { usePaymentControl } from '../hooks/usePaymentControl'
import { handleRegisterPayment, handleViewPaymentDetails } from '../utils/payment/paymentHandlers'
import {
  PaymentHeader,
  PaymentMetrics,
  PaymentMonthSelector,
  PaymentTable,
  FieldsWithDebt,
} from './payment-control'

/**
 * PaymentControlModule - Módulo de Control de Pagos
 *
 * Componente orquestador que coordina:
 * - Custom hook para lógica de estado (usePaymentControl)
 * - Handlers para acciones (paymentHandlers)
 * - Componentes UI especializados
 *
 * Sistema simplificado: Los cobros se calculan automáticamente desde payment_configs
 */
const PaymentControlModule = () => {
  const {
    // Estado
    selectedYear,
    selectedMonth,
    payments,
    metrics,
    fieldsWithDebt,

    // Setters
    setSelectedYear,
    setSelectedMonth,

    // Acciones
    refreshAll,
    registerPayment,
    confirmPayment,
    rejectPayment,
  } = usePaymentControl()

  // Handler para confirmar pago reportado
  const handleConfirmPayment = async (payment) => {
    const result = await Swal.fire({
      title: 'Confirmar Pago',
      html: `
        <p>¿Confirmar el pago reportado por <strong>${payment.adminName}</strong>?</p>
        <p class="text-sm text-gray-600 mt-2">Cancha: ${payment.fieldName}</p>
        <p class="text-sm text-gray-600">Monto: S/. ${payment.amount.toFixed(2)}</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Confirmar Pago',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed) {
      const success = await confirmPayment(payment)
      if (success) {
        Swal.fire('Confirmado', 'El pago ha sido confirmado exitosamente', 'success')
      } else {
        Swal.fire('Error', 'No se pudo confirmar el pago', 'error')
      }
    }
  }

  // Handler para rechazar pago reportado
  const handleRejectPayment = async (payment) => {
    const result = await Swal.fire({
      title: 'Rechazar Pago',
      html: `
        <p>¿Rechazar el pago reportado por <strong>${payment.adminName}</strong>?</p>
        <p class="text-sm text-gray-600 mt-2">Cancha: ${payment.fieldName}</p>
      `,
      input: 'textarea',
      inputLabel: 'Motivo del rechazo',
      inputPlaceholder: 'Ingresa el motivo del rechazo...',
      inputValidator: (value) => {
        if (!value) return 'Debes ingresar un motivo'
      },
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Rechazar',
      cancelButtonText: 'Cancelar',
    })

    if (result.isConfirmed && result.value) {
      const success = await rejectPayment(payment, result.value)
      if (success) {
        Swal.fire('Rechazado', 'El pago ha sido rechazado. El admin será notificado.', 'success')
      } else {
        Swal.fire('Error', 'No se pudo rechazar el pago', 'error')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PaymentHeader />

      {/* Métricas del dashboard */}
      <PaymentMetrics metrics={metrics} />

      {/* Selector de mes/año */}
      <PaymentMonthSelector
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        onRefresh={refreshAll}
      />

      {/* Tabla de pagos */}
      <PaymentTable
        payments={payments}
        onViewDetails={handleViewPaymentDetails}
        onRegisterPayment={(payment) =>
          handleRegisterPayment({
            payment,
            registerPayment,
            refreshAll,
          })
        }
        onConfirmPayment={handleConfirmPayment}
        onRejectPayment={handleRejectPayment}
      />

      {/* Lista de canchas con deuda */}
      <FieldsWithDebt fieldsWithDebt={fieldsWithDebt} />
    </div>
  )
}

export default PaymentControlModule
