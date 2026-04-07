import React from 'react'
import { DollarSign } from 'lucide-react'
import FormInput from './FormInput'
import FormSelect from './FormSelect'

const PricingSection = ({ formData, errors, isLoading, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-800 flex items-center">
        <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
        Configuracion
      </h3>

      <FormInput
        label="Precio por Hora (S/)"
        name="pricePerHour"
        type="number"
        value={formData.pricePerHour}
        onChange={onChange}
        error={errors.pricePerHour}
        placeholder="60"
        min="10"
        max="500"
        required
        disabled={isLoading}
      />

      <FormSelect
        label="Estado Inicial"
        name="status"
        value={formData.status}
        onChange={onChange}
        options={[
          { value: 'available', label: 'Disponible' },
          { value: 'maintenance', label: 'En Mantenimiento' },
        ]}
        disabled={isLoading}
      />

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          name="requiresAdvancePayment"
          id="requiresAdvancePayment"
          checked={formData.requiresAdvancePayment}
          onChange={onChange}
          className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500 focus:ring-2"
          disabled={isLoading}
        />
        <label htmlFor="requiresAdvancePayment" className="text-sm font-medium text-secondary-700">
          Requiere pago adelantado para reservar
        </label>
      </div>

      {formData.requiresAdvancePayment && (
        <FormInput
          label="Adelanto para Separar (S/)"
          name="advancePaymentAmount"
          type="number"
          value={formData.advancePaymentAmount}
          onChange={onChange}
          error={errors.advancePaymentAmount}
          placeholder="Ej: 20"
          min="1"
          required
          disabled={isLoading}
          hint="Monto de adelanto requerido para confirmar la reserva"
        />
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <span className="mr-2">Tarifas Diferenciadas</span>
        </h4>
        <p className="text-sm text-blue-700 mb-3">
          Podras configurar precios especiales para diferentes horarios y dias (horario nocturno,
          fines de semana, feriados, etc.) desde el panel de administracion despues de crear la
          cancha.
        </p>
      </div>
    </div>
  )
}

export default PricingSection
