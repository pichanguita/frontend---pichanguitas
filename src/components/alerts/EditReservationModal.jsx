import React from 'react'
import { motion } from 'framer-motion'
import { X, User, MapPin, DollarSign, Save } from 'lucide-react'
import { PAYMENT_STATUS } from '@/constants'

const EditReservationModal = ({ isOpen, reservation, fields, onSave, onClose, onChange }) => {
  if (!isOpen || !reservation) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Editar Reserva</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <User className="w-4 h-4 mr-2 text-primary-600" />
              Información del Cliente
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Cliente *
                </label>
                <input
                  type="text"
                  value={reservation.customerName}
                  onChange={(e) => onChange({ customerName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <input
                  type="tel"
                  value={reservation.customerPhone}
                  onChange={(e) => onChange({ customerPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Reservation Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-primary-600" />
              Información de la Reserva
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cancha *</label>
                <select
                  value={reservation.fieldId}
                  onChange={(e) => onChange({ fieldId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">Seleccionar cancha</option>
                  {fields.map((field) => (
                    <option key={field.id} value={field.id}>
                      {field.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={reservation.date}
                  onChange={(e) => onChange({ date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Inicio *
                </label>
                <input
                  type="time"
                  value={reservation.startTime}
                  onChange={(e) => onChange({ startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora de Fin *
                </label>
                <input
                  type="time"
                  value={reservation.endTime}
                  onChange={(e) => onChange({ endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div>
            <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-primary-600" />
              Información del Pago
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Total</label>
                <input
                  type="number"
                  value={reservation.totalAmount}
                  onChange={(e) => onChange({ totalAmount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  step="0.01"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado del Pago
                </label>
                <select
                  value={reservation.paymentStatus}
                  onChange={(e) => onChange({ paymentStatus: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={PAYMENT_STATUS.PENDING}>Pendiente</option>
                  <option value={PAYMENT_STATUS.PAID}>Pagado</option>
                  <option value={PAYMENT_STATUS.PARTIAL}>Parcial</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas Adicionales
            </label>
            <textarea
              value={reservation.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Información adicional sobre la reserva..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default EditReservationModal
