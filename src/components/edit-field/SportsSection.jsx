import React from 'react'
import { Activity, AlertCircle } from 'lucide-react'

const SportsSection = ({
  formData,
  errors,
  isLoading,
  availableSports,
  handleSportToggle,
  handleMultiSportToggle,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-800 flex items-center">
        <Activity className="w-5 h-5 mr-2 text-primary-600" />
        Deportes Disponibles
      </h3>

      {/* Toggle Multi-Deporte */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isMultiSport"
            checked={formData.isMultiSport}
            onChange={handleMultiSportToggle}
            className="w-5 h-5 text-purple-600 border-2 border-purple-300 rounded focus:ring-purple-500 focus:ring-2"
            disabled={isLoading}
          />
          <div className="flex-1">
            <label
              htmlFor="isMultiSport"
              className="text-sm font-semibold text-purple-900 cursor-pointer"
            >
              Cancha Multi-Deporte
            </label>
            <p className="text-xs text-purple-700 mt-1">
              Marcar si esta cancha se puede usar para múltiples deportes (fútbol, vóley, básquet,
              etc.)
            </p>
          </div>
        </div>
      </div>

      {/* Selección de Deportes */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Selecciona los deportes <span className="text-red-500">*</span>
        </label>
        {!availableSports || availableSports.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              No hay deportes disponibles. El super administrador debe crear deportes en el módulo
              de "Gestión de Deportes" primero.
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-2 md:grid-cols-3 gap-3 ${!formData.sportTypes || formData.sportTypes.length === 0 ? 'border-2 border-red-300 bg-red-50 p-3 rounded-lg' : ''}`}
          >
            {availableSports.map((sport) => (
              <label
                key={sport.id}
                className={`relative flex items-center space-x-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-secondary-50 transition-colors duration-200 ${
                  formData.sportTypes && formData.sportTypes.includes(sport.id)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-secondary-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.sportTypes ? formData.sportTypes.includes(sport.id) : false}
                  onChange={(e) => handleSportToggle(sport.id, e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
                  disabled={isLoading}
                />
                <div className="flex items-center gap-2">
                  <span className="text-xl">{sport.icon || '⚽'}</span>
                  <span className="text-sm font-medium text-secondary-700">{sport.name}</span>
                </div>
              </label>
            ))}
          </div>
        )}
        {errors.sportTypes && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.sportTypes}
          </p>
        )}
        {!errors.sportTypes && (!formData.sportTypes || formData.sportTypes.length === 0) && (
          <p className="mt-2 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            Debes seleccionar al menos un deporte
          </p>
        )}
      </div>

      {/* Información sobre deportes seleccionados */}
      {formData.sportTypes && formData.sportTypes.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">
            <strong>Deportes seleccionados:</strong> {formData.sportTypes.length}
            {formData.isMultiSport && <span className="ml-2 text-purple-700">(Multi-Deporte)</span>}
          </p>
        </div>
      )}
    </div>
  )
}

export default SportsSection
