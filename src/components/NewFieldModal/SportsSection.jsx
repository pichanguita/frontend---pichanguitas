import React from 'react'
import { AlertCircle, CheckCircle } from 'lucide-react'

const SportsSection = ({
  formData,
  errors,
  availableSports,
  onSportToggle,
  onMultiSportToggle,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-800">
        Deportes Disponibles en la Cancha *
      </h3>

      {errors.sportTypes && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {errors.sportTypes}
          </p>
        </div>
      )}

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">Cancha Multideportiva</span>
            <div>
              <span className="font-medium text-secondary-800">Cancha Multideportiva</span>
              <p className="text-xs text-secondary-600">
                Seleccionar todos los deportes disponibles
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onMultiSportToggle(availableSports)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              formData.isMultiSport ? 'bg-purple-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.isMultiSport ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {!availableSports || availableSports.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            No hay deportes disponibles. El super administrador debe crear deportes en el módulo de
            "Gestión de Deportes" primero.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableSports.map((sport) => (
            <label
              key={sport.id}
              className={`relative flex items-center space-x-3 p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                formData.sportTypes && formData.sportTypes.includes(sport.name)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-secondary-200 hover:border-primary-300 hover:bg-secondary-50'
              }`}
            >
              <input
                type="checkbox"
                checked={formData.sportTypes && formData.sportTypes.includes(sport.name)}
                onChange={() => onSportToggle(sport.name, availableSports)}
                className="sr-only"
              />
              <span className="text-2xl">{sport.icon}</span>
              <div className="flex-1">
                <span
                  className={`font-medium ${
                    formData.sportTypes && formData.sportTypes.includes(sport.name)
                      ? 'text-primary-700'
                      : 'text-secondary-700'
                  }`}
                >
                  {sport.name}
                </span>
              </div>
              {formData.sportTypes && formData.sportTypes.includes(sport.name) && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-5 h-5 text-primary-600" />
                </div>
              )}
            </label>
          ))}
        </div>
      )}

      {formData.sportTypes.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700">
            <span className="font-medium">
              {formData.sportTypes.length} deporte{formData.sportTypes.length > 1 ? 's' : ''}{' '}
              seleccionado{formData.sportTypes.length > 1 ? 's' : ''}
            </span>
            {formData.isMultiSport && (
              <span className="ml-2 text-green-600">Cancha Multideportiva</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}

export default SportsSection
