import React, { useMemo } from 'react'
import { MapPin, Calendar, Clock, AlertCircle } from 'lucide-react'
import { getFilteredTimeOptions } from '../../utils/client-registration/clientRegistrationHelpers'
import { getToday } from '../../utils/dateFormatters'

const ReservationDataForm = ({
  formData,
  errors,
  fields,
  onChange,
  isLoading,
  occupiedSlots = [],
}) => {
  // ✅ Filtrar opciones de hora de inicio (excluye horas pasadas si es hoy + horas ocupadas)
  const startTimeOptions = useMemo(() => {
    if (!formData.date) return []
    return getFilteredTimeOptions(formData.date, occupiedSlots, 'start', null)
  }, [formData.date, occupiedSlots])

  // ✅ Filtrar opciones de hora de fin (debe ser mayor a inicio + no solapar con ocupados)
  const endTimeOptions = useMemo(() => {
    if (!formData.date || !formData.startTime) return []
    return getFilteredTimeOptions(formData.date, occupiedSlots, 'end', formData.startTime)
  }, [formData.date, formData.startTime, occupiedSlots])

  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
        <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
        Asignación de Cancha
      </h3>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cancha *</label>
          <select
            name="fieldId"
            value={formData.fieldId}
            onChange={onChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.fieldId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          >
            <option value="">Seleccionar cancha</option>
            {fields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.name} - S/ {field.pricePerHour}/hora
              </option>
            ))}
          </select>
          {errors.fieldId && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.fieldId}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
          <div className="relative">
            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={onChange}
              min={getToday()} // ✅ FIX: Usar getToday() para evitar bugs de timezone
              className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.date && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.date}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Inicio *</label>
            <div className="relative">
              <Clock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <select
                name="startTime"
                value={formData.startTime}
                onChange={onChange}
                className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.startTime ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading || !formData.date}
              >
                <option value="">
                  {formData.date ? 'Seleccionar hora' : 'Primero selecciona fecha'}
                </option>
                {startTimeOptions.map(({ time, disabled, reason }) => (
                  <option
                    key={time}
                    value={time}
                    disabled={disabled}
                    className={disabled ? 'text-gray-400' : ''}
                  >
                    {time}
                    {disabled ? ` (${reason})` : ''}
                  </option>
                ))}
              </select>
            </div>
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.startTime}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hora de Fin *</label>
            <select
              name="endTime"
              value={formData.endTime}
              onChange={onChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.endTime ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading || !formData.startTime}
            >
              <option value="">
                {formData.startTime ? 'Seleccionar hora' : 'Primero selecciona hora de inicio'}
              </option>
              {endTimeOptions.map(({ time, disabled, reason }) => (
                <option
                  key={time}
                  value={time}
                  disabled={disabled}
                  className={disabled ? 'text-gray-400' : ''}
                >
                  {time}
                  {disabled ? ` (${reason})` : ''}
                </option>
              ))}
            </select>
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.endTime}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duración (horas) *</label>
          <div className="relative">
            <Clock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={onChange}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
              disabled={isLoading}
              readOnly={formData.startTime && formData.endTime}
              step="0.5"
              min="0.5"
            />
          </div>
          {formData.startTime && formData.endTime && (
            <p className="text-sm text-gray-500 mt-1">
              Calculado automáticamente según horario seleccionado
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Estado del Pago</label>
          <select
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={onChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
            <option value="advance">Adelanto</option>
          </select>
        </div>

        {(formData.paymentStatus === 'paid' || formData.paymentStatus === 'advance') && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={onChange}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.paymentMethod ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="">Seleccionar método</option>
              <option value="cash">Efectivo</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="transfer">Transferencia</option>
              <option value="card">Tarjeta</option>
            </select>
            {errors.paymentMethod && (
              <p className="text-red-500 text-sm mt-1 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.paymentMethod}
              </p>
            )}
          </div>
        )}

        {formData.paymentStatus === 'advance' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto del Adelanto (S/)
            </label>
            <input
              type="number"
              name="advanceAmount"
              value={formData.advanceAmount}
              onChange={onChange}
              min="1"
              max={formData.totalAmount - 1}
              step="0.01"
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.advanceAmount ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Ingrese el monto del adelanto"
              disabled={isLoading}
            />
            {errors.advanceAmount && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.advanceAmount}
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas Administrativas
          </label>
          <textarea
            name="adminNotes"
            value={formData.adminNotes}
            onChange={onChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Notas internas sobre la reserva..."
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default ReservationDataForm
