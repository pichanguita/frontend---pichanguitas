import React from 'react'
import { Plus, Trash2, DollarSign, Clock, Check } from 'lucide-react'

const PricingTab = ({ specialPricing, timeRanges, daysOfWeek, onAdd, onUpdate, onRemove }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-secondary-900">
            Descuentos por Horario (Horas Valle)
          </h3>
          <p className="text-secondary-600">
            Configure descuentos especiales por horarios y días de la semana
          </p>
        </div>
        <button
          onClick={onAdd}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Descuento</span>
        </button>
      </div>

      {specialPricing.length === 0 ? (
        <div className="text-center py-8 text-secondary-500">
          <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay descuentos configurados</p>
          <p className="text-sm mt-2">Ejemplo: 30% descuento de 9am a 4pm, lunes a viernes</p>
        </div>
      ) : (
        <div className="space-y-4">
          {specialPricing.map((pricing, index) => (
            <div key={pricing.id} className="p-4 border border-amber-200 rounded-lg bg-amber-50">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-secondary-900">Descuento #{index + 1}</h4>
                <button
                  onClick={() => onRemove(pricing.id)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Nombre del Descuento
                  </label>
                  <input
                    type="text"
                    value={pricing.name || ''}
                    onChange={(e) => onUpdate(pricing.id, 'name', e.target.value)}
                    placeholder="Ej: Horas Valle Matutinas"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Tipo de Descuento
                  </label>
                  <select
                    value={pricing.discountType || 'percentage'}
                    onChange={(e) => onUpdate(pricing.id, 'discountType', e.target.value)}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="amount">Monto Fijo (S/)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    {pricing.discountType === 'percentage'
                      ? 'Porcentaje de Descuento'
                      : 'Monto de Descuento'}
                  </label>
                  <input
                    type="number"
                    step={pricing.discountType === 'percentage' ? '1' : '0.5'}
                    min="0"
                    max={pricing.discountType === 'percentage' ? '100' : undefined}
                    value={pricing.discountValue || 0}
                    onChange={(e) =>
                      onUpdate(pricing.id, 'discountValue', parseFloat(e.target.value) || 0)
                    }
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                  <p className="text-xs text-green-600 mt-1 font-medium">
                    {pricing.discountType === 'percentage'
                      ? `${pricing.discountValue || 0}% de descuento`
                      : `S/ ${pricing.discountValue || 0} de descuento`}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Días de la Semana
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => {
                    const isSelected = (pricing.daysOfWeek || []).includes(day.key)
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => {
                          const currentDays = pricing.daysOfWeek || []
                          const newDays = isSelected
                            ? currentDays.filter((d) => d !== day.key)
                            : [...currentDays, day.key]
                          onUpdate(pricing.id, 'daysOfWeek', newDays)
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-secondary-700 border border-secondary-300 hover:bg-secondary-50'
                        }`}
                      >
                        {day.label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs text-secondary-500 mt-2">
                  {(pricing.daysOfWeek || []).length === 0
                    ? 'Selecciona al menos un día'
                    : `Aplicable ${(pricing.daysOfWeek || []).length} día(s) de la semana`}
                </p>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-secondary-700">
                    Selecciona los Horarios
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allTimeSlotIds = timeRanges.map((t) => t.id)
                        onUpdate(pricing.id, 'timeSlots', allTimeSlotIds)
                      }}
                      className="text-xs px-2 py-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                    >
                      Seleccionar todos
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate(pricing.id, 'timeSlots', [])}
                      className="text-xs px-2 py-1 text-secondary-600 hover:bg-secondary-100 rounded transition-colors"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 p-4 border border-secondary-200 rounded-lg bg-secondary-50 max-h-64 overflow-y-auto">
                  {timeRanges.map((timeRange) => {
                    const isSelected = pricing.timeSlots?.includes(timeRange.id) || false
                    return (
                      <button
                        key={timeRange.id}
                        type="button"
                        onClick={() => {
                          const currentTimeSlots = pricing.timeSlots || []
                          const newTimeSlots = isSelected
                            ? currentTimeSlots.filter((id) => id !== timeRange.id)
                            : [...currentTimeSlots, timeRange.id]
                          onUpdate(pricing.id, 'timeSlots', newTimeSlots)
                        }}
                        className={`
                          relative px-2 py-3 rounded-lg text-xs font-medium transition-all duration-200
                          ${
                            isSelected
                              ? 'bg-primary-600 text-white shadow-md transform scale-105 hover:bg-primary-700'
                              : 'bg-white text-secondary-700 hover:bg-secondary-100 hover:shadow-sm border border-secondary-200'
                          }
                        `}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          <Clock
                            className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-secondary-400'}`}
                          />
                          <span className="font-medium">{timeRange.label}</span>
                          {isSelected && (
                            <div className="absolute top-0 right-0 -mt-1 -mr-1">
                              <div className="bg-green-500 rounded-full p-0.5">
                                <Check className="w-2.5 h-2.5 text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-2">
                  {(pricing.timeSlots?.length || 0) > 0 ? (
                    <div className="space-y-1">
                      <p className="text-xs text-secondary-600">
                        {pricing.timeSlots?.length || 0} horario(s) seleccionado(s)
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {(pricing.timeSlots || []).slice(0, 5).map((slotId) => {
                          const timeRange = timeRanges.find((t) => t.id === slotId)
                          return timeRange ? (
                            <span
                              key={slotId}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                            >
                              {timeRange.label}
                            </span>
                          ) : null
                        })}
                        {(pricing.timeSlots?.length || 0) > 5 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-600">
                            +{(pricing.timeSlots?.length || 0) - 5} más
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-secondary-500 italic">
                      Haz clic en los horarios para seleccionarlos
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default PricingTab
