import React from 'react'
import { Wifi, ShoppingBag } from 'lucide-react'

const ServicesSection = ({ formData, isLoading, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-800 flex items-center">
        <ShoppingBag className="w-5 h-5 mr-2 text-primary-600" />
        Servicios y Comodidades
      </h3>

      {/* Servicios de Bar/Cafetería */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-secondary-800">Servicios de Bar/Cafetería</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="services.hasBar"
              checked={formData.services.hasBar}
              onChange={handleInputChange}
              className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-secondary-700">Tiene Bar</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="services.hasDrinks"
              checked={formData.services.hasDrinks}
              onChange={handleInputChange}
              className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-secondary-700">Venta de Bebidas</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="services.hasSnacks"
              checked={formData.services.hasSnacks}
              onChange={handleInputChange}
              className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-secondary-700">Venta de Snacks</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="barDetails.openDuringGames"
              checked={formData.barDetails.openDuringGames}
              onChange={handleInputChange}
              className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-secondary-700">Abierto durante partidos</span>
          </label>
        </div>
      </div>

      {/* Instalaciones */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-secondary-800 flex items-center">
          <Wifi className="w-4 h-4 mr-2" />
          Instalaciones
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="services.hasChangingRooms"
              checked={formData.services.hasChangingRooms}
              onChange={handleInputChange}
              className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-secondary-700">Vestuarios</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="services.hasShowers"
              checked={formData.services.hasShowers}
              onChange={handleInputChange}
              className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-secondary-700">Duchas</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="services.hasParking"
              checked={formData.services.hasParking}
              onChange={handleInputChange}
              className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-secondary-700">Estacionamiento</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="services.hasWifi"
              checked={formData.services.hasWifi}
              onChange={handleInputChange}
              className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-secondary-700">WiFi</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="services.hasSecurity"
              checked={formData.services.hasSecurity}
              onChange={handleInputChange}
              className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-secondary-700">Seguridad</span>
          </label>
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="services.hasFirstAid"
              checked={formData.services.hasFirstAid}
              onChange={handleInputChange}
              className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-secondary-700">
              Botiquín Primeros Auxilios
            </span>
          </label>
        </div>
      </div>

      {/* Alquiler de Equipamiento */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-secondary-800">Alquiler de Equipamiento</h4>
        <div className="space-y-3">
          {[
            { key: 'Jersey', label: 'Chalecos', placeholder: '10' },
            { key: 'Ball', label: 'Pelotas', placeholder: '5' },
            { key: 'Cone', label: 'Conos', placeholder: '3' },
          ].map((equipment) => (
            <div key={equipment.key} className="flex items-center justify-between">
              <label className="flex items-center space-x-3 flex-1">
                <input
                  type="checkbox"
                  name={`equipment.has${equipment.key}Rental`}
                  checked={formData.equipment[`has${equipment.key}Rental`]}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-secondary-700">
                  Alquiler de {equipment.label}
                </span>
              </label>
              {formData.equipment[`has${equipment.key}Rental`] && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary-600">S/</span>
                  <input
                    type="number"
                    name={`equipment.${equipment.key.toLowerCase()}Price`}
                    value={formData.equipment[`${equipment.key.toLowerCase()}Price`]}
                    onChange={handleInputChange}
                    placeholder={equipment.placeholder}
                    min="0"
                    className="w-20 px-2 py-1 border-2 border-secondary-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Nota informativa */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-sm text-amber-700">
          <strong>Nota:</strong> Estos servicios son opcionales y pueden ayudar a mejorar la
          experiencia de los usuarios. Puedes actualizar esta información en cualquier momento.
        </p>
      </div>
    </div>
  )
}

export default ServicesSection
