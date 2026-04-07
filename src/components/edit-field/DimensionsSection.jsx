import React from 'react'
import { Ruler, AlertCircle } from 'lucide-react'

const SURFACE_TYPES = [
  { value: 'cesped_sintetico', label: 'Césped Sintético' },
  { value: 'cesped_natural', label: 'Césped Natural' },
  { value: 'tierra', label: 'Tierra' },
  { value: 'concreto', label: 'Concreto' },
]

const DimensionsSection = ({ formData, errors, isLoading, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-800 flex items-center">
        <Ruler className="w-5 h-5 mr-2 text-primary-600" />
        Medidas y Superficie de la Cancha
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Largo */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Largo (metros)
          </label>
          <input
            type="number"
            name="dimensions.length"
            value={formData.dimensions.length}
            onChange={handleInputChange}
            placeholder="Ej: 100"
            min="10"
            max="150"
            disabled={isLoading}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors['dimensions.length'] ? 'border-red-500 bg-red-50' : 'border-secondary-300'
            }`}
          />
          {errors['dimensions.length'] && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors['dimensions.length']}
            </p>
          )}
        </div>

        {/* Ancho */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Ancho (metros)
          </label>
          <input
            type="number"
            name="dimensions.width"
            value={formData.dimensions.width}
            onChange={handleInputChange}
            placeholder="Ej: 64"
            min="5"
            max="100"
            disabled={isLoading}
            className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
              errors['dimensions.width'] ? 'border-red-500 bg-red-50' : 'border-secondary-300'
            }`}
          />
          {errors['dimensions.width'] && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors['dimensions.width']}
            </p>
          )}
        </div>

        {/* Área (auto-calculada) */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-1">
            Área total (m²)
          </label>
          <input
            type="text"
            name="dimensions.area"
            value={formData.dimensions.area ? `${formData.dimensions.area} m²` : ''}
            placeholder="Auto-calculado"
            disabled
            readOnly
            className="w-full px-3 py-2 border-2 border-secondary-300 rounded-lg bg-secondary-50 text-secondary-600"
          />
          {formData.dimensions.area && (
            <p className="text-xs text-secondary-500 mt-1">Área calculada automáticamente</p>
          )}
        </div>
      </div>

      {/* Tipo de Superficie */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-1">
          Tipo de Superficie
        </label>
        <select
          name="dimensions.surfaceType"
          value={formData.dimensions.surfaceType}
          onChange={handleInputChange}
          disabled={isLoading}
          className="w-full px-3 py-2 border-2 border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {SURFACE_TYPES.map((st) => (
            <option key={st.value} value={st.value}>
              {st.label}
            </option>
          ))}
        </select>
      </div>

      {/* Información adicional */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <p className="text-sm text-purple-700">
          <strong>Nota:</strong> Las dimensiones son opcionales pero ayudan a los usuarios a conocer
          mejor tu cancha. Puedes dejar estos campos vacíos si no conoces las medidas exactas.
        </p>
      </div>
    </div>
  )
}

export default DimensionsSection
