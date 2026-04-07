import React from 'react'

const ServicesSection = ({ formData, isLoading, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-800">Servicios y Comodidades</h3>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-secondary-800">Servicios de Bar/Cafeteria</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="services.hasBar"
              checked={formData.services.hasBar}
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
              className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
              disabled={isLoading}
            />
            <span className="text-sm font-medium text-secondary-700">Abierto durante partidos</span>
          </label>
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-secondary-800">Instalaciones</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'hasChangingRooms',
            'hasShowers',
            'hasParking',
            'hasWifi',
            'hasSecurity',
            'hasFirstAid',
          ].map((service) => (
            <label key={service} className="flex items-center space-x-3">
              <input
                type="checkbox"
                name={`services.${service}`}
                checked={formData.services[service]}
                onChange={onChange}
                className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
                disabled={isLoading}
              />
              <span className="text-sm font-medium text-secondary-700">
                {service === 'hasChangingRooms' && 'Vestuarios'}
                {service === 'hasShowers' && 'Duchas'}
                {service === 'hasParking' && 'Estacionamiento'}
                {service === 'hasWifi' && 'WiFi'}
                {service === 'hasSecurity' && 'Seguridad'}
                {service === 'hasFirstAid' && 'Botiquin Primeros Auxilios'}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-secondary-800">Alquiler de Equipamiento</h4>
        <div className="space-y-3">
          {['Jersey', 'Ball', 'Cone'].map((equipment) => (
            <div key={equipment} className="flex items-center justify-between">
              <label className="flex items-center space-x-3 flex-1">
                <input
                  type="checkbox"
                  name={`equipment.has${equipment}Rental`}
                  checked={formData.equipment[`has${equipment}Rental`]}
                  onChange={onChange}
                  className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-secondary-700">
                  Alquiler de{' '}
                  {equipment === 'Jersey' ? 'Chalecos' : equipment === 'Ball' ? 'Pelotas' : 'Conos'}
                </span>
              </label>
              {formData.equipment[`has${equipment}Rental`] && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary-600">S/</span>
                  <input
                    type="number"
                    name={`equipment.${equipment.toLowerCase()}Price`}
                    value={formData.equipment[`${equipment.toLowerCase()}Price`]}
                    onChange={onChange}
                    placeholder={equipment === 'Jersey' ? '10' : equipment === 'Ball' ? '5' : '3'}
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
    </div>
  )
}

export default ServicesSection
