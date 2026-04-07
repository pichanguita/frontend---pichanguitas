import React from 'react'
import { DollarSign, AlertCircle } from 'lucide-react'

const ConfigSection = ({ formData, errors, isLoading, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-800 flex items-center">
        <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
        Configuración
      </h3>

      {/* Precio */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Precio por Hora (S/) *
        </label>
        <input
          type="number"
          name="pricePerHour"
          value={formData.pricePerHour}
          onChange={handleInputChange}
          min="10"
          max="500"
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${
            errors.pricePerHour
              ? 'border-red-300 focus:border-red-500'
              : 'border-secondary-200 focus:border-primary-500'
          }`}
          placeholder="60"
          disabled={isLoading}
        />
        {errors.pricePerHour && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.pricePerHour}
          </p>
        )}
      </div>

      {/* Estado */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Estado de la Cancha
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border-2 border-secondary-200 rounded-xl focus:outline-none focus:border-primary-500 transition-colors duration-200"
          disabled={isLoading}
        >
          <option value="available">Disponible</option>
          <option value="maintenance">En Mantenimiento</option>
          <option value="inactive">Inactivo (No visible para clientes)</option>
        </select>
      </div>

      {/* Adelanto requerido */}
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
        <label htmlFor="requiresAdvancePayment" className="text-sm font-medium text-secondary-700">
          Requiere pago adelantado para reservar
        </label>
      </div>
    </div>
  )
}

export default ConfigSection
