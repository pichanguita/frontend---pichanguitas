import React from 'react'
import { MapPin, AlertCircle } from 'lucide-react'

const LocationSection = ({ formData, errors, isLoading, selectedLocation, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-800 flex items-center">
        <MapPin className="w-5 h-5 mr-2 text-primary-600" />
        Ubicación y Contacto
      </h3>

      {/* Dirección */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Dirección Completa *
          {selectedLocation && (
            <span className="text-xs text-green-600 ml-2">(Actualizada del mapa)</span>
          )}
        </label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${
            selectedLocation
              ? 'bg-green-50 border-green-200 text-green-800 cursor-not-allowed'
              : errors.address
                ? 'border-red-300 focus:border-red-500'
                : 'border-secondary-200 focus:border-primary-500'
          }`}
          placeholder="Ej: Jr. Lima 234, Abancay"
          disabled={isLoading || selectedLocation}
          readOnly={selectedLocation}
        />
        {errors.address && !selectedLocation && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.address}
          </p>
        )}
      </div>

      {/* Teléfono */}
      <div>
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          Teléfono de Contacto *
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${
            errors.phone
              ? 'border-red-300 focus:border-red-500'
              : 'border-secondary-200 focus:border-primary-500'
          }`}
          placeholder="999 888 777"
          maxLength="11"
          disabled={isLoading}
        />
        <p className="mt-1 text-xs text-secondary-500">
          Solo números, 9 dígitos. Formato: XXX XXX XXX
        </p>
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.phone}
          </p>
        )}
      </div>

      {/* Coordenadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Latitud *
            {selectedLocation && <span className="text-xs text-green-600 ml-2">(Del mapa)</span>}
          </label>
          <input
            type="number"
            name="latitude"
            value={formData.latitude}
            onChange={handleInputChange}
            step="any"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${
              selectedLocation
                ? 'bg-green-50 border-green-200 text-green-800 cursor-not-allowed'
                : errors.latitude
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-secondary-200 focus:border-primary-500'
            }`}
            placeholder="-13.6333"
            disabled={isLoading || selectedLocation}
            readOnly={selectedLocation}
          />
          {errors.latitude && !selectedLocation && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.latitude}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Longitud *
            {selectedLocation && <span className="text-xs text-green-600 ml-2">(Del mapa)</span>}
          </label>
          <input
            type="number"
            name="longitude"
            value={formData.longitude}
            onChange={handleInputChange}
            step="any"
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors duration-200 ${
              selectedLocation
                ? 'bg-green-50 border-green-200 text-green-800 cursor-not-allowed'
                : errors.longitude
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-secondary-200 focus:border-primary-500'
            }`}
            placeholder="-72.8814"
            disabled={isLoading || selectedLocation}
            readOnly={selectedLocation}
          />
          {errors.longitude && !selectedLocation && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.longitude}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LocationSection
