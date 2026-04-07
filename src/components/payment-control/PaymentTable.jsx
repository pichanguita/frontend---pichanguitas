import React from 'react'
import { DollarSign, CheckCircle, Eye, AlertCircle, Clock, FileCheck, XCircle } from 'lucide-react'
import { getPaymentStatusInfo } from '../../utils/payment/paymentUtils'

// Map de iconos
const IconMap = {
  CheckCircle: CheckCircle,
  AlertCircle: AlertCircle,
  Clock: Clock,
  FileCheck: FileCheck,
}

const PaymentTable = ({
  payments,
  onViewDetails,
  onRegisterPayment,
  onConfirmPayment,
  onRejectPayment,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                Cancha
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                Monto
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">
                Vencimiento
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                Estado
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                  <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">No hay configuraciones de pago activas</p>
                  <p className="text-sm">
                    Configura los pagos mensuales en la sección de configuración
                  </p>
                </td>
              </tr>
            ) : (
              payments.map((payment) => {
                const statusInfo = getPaymentStatusInfo(payment)
                const Icon = IconMap[statusInfo.iconType]
                return (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{payment.fieldName}</div>
                      <div className="text-sm text-gray-500">{payment.adminName || 'Admin'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-green-600">
                        S/. {payment.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">Día {payment.dueDay}</div>
                      {payment.paidAt && (
                        <div className="text-xs text-green-600">
                          Pagado: {new Date(payment.paidAt).toLocaleDateString('es-PE')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bgColor} ${statusInfo.color}`}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        {statusInfo.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onViewDetails(payment)}
                          className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(payment.status === 'pending' || payment.status === 'overdue') && (
                          <button
                            onClick={() => onRegisterPayment(payment)}
                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Registrar Pago
                          </button>
                        )}
                        {payment.status === 'reported' && onConfirmPayment && onRejectPayment && (
                          <>
                            <button
                              onClick={() => onConfirmPayment(payment)}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                              title="Confirmar pago reportado"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Confirmar
                            </button>
                            <button
                              onClick={() => onRejectPayment(payment)}
                              className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                              title="Rechazar pago reportado"
                            >
                              <XCircle className="w-4 h-4" />
                              Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PaymentTable
