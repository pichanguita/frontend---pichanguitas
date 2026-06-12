import React from 'react'
import {
  DollarSign,
  Clock,
  CheckCircle,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  UserX,
  XCircle,
  Globe,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  getStatusColor,
  isPaymentSettled,
} from '../../utils/payment-management/paymentManagementHelpers'
import { parseLocalDate, formatDate } from '../../utils/dateFormatters'
import { RESERVATION_STATUS } from '../../constants/reservationStatus'
import { PAYMENT_STATUS, PAID_PAYMENT_STATUSES } from '../../constants/paymentStatus'

/**
 * Componente de tabla de reservas con pagos
 */
const PaymentReservationsTable = ({
  filteredReservations,
  fields,
  calculateAmounts,
  canRegisterPayment,
  handleCompletePayment,
  handleNoShow,
  readOnly = false,
  activeTab = 'pending',
}) => {
  const isCompletedTab = activeTab === 'completed'
  if (filteredReservations.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-custom overflow-hidden">
        <div className="text-center py-12">
          <DollarSign className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
          <p className="text-secondary-500">No hay reservas para mostrar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-custom overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary-50">
            <tr>
              <th className="text-left py-4 px-6 font-medium text-secondary-700">Cliente</th>
              <th className="text-left py-4 px-6 font-medium text-secondary-700">Cancha</th>
              <th className="text-left py-4 px-6 font-medium text-secondary-700">Fecha/Hora</th>
              <th className="text-left py-4 px-6 font-medium text-secondary-700">
                {isCompletedTab ? 'Cobrado' : 'Montos'}
              </th>
              <th className="text-left py-4 px-6 font-medium text-secondary-700">Estado</th>
              {!readOnly && (
                <th className="text-left py-4 px-6 font-medium text-secondary-700">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100">
            {filteredReservations.map((reservation, index) => {
              // Normalizar field_id
              const fieldId = reservation.fieldId || reservation.field_id
              const field = fields.find((f) => f.id === fieldId)

              const amounts = calculateAmounts(reservation)
              const statusColor = getStatusColor(reservation)
              const resDate = parseLocalDate(reservation.date)
              const isToday = resDate.toDateString() === new Date().toDateString()

              const paymentStatus = reservation.paymentStatus || reservation.payment_status
              const reservationStatus = reservation.status || RESERVATION_STATUS.PENDING
              const isCancelled = reservationStatus === RESERVATION_STATUS.CANCELLED
              const isRejected = reservationStatus === RESERVATION_STATUS.REJECTED
              const isPaidStatus = PAID_PAYMENT_STATUSES.includes(paymentStatus)
              const isNoShow =
                paymentStatus === PAYMENT_STATUS.NO_SHOW ||
                reservationStatus === RESERVATION_STATUS.NO_SHOW
              // Cobro cerrado (pagado, no-show o reserva terminal): regla única
              // compartida con el filtro de la lista.
              const isSettled = isPaymentSettled(reservation)
              const isOverdue = !isSettled && resDate < new Date()

              // Reserva pública hecha desde la landing: es un 'customer_booking'
              // cuyo cliente NO tiene cuenta de login (customer_user_id == null).
              // Distingue de reservas creadas por admin ('admin_booking') y de
              // clientes registrados que reservan desde su panel.
              const customerUserId = reservation.customerUserId ?? reservation.customer_user_id
              const isFromLanding =
                reservation.type === 'customer_booking' && customerUserId == null
              const phone = reservation.phoneNumber || reservation.customer_phone
              // Para reservas de landing, el identificador del cliente es su teléfono
              // (la landing no pide nombre). Esto también corrige registros antiguos
              // que quedaron guardados como "admin" sin necesidad de migrar datos.
              const displayName = isFromLanding
                ? phone || 'N/A'
                : reservation.customerName || reservation.customer_name || 'N/A'

              return (
                <motion.tr
                  key={reservation.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`hover:bg-secondary-50 transition-colors ${
                    isCancelled || isRejected
                      ? 'bg-gray-50 opacity-75'
                      : isOverdue
                        ? 'bg-red-50'
                        : isToday
                          ? 'bg-amber-50'
                          : ''
                  }`}
                >
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium text-secondary-900 flex items-center gap-2">
                        <User className="w-4 h-4 text-secondary-400" />
                        {displayName}
                        {isFromLanding && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 border border-blue-100">
                            <Globe className="w-3 h-3" />
                            Desde Landing
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-secondary-600 flex items-center gap-2 mt-1">
                        <Phone className="w-3 h-3" />
                        {phone || 'N/A'}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-secondary-400" />
                      <span className="font-medium">
                        {field?.name || reservation.fieldName || reservation.field_name || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-secondary-400" />
                        {formatDate(reservation.date)}
                      </p>
                      <p className="text-sm text-secondary-600 flex items-center gap-2 mt-1">
                        <Clock className="w-3 h-3" />
                        {reservation.time ||
                          `${reservation.startTime || reservation.start_time} - ${reservation.endTime || reservation.end_time}`}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="space-y-1">
                      {/* Para reservas canceladas - mostrar info diferente */}
                      {isCancelled ? (
                        (() => {
                          const refundAmount =
                            parseFloat(reservation.refundAmount || reservation.refund_amount) || 0
                          const refundStatus = reservation.refundStatus || reservation.refund_status
                          const hasRefund = refundAmount > 0

                          return (
                            <>
                              {/* Total original (tachado) */}
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">Total original:</span>
                                <span className="font-medium text-gray-400 line-through">
                                  S/{' '}
                                  {amounts.total.toLocaleString('es-PE', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </span>
                              </div>
                              {/* Adelanto recibido */}
                              {amounts.advance > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-green-600">Adelanto:</span>
                                  <span className="text-sm text-green-600 font-medium">
                                    S/{' '}
                                    {amounts.advance.toLocaleString('es-PE', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              )}
                              {/* Reembolso (si hay) */}
                              {hasRefund && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-rose-600">
                                    Reembolso{' '}
                                    {refundStatus === 'processed'
                                      ? '(procesado)'
                                      : refundStatus === 'pending'
                                        ? '(pendiente)'
                                        : ''}
                                    :
                                  </span>
                                  <span
                                    className={`text-sm font-medium ${refundStatus === 'processed' ? 'text-rose-600' : 'text-rose-400'}`}
                                  >
                                    -S/{' '}
                                    {refundAmount.toLocaleString('es-PE', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              )}
                              {/* Ingreso neto (adelanto - reembolso) */}
                              {amounts.advance > 0 && (
                                <div className="flex justify-between items-center border-t border-gray-200 pt-1 mt-1">
                                  <span className="text-xs text-gray-600 font-medium">
                                    Ingreso neto:
                                  </span>
                                  <span className="text-sm text-gray-700 font-bold">
                                    S/{' '}
                                    {Math.max(
                                      0,
                                      amounts.advance -
                                        (refundStatus === 'processed' ? refundAmount : 0)
                                    ).toLocaleString('es-PE', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              )}
                            </>
                          )
                        })()
                      ) : (
                        <>
                          {/* Total */}
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-secondary-500">Total:</span>
                            <span
                              className={`font-bold ${
                                isPaidStatus
                                  ? 'text-green-600'
                                  : isNoShow
                                    ? 'text-orange-600'
                                    : 'text-secondary-900'
                              }`}
                            >
                              S/{' '}
                              {amounts.total.toLocaleString('es-PE', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>

                          {/* Adelanto pagado (si > 0) */}
                          {amounts.advance > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-green-600">Adelanto:</span>
                              <span className="text-sm text-green-600 font-medium">
                                S/{' '}
                                {amounts.advance.toLocaleString('es-PE', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          )}

                          {/* Pendiente (si > 0 y no está completamente pagado) */}
                          {amounts.pending > 0 && !isPaidStatus && (
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-amber-600">Pendiente:</span>
                              <span className="text-sm text-amber-600 font-semibold">
                                S/{' '}
                                {amounts.pending.toLocaleString('es-PE', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isCancelled || isRejected ? 'text-gray-600 bg-gray-100' : statusColor
                      }`}
                    >
                      {isCancelled
                        ? 'Cancelada'
                        : isRejected
                          ? 'Rechazada'
                          : isPaidStatus || reservationStatus === RESERVATION_STATUS.COMPLETED
                            ? 'Pagado'
                            : isNoShow
                              ? 'No se Presentó'
                              : isOverdue
                                ? 'Por Confirmar'
                                : isToday
                                  ? 'Hoy'
                                  : 'Pendiente'}
                    </span>
                  </td>
                  {!readOnly && (
                    <td className="py-4 px-6">
                      {isCancelled ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <XCircle className="w-5 h-5" />
                          <span className="text-sm">Cancelada</span>
                        </div>
                      ) : isRejected ? (
                        <div className="flex items-center gap-2 text-gray-500">
                          <XCircle className="w-5 h-5" />
                          <span className="text-sm">Rechazada</span>
                        </div>
                      ) : isNoShow ? (
                        <div className="flex items-center gap-2 text-orange-600">
                          <UserX className="w-5 h-5" />
                          <span className="text-sm">No se Presentó</span>
                        </div>
                      ) : !isSettled ? (
                        (() => {
                          const paymentCheck = canRegisterPayment(reservation)
                          return (
                            <div className="flex flex-col gap-2">
                              <button
                                onClick={() => handleCompletePayment(reservation)}
                                disabled={!paymentCheck.enabled}
                                title={paymentCheck.reason}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                                  paymentCheck.enabled
                                    ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                              >
                                <CreditCard className="w-4 h-4" />
                                Registrar Pago
                              </button>
                              {!paymentCheck.enabled && paymentCheck.reason && (
                                <span className="text-xs text-amber-600 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {paymentCheck.reason}
                                </span>
                              )}
                              {/* Botón No Show - solo visible cuando ya es la hora */}
                              {paymentCheck.enabled && (
                                <button
                                  onClick={() => handleNoShow(reservation)}
                                  className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white"
                                >
                                  <UserX className="w-4 h-4" />
                                  Cliente No Llegó
                                </button>
                              )}
                            </div>
                          )
                        })()
                      ) : (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm">Completado</span>
                        </div>
                      )}
                    </td>
                  )}
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PaymentReservationsTable
