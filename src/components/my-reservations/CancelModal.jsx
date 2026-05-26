import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'
import { formatReservationDate } from '../../utils/reservations/formatters'

const CancelModal = ({ isOpen, reservation, onClose, onConfirm }) => {
  if (!reservation) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-200">
              <h2 className="text-xl font-bold text-secondary-900">Cancelar Reserva</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-secondary-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-secondary-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Reservation Details */}
              <div className="bg-secondary-50 rounded-lg p-4">
                <h3 className="font-semibold text-secondary-900 mb-2">{reservation.fieldName}</h3>
                <p className="text-sm text-secondary-600">
                  {formatReservationDate(reservation.date)}
                </p>
                <p className="text-sm text-secondary-600">
                  {reservation.startTime} - {reservation.endTime}
                </p>
              </div>

              {/* Cancellation Policy */}
              {reservation.validation?.hoursUntilEvent != null && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Política de Cancelación:</p>
                      <p>
                        Faltan <strong>{reservation.validation.hoursUntilEvent} horas</strong> para
                        tu reserva.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Refund Info - ✅ FIX: Mostrar mensajes específicos según el caso */}
              {reservation.validation?.refundAmount > 0 ? (
                // CASO 1: Hay reembolso que recibir
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Reembolso</h4>
                  <div className="space-y-1 text-sm text-green-800">
                    <p>
                      Monto pagado:{' '}
                      <strong>S/ {(reservation.validation.totalPaid || 0).toFixed(2)}</strong>
                    </p>
                    <p>
                      Porcentaje de reembolso:{' '}
                      <strong>{reservation.validation.refundPercentage || 0}%</strong>
                    </p>
                    <p className="text-lg font-bold mt-2">
                      Recibirás: S/ {(reservation.validation.refundAmount || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              ) : reservation.validation?.policyOffersRefund &&
                !reservation.validation?.hasAdvancePayment ? (
                // CASO 2: La cancha SÍ ofrece reembolso pero NO hay adelanto pagado
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Política de reembolso:</strong> Esta cancha ofrece{' '}
                    {reservation.validation.refundPercentage || 0}% de reembolso.
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Sin embargo, no tienes pagos adelantados registrados, por lo que no hay monto a
                    reembolsar.
                  </p>
                </div>
              ) : (
                // CASO 3: La cancha NO ofrece reembolso
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    {reservation.validation?.hasAdvancePayment
                      ? `Has pagado S/ ${(reservation.validation.totalPaid || 0).toFixed(2)} de adelanto. Esta cancha no ofrece reembolso por cancelación.`
                      : 'Esta cancha no ofrece reembolso por cancelación.'}
                  </p>
                </div>
              )}

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">⚠️ Esta acción no se puede deshacer</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-secondary-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-secondary-700 hover:bg-secondary-100 rounded-lg transition-colors"
              >
                Volver
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Confirmar Cancelación
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CancelModal
