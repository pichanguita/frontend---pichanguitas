import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'
import { formatReservationDateShort } from '../../utils/reservations-view/formatters'

const CancellationModal = ({ isOpen, reservation, fieldInfo, onClose, onConfirm }) => {
  if (!reservation) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Cancelar Reserva</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Reservation Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {fieldInfo?.name || reservation.fieldName}
                </h3>
                <p className="text-sm text-gray-600">
                  {formatReservationDateShort(reservation.date)}
                </p>
                <p className="text-sm text-gray-600">{reservation.time}</p>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Política de Cancelación:</p>
                    <p>
                      Faltan{' '}
                      <strong>{reservation.validation.hoursUntilEvent.toFixed(1)} horas</strong>{' '}
                      para tu reserva.
                    </p>
                  </div>
                </div>
              </div>

              {/* Refund Info - ✅ FIX: Mostrar mensajes específicos según el caso */}
              {reservation.validation.refundAmount > 0 ? (
                // CASO 1: Hay reembolso que recibir
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Reembolso</h4>
                  <div className="space-y-1 text-sm text-green-800">
                    <p>
                      Monto pagado:{' '}
                      <strong>S/ {reservation.validation.totalPaid.toFixed(2)}</strong>
                    </p>
                    <p>
                      Porcentaje de reembolso:{' '}
                      <strong>{reservation.validation.refundPercentage}%</strong>
                    </p>
                    <p className="text-lg font-bold mt-2">
                      Recibirás: S/ {reservation.validation.refundAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ) : reservation.validation.policyOffersRefund &&
                !reservation.validation.hasAdvancePayment ? (
                // CASO 2: La cancha SÍ ofrece reembolso pero NO hay adelanto pagado
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Política de reembolso:</strong> Esta cancha ofrece{' '}
                    {reservation.validation.refundPercentage}% de reembolso.
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
                    {reservation.validation.hasAdvancePayment
                      ? `⚠️ Has pagado S/ ${reservation.validation.totalPaid.toFixed(2)} de adelanto. Esta cancha no ofrece reembolso por cancelación.`
                      : '⚠️ Esta cancha no ofrece reembolso por cancelación.'}
                  </p>
                </div>
              )}

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">⚠️ Esta acción no se puede deshacer</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
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

export default CancellationModal
