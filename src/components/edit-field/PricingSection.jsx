import React from 'react'
import { DollarSign, AlertCircle } from 'lucide-react'

const PricingSection = ({ formData, errors, isLoading, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-800 flex items-center">
        <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
        Precios y Configuración
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Precio por Hora */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Precio por Hora (S/) {formData.requiresAdvancePayment ? <span className="text-red-500">*</span> : <span className="text-secondary-400">(opcional)</span>}
          </label>
          <input
            type="number"
            name="pricePerHour"
            value={formData.pricePerHour}
            onChange={handleInputChange}
            placeholder="60"
            min="10"
            max="500"
            disabled={isLoading}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.pricePerHour
                ? 'border-red-500 bg-red-50'
                : 'border-secondary-300'
            }`}
          />
          {errors.pricePerHour && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.pricePerHour}
            </p>
          )}
        </div>

        {/* Adelanto para Separar */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Adelanto para Separar (S/)
          </label>
          <input
            type="number"
            name="advancePaymentAmount"
            value={formData.advancePaymentAmount}
            onChange={handleInputChange}
            placeholder="Ej: 20 (opcional)"
            min="5"
            max={formData.pricePerHour || '500'}
            disabled={isLoading}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors.advancePaymentAmount ? 'border-red-500 bg-red-50' : 'border-secondary-300'
            }`}
          />
          {errors.advancePaymentAmount && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.advancePaymentAmount}
            </p>
          )}
          {!errors.advancePaymentAmount && formData.pricePerHour && (
            <p className="text-xs text-secondary-500 mt-1">
              Opcional. Min: S/ 5 - Max: S/ {formData.pricePerHour}
            </p>
          )}
        </div>
      </div>

      {/* Estado y Capacidad */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Estado <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border-2 border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="available">Disponible</option>
            <option value="maintenance">En Mantenimiento</option>
            <option value="inactive">Inactivo (No visible para clientes)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Capacidad (personas)
          </label>
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            placeholder="Ej: 22"
            min="1"
            max="50000"
            disabled={isLoading}
            className="w-full px-3 py-2 border-2 border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <p className="text-xs text-secondary-500 mt-1">Número máximo de jugadores permitidos</p>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="requiresAdvancePayment"
            id="requiresAdvancePayment"
            checked={formData.requiresAdvancePayment}
            onChange={handleInputChange}
            className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500 focus:ring-2"
            disabled={isLoading}
          />
          <label
            htmlFor="requiresAdvancePayment"
            className="text-sm font-medium text-secondary-700"
          >
            Requiere pago adelantado para reservar
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleInputChange}
            className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500 focus:ring-2"
            disabled={isLoading}
          />
          <label htmlFor="isActive" className="text-sm font-medium text-secondary-700">
            Cancha activa y disponible para reservas
          </label>
        </div>
      </div>

      {/* Información sobre precios especiales */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <span className="mr-2">Tarifas Diferenciadas</span>
        </h4>
        <p className="text-sm text-blue-700">
          Podrás configurar precios especiales para diferentes horarios y días (horario nocturno,
          fines de semana, feriados, etc.) desde el panel de <strong>Configuración Avanzada</strong>{' '}
          después de guardar los cambios.
        </p>
      </div>
    </div>
  )
}

export default PricingSection
