import React from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  Calendar,
  Clock,
  Ban,
  Star,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock as ClockIcon,
} from 'lucide-react'
import { formatReservationDate } from '../../utils/reservations-view/formatters'

const ReservationCard = React.memo(
  ({
    reservation,
    isPast,
    field,
    statusBadge,
    onCancel,
    onReview,
    canReview,
    cancellationValidation,
    rentalCount,
  }) => {
    // Obtener el ícono correcto según el nombre
    const getStatusIcon = (iconName) => {
      const icons = {
        XCircle: <XCircle className="w-4 h-4" />,
        CheckCircle: <CheckCircle className="w-4 h-4" />,
        AlertCircle: <AlertCircle className="w-4 h-4" />,
        Clock: <ClockIcon className="w-4 h-4" />,
      }
      return icons[iconName] || null
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-lg shadow-md border-l-4 overflow-hidden w-full ${
          isPast ? 'border-gray-400 opacity-75' : 'border-green-500'
        }`}
      >
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 break-words">
                {field?.name || reservation.fieldName || 'Cancha Desconocida'}
              </h3>
              <div className="flex items-start text-xs sm:text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                <span className="break-words">{field?.location || 'Ubicación no disponible'}</span>
              </div>
            </div>
            <span
              className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium whitespace-nowrap flex-shrink-0 ${statusBadge.color}`}
            >
              {getStatusIcon(statusBadge.iconName)}
              {statusBadge.text}
            </span>
          </div>

          {/* Información */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
            {/* Fecha */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Fecha</p>
                <p className="text-sm font-medium text-gray-900 break-words">
                  {formatReservationDate(reservation.date)}
                </p>
              </div>
            </div>

            {/* Hora */}
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500">Horario</p>
                <p className="text-sm font-medium text-gray-900 break-words">{reservation.time}</p>
              </div>
            </div>
          </div>

          {/* Pagos */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
            <div className="flex justify-between gap-2 text-xs sm:text-sm">
              <span className="text-gray-600">Precio Total:</span>
              <span className="font-medium whitespace-nowrap">
                S/ {reservation.totalPrice?.toFixed(2)}
              </span>
            </div>

            {/* Mostrar adelanto si existe */}
            {parseFloat(reservation.advancePayment) > 0 && (
              <div className="flex justify-between gap-2 text-xs sm:text-sm text-green-600">
                <span>Adelanto pagado:</span>
                <span className="font-medium whitespace-nowrap">
                  S/ {parseFloat(reservation.advancePayment).toFixed(2)}
                </span>
              </div>
            )}

            {/* Mostrar saldo pendiente si existe.
                Excluir estados terminales (no_show) donde el saldo ya no es cobrable. */}
            {parseFloat(reservation.remainingPayment) > 0 &&
              reservation.paymentStatus !== 'fully_paid' &&
              reservation.paymentStatus !== 'paid' &&
              reservation.paymentStatus !== 'no_show' &&
              reservation.status !== 'no_show' && (
                <div className="flex justify-between gap-2 text-xs sm:text-sm text-amber-600">
                  <span>Saldo pendiente:</span>
                  <span className="font-semibold whitespace-nowrap">
                    S/ {parseFloat(reservation.remainingPayment).toFixed(2)}
                  </span>
                </div>
              )}

            {reservation.status === 'no_show' || reservation.paymentStatus === 'no_show' ? (
              <div className="flex justify-between gap-2 text-xs sm:text-sm text-gray-700">
                <span>Estado de Pago:</span>
                <span className="font-semibold whitespace-nowrap">No se presentó</span>
              </div>
            ) : reservation.paymentStatus === 'fully_paid' ||
              reservation.paymentStatus === 'paid' ? (
              <div className="flex justify-between gap-2 text-xs sm:text-sm text-green-600">
                <span>Estado de Pago:</span>
                <span className="font-semibold whitespace-nowrap">✓ Pagado Completo</span>
              </div>
            ) : parseFloat(reservation.advancePayment) > 0 ? (
              <div className="flex justify-between gap-2 text-xs sm:text-sm text-blue-600">
                <span>Estado de Pago:</span>
                <span className="font-semibold whitespace-nowrap">Adelanto recibido</span>
              </div>
            ) : (
              <div className="flex justify-between gap-2 text-xs sm:text-sm text-orange-600">
                <span>Estado de Pago:</span>
                <span className="font-semibold whitespace-nowrap">Pendiente</span>
              </div>
            )}
          </div>

          {/* Botón de Cancelar - Solo para reservas activas */}
          {!isPast && reservation.status !== 'cancelled' && cancellationValidation && (
            <div className="mt-4">
              {cancellationValidation.canCancel ? (
                <button
                  onClick={() => onCancel(reservation, cancellationValidation)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Ban className="w-4 h-4" />
                  Cancelar Reserva
                </button>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700 text-center">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    {cancellationValidation.reason}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botón de Calificar - Solo para reservas completadas */}
          {isPast && reservation.status === 'completed' && !reservation.reviewed && canReview && (
            <div className="mt-4">
              <button
                onClick={() => onReview(reservation)}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Star className="w-4 h-4" />
                Calificar Cancha
              </button>
            </div>
          )}

          {/* Mensaje si ya fue calificada */}
          {isPast && reservation.reviewed && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-700 text-center">
                <CheckCircle className="w-4 h-4 inline mr-1" />
                Ya calificaste esta cancha
              </p>
            </div>
          )}

          {/* Contador de veces alquilada - Solo en historial */}
          {isPast && rentalCount && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 text-center">
                Has alquilado esta cancha <strong>{rentalCount}</strong>{' '}
                {rentalCount === 1 ? 'vez' : 'veces'}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    )
  }
)

ReservationCard.displayName = 'ReservationCard'

export default ReservationCard
