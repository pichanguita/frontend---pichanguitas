import React from 'react'
import { TrendingUp, CheckCircle, Clock, AlertCircle, FileCheck } from 'lucide-react'

const PaymentMetrics = ({ metrics }) => {
  if (!metrics) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">Total Esperado</div>
          <TrendingUp className="w-5 h-5 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-gray-900">
          S/. {metrics.totalExpected.toFixed(2)}
        </div>
        <div className="text-xs text-gray-500 mt-1">{metrics.totalFields} canchas activas</div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">Total Cobrado</div>
          <CheckCircle className="w-5 h-5 text-green-500" />
        </div>
        <div className="text-2xl font-bold text-green-600">S/. {metrics.totalPaid.toFixed(2)}</div>
        <div className="text-xs text-gray-500 mt-1">{metrics.paidCount} pagos recibidos</div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 border-2 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">Por Confirmar</div>
          <FileCheck className="w-5 h-5 text-blue-500" />
        </div>
        <div className="text-2xl font-bold text-blue-600">{metrics.reportedCount || 0}</div>
        <div className="text-xs text-gray-500 mt-1">
          S/. {(metrics.totalReported || 0).toFixed(2)} reportados
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">Pendiente</div>
          <Clock className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="text-2xl font-bold text-yellow-600">
          S/. {metrics.totalPending.toFixed(2)}
        </div>
        <div className="text-xs text-gray-500 mt-1">{metrics.pendingCount} pagos pendientes</div>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-600">Atrasados</div>
          <AlertCircle className="w-5 h-5 text-red-500" />
        </div>
        <div className="text-2xl font-bold text-red-600">{metrics.overdueCount}</div>
        <div className="text-xs text-gray-500 mt-1">Pagos vencidos</div>
      </div>
    </div>
  )
}

export default PaymentMetrics
