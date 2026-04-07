import React from 'react'
import { motion } from 'framer-motion'
import { MapPin, Calendar, Clock, Wrench } from 'lucide-react'
import {
  calculateReservationPrices,
  isFieldInMaintenance,
  getMaintenanceMessage,
} from '../../utils/fields/fieldUtils'
import { getDurationOptions, RESERVATION_CONFIG } from '../../constants/booking'
import { getToday } from '../../utils/dateFormatters'

const ReservationModal = ({
  field,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  duration,
  setDuration,
  timeSlots,
  isSlotAvailable,
  onClose,
  onConfirm,
}) => {
  if (!field) return null

  const inMaintenance = isFieldInMaintenance(field)
  const maintenanceMessage = getMaintenanceMessage(field)
  const { totalPrice, advancePayment } = calculateReservationPrices(field.pricePerHour, duration)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-4">
          {/* Header */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{field.name}</h3>
            <p className="text-gray-600 flex items-center">
              <MapPin className="w-4 h-4 mr-1" />
              {field.location}
            </p>
          </div>

          {/* Alerta de mantenimiento */}
          {inMaintenance && (
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Wrench className="w-5 h-5 text-orange-500" />
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-semibold text-orange-800 mb-1">
                    Cancha en Mantenimiento
                  </h4>
                  <p className="text-sm text-orange-700">{maintenanceMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Selección de Fecha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getToday()} // ✅ FIX: Usar getToday() para evitar bugs de timezone
                disabled={inMaintenance}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Selección de Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Inicio</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                disabled={inMaintenance}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Seleccionar horario</option>
                {timeSlots.map((slot) => {
                  const available = isSlotAvailable(field.id, selectedDate, slot)
                  return (
                    <option key={slot} value={slot} disabled={!available}>
                      {slot} {!available ? '(Ocupado)' : ''}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duración (horas)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              disabled={inMaintenance}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              {getDurationOptions().map((hour) => (
                <option key={hour} value={hour}>
                  {hour} {hour === 1 ? 'hora' : 'horas'}
                </option>
              ))}
            </select>
          </div>

          {/* Resumen de Precios */}
          {selectedTimeSlot && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Precio por hora:</span>
                <span className="font-medium">S/ {field.pricePerHour}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Duración:</span>
                <span className="font-medium">
                  {duration} {duration === 1 ? 'hora' : 'horas'}
                </span>
              </div>
              <hr />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-green-600">S/ {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-orange-600">
                <span>Adelanto ({RESERVATION_CONFIG.ADVANCE_PAYMENT_LABEL}):</span>
                <span className="font-semibold">S/ {advancePayment.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={inMaintenance || !selectedDate || !selectedTimeSlot}
              className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={inMaintenance ? 'No se puede reservar una cancha en mantenimiento' : ''}
            >
              {inMaintenance ? 'Cancha No Disponible' : 'Confirmar Reserva'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ReservationModal
