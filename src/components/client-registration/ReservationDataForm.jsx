import React, { useMemo } from 'react'
import { MapPin, Calendar, Clock, AlertCircle, Info } from 'lucide-react'
import {
  getFilteredTimeOptions,
  getFieldDaySchedule,
  getFieldDayKey,
  getDayLabelEs,
} from '../../utils/client-registration/clientRegistrationHelpers'
import { isFieldUnderMaintenanceOnDate } from '../../utils/fieldMaintenance'
import { getToday } from '../../utils/dateFormatters'

const ReservationDataForm = ({
  formData,
  errors,
  fields,
  onChange,
  isLoading,
  occupiedSlots = [],
  selectedField = null,
}) => {
  // ✅ Filtrar opciones de hora de inicio (excluye horas pasadas si es hoy + horas ocupadas + horario cancha)
  const startTimeOptions = useMemo(() => {
    if (!formData.date) return []
    return getFilteredTimeOptions(formData.date, occupiedSlots, 'start', null, selectedField)
  }, [formData.date, occupiedSlots, selectedField])

  // ✅ Filtrar opciones de hora de fin (debe ser mayor a inicio + no solapar + horario cancha)
  const endTimeOptions = useMemo(() => {
    if (!formData.date || !formData.startTime) return []
    return getFilteredTimeOptions(
      formData.date,
      occupiedSlots,
      'end',
      formData.startTime,
      selectedField
    )
  }, [formData.date, formData.startTime, occupiedSlots, selectedField])

  // ✅ Horario semanal completo de la cancha seleccionada (todos los días)
  // Se muestra apenas se selecciona la cancha, sin necesidad de elegir fecha.
  const weeklySchedule = useMemo(() => {
    if (!selectedField || !selectedField.schedule) return null
    const order = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    return order.map((dayKey) => {
      const cfg = selectedField.schedule[dayKey]
      const label = getDayLabelEs(dayKey)
      if (!cfg || cfg.isOpen === false) {
        return { dayKey, label, isOpen: false, openTime: null, closeTime: null }
      }
      return {
        dayKey,
        label,
        isOpen: true,
        openTime: cfg.openTime ? cfg.openTime.slice(0, 5) : null,
        closeTime: cfg.closeTime ? cfg.closeTime.slice(0, 5) : null,
      }
    })
  }, [selectedField])

  // Día actualmente seleccionado en la fecha (para resaltar en el panel)
  const currentDayKey = useMemo(
    () => (formData.date ? getFieldDayKey(formData.date) : null),
    [formData.date]
  )

  // ✅ Aviso de horario / día cerrado / mantenimiento para la cancha seleccionada
  const scheduleNotice = useMemo(() => {
    if (!selectedField || !formData.date) return null
    if (isFieldUnderMaintenanceOnDate(selectedField, formData.date)) {
      return {
        type: 'maintenance',
        text: 'Esta cancha está en mantenimiento en la fecha seleccionada.',
      }
    }
    const daySchedule = getFieldDaySchedule(selectedField, formData.date)
    const dayLabel = getDayLabelEs(getFieldDayKey(formData.date))
    if (!daySchedule) return null
    if (daySchedule.isOpen === false) {
      return {
        type: 'closed',
        text: `Esta cancha no opera los ${dayLabel}. Selecciona otro día.`,
      }
    }
    if (daySchedule.openTime && daySchedule.closeTime) {
      return {
        type: 'info',
        text: `Horario los ${dayLabel}: ${daySchedule.openTime.slice(0, 5)} a ${daySchedule.closeTime.slice(0, 5)}.`,
      }
    }
    return null
  }, [selectedField, formData.date])

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
          {weeklySchedule && (
            <div
              data-testid="field-weekly-schedule"
              className="mt-2 p-3 rounded-md border border-gray-200 bg-gray-50"
            >
              <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Horario de atención
              </p>
              <ul className="space-y-1">
                {weeklySchedule.map((d) => {
                  const isToday = currentDayKey === d.dayKey
                  return (
                    <li
                      key={d.dayKey}
                      className={`flex justify-between text-xs px-2 py-1 rounded ${
                        isToday
                          ? d.isOpen
                            ? 'bg-blue-100 text-blue-900 font-semibold'
                            : 'bg-amber-100 text-amber-900 font-semibold'
                          : d.isOpen
                            ? 'text-gray-700'
                            : 'text-gray-400'
                      }`}
                    >
                      <span className="capitalize">{d.label}</span>
                      <span>
                        {d.isOpen
                          ? d.openTime && d.closeTime
                            ? `${d.openTime} - ${d.closeTime}`
                            : 'Abierto'
                          : 'Cerrado'}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          {scheduleNotice && (
            <div
              data-testid="field-schedule-notice"
              className={`mt-2 p-2 rounded-md text-sm flex items-start gap-2 border ${
                scheduleNotice.type === 'info'
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {scheduleNotice.type === 'info' ? (
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <span>{scheduleNotice.text}</span>
            </div>
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
