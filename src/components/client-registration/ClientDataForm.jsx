import React from 'react'
import { User, Phone, Mail, AlertCircle } from 'lucide-react'

const ClientDataForm = ({ formData, errors, onChange, disabled }) => {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
        <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary-600" />
        Datos del Cliente
      </h3>

      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo *</label>
          <input
            type="text"
            name="clientName"
            value={formData.clientName}
            onChange={onChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.clientName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Nombre completo del cliente"
            disabled={disabled}
            readOnly={disabled}
          />
          {errors.clientName && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.clientName}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
          <div className="relative">
            <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="tel"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={(e) => {
                // Solo permitir números y máximo 9 dígitos
                const value = e.target.value.replace(/\D/g, '').slice(0, 9)
                onChange({ target: { name: 'clientPhone', value } })
              }}
              className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.clientPhone
                  ? 'border-red-500'
                  : formData.clientPhone && formData.clientPhone.length === 9
                    ? 'border-green-500'
                    : 'border-gray-300'
              }`}
              placeholder="987654321"
              maxLength={9}
              disabled={disabled}
              readOnly={disabled}
            />
          </div>
          {formData.clientPhone && formData.clientPhone.length !== 9 && (
            <p className="text-amber-600 text-xs mt-1">
              El teléfono debe tener 9 dígitos ({formData.clientPhone.length}/9)
            </p>
          )}
          {formData.clientPhone && formData.clientPhone.length === 9 && (
            <p className="text-green-600 text-xs mt-1">✓ Teléfono válido</p>
          )}
          {errors.clientPhone && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.clientPhone}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <div className="relative">
            <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="email"
              name="clientEmail"
              value={formData.clientEmail}
              onChange={onChange}
              className={`w-full p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.clientEmail ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="cliente@email.com"
              disabled={disabled}
              readOnly={disabled}
            />
          </div>
          {errors.clientEmail && (
            <p className="text-red-500 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.clientEmail}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas del Cliente</label>
          <textarea
            name="clientNotes"
            value={formData.clientNotes}
            onChange={onChange}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Información adicional sobre el cliente..."
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  )
}

export default ClientDataForm
