import React from 'react'
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  AlertTriangle,
  XCircle,
  RefreshCcw,
} from 'lucide-react'

/**
 * Componente que muestra las tarjetas de estadísticas de pagos.
 * El monto del adelanto es por-cancha (fields.advance_payment_amount),
 * no se muestra un porcentaje global.
 */
const PaymentStatsCards = ({ paymentStats }) => {
  return (
    <div className="bg-white rounded-xl shadow-custom p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
          <DollarSign className="w-7 h-7 text-primary-600" />
          Gestión de Pagos
        </h2>
        <p className="text-secondary-600 mt-1">
          Administra los pagos pendientes y completados de las reservas
        </p>
        <div className="flex items-center gap-2 mt-2 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg inline-flex">
          <Clock className="w-3.5 h-3.5" />
          <span>
            Los pagos solo se pueden registrar el día de la reserva, a partir de su hora de inicio
          </span>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-900">
            S/ {paymentStats.totalPending.toFixed(0)}
          </p>
          <p className="text-xs text-red-700">Total Pendiente</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-900">
            S/ {paymentStats.totalCollected.toFixed(0)}
          </p>
          <p className="text-xs text-green-700">Total Cobrado</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900">{paymentStats.pendingCount}</p>
          <p className="text-xs text-amber-700">Pagos Pendientes</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-900">
            S/ {paymentStats.todayPending.toFixed(0)}
          </p>
          <p className="text-xs text-blue-700">Pendiente Hoy</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-900">{paymentStats.completedCount}</p>
          <p className="text-xs text-purple-700">Completados</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-900">{paymentStats.overdueCount}</p>
          <p className="text-xs text-amber-700">Por Confirmar</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-900">
            S/ {(paymentStats.overdueAmount || 0).toFixed(0)}
          </p>
          <p className="text-xs text-yellow-700">Monto Por Confirmar</p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-orange-900">{paymentStats.noShowCount}</p>
          <p className="text-xs text-orange-700">No se Presentaron</p>
        </div>

        {/* Tarjeta de Total Reembolsado - Solo se muestra si hay reembolsos */}
        {(paymentStats.totalRefunded > 0 || paymentStats.refundedCount > 0) && (
          <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <RefreshCcw className="w-6 h-6 text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-rose-900">
              S/ {(paymentStats.totalRefunded || 0).toFixed(0)}
            </p>
            <p className="text-xs text-rose-700">
              Total Reembolsado ({paymentStats.refundedCount || 0})
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentStatsCards
