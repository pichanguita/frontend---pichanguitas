import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, DollarSign, Phone, Ban } from 'lucide-react'
import {
  formatReservationDate,
  getStatusColor,
  getStatusText,
} from '../../utils/reservations/formatters'

const ReservationCard = ({ reservation, index, onCancel }) => {
  // Verificar si el pago está completo (saldo = 0 y adelanto >= total)
  const remainingPayment = parseFloat(reservation.remainingPayment || 0)
  const advancePayment = parseFloat(reservation.advancePayment || 0)
  const totalPrice = parseFloat(reservation.totalPrice || 0)
  const isPaymentComplete =
    reservation.paymentStatus === 'fully_paid' ||
    reservation.paymentStatus === 'paid' ||
    (remainingPayment === 0 && advancePayment >= totalPrice && totalPrice > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-secondary-200 hover:shadow-xl transition-shadow"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-xl font-bold text-secondary-900">{reservation.fieldName}</h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}
              >
                {getStatusText(reservation.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              <div className="flex items-center text-secondary-600">
                <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                <span>{formatReservationDate(reservation.date)}</span>
              </div>

              <div className="flex items-center text-secondary-600">
                <Clock className="w-5 h-5 mr-2 text-primary-600" />
                <span>
                  {reservation.startTime} - {reservation.endTime}
                </span>
              </div>

              <div className="flex items-center text-secondary-600">
                <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
                <div className="flex flex-col">
                  <span className="font-semibold">Total: S/ {totalPrice.toFixed(2)}</span>
                  {advancePayment > 0 && (
                    <span className="text-xs text-green-600">
                      Adelanto: S/ {advancePayment.toFixed(2)}
                    </span>
                  )}
                  {remainingPayment > 0 && !isPaymentComplete && (
                    <span className="text-xs text-amber-600 font-medium">
                      Pendiente: S/ {remainingPayment.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {reservation.customerName && (
                <div className="flex items-center text-secondary-600">
                  <Phone className="w-5 h-5 mr-2 text-primary-600" />
                  <span>{reservation.customerName}</span>
                </div>
              )}
            </div>
          </div>

          {reservation.status !== 'cancelled' &&
            reservation.status !== 'completed' &&
            !isPaymentComplete && (
              <button
                onClick={() => onCancel(reservation)}
                className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <Ban className="w-4 h-4" />
                <span>Cancelar</span>
              </button>
            )}
        </div>

        {/* Payment Info */}
        {reservation.paymentMethod && (
          <div className="mt-4 pt-4 border-t border-secondary-200">
            <p className="text-sm text-secondary-600">
              <span className="font-medium">Método de pago:</span> {reservation.paymentMethod}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default ReservationCard
