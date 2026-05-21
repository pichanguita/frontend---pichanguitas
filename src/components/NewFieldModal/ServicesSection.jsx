import React from 'react'
import useAmenitiesCatalog from '../../hooks/useAmenitiesCatalog'
import { getAmenityIconComponent } from '../../utils/amenityIconRegistry'

/**
 * Render dinámico de servicios/comodidades en el form de creación.
 * Sin hardcoding de labels ni íconos: todo viene del catálogo del backend.
 *
 * Props:
 * - selectedAmenityKeys: string[]
 * - onToggleAmenity: (key, isChecked) => void
 * - equipment: objeto con flags y precios de alquiler
 * - onEquipmentChange: handler para inputs de equipment.*
 * - isLoading: boolean
 */
const ServicesSection = ({
  selectedAmenityKeys = [],
  onToggleAmenity,
  equipment,
  onEquipmentChange,
  isLoading,
}) => {
  const { catalog, isLoading: isCatalogLoading, error } = useAmenitiesCatalog()
  const selectedSet = new Set(selectedAmenityKeys)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-secondary-800">Servicios y Comodidades</h3>

      {isCatalogLoading && (
        <div className="flex items-center justify-center py-6 text-secondary-500 text-sm">
          Cargando catálogo de servicios...
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          No se pudo cargar el catálogo de servicios. Recarga la página.
        </div>
      )}

      {!isCatalogLoading && !error && catalog.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {catalog.map((amenity) => {
              const Icon = getAmenityIconComponent(amenity.icon_name)
              const checked = selectedSet.has(amenity.key)
              return (
                <label key={amenity.key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name={`amenity:${amenity.key}`}
                    checked={checked}
                    onChange={(e) => onToggleAmenity(amenity.key, e.target.checked)}
                    className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
                    disabled={isLoading}
                  />
                  <Icon className="w-4 h-4 text-secondary-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-secondary-700">{amenity.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-3">
        <h4 className="font-medium text-secondary-800">Alquiler de Equipamiento</h4>
        <div className="space-y-3">
          {[
            { key: 'Jersey', label: 'Chalecos', placeholder: '10' },
            { key: 'Ball', label: 'Pelotas', placeholder: '5' },
            { key: 'Cone', label: 'Conos', placeholder: '3' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <label className="flex items-center space-x-3 flex-1">
                <input
                  type="checkbox"
                  name={`equipment.has${item.key}Rental`}
                  checked={equipment[`has${item.key}Rental`] || false}
                  onChange={onEquipmentChange}
                  className="w-5 h-5 text-primary-600 border-2 border-secondary-300 rounded focus:ring-primary-500"
                  disabled={isLoading}
                />
                <span className="text-sm font-medium text-secondary-700">
                  Alquiler de {item.label}
                </span>
              </label>
              {equipment[`has${item.key}Rental`] && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-secondary-600">S/</span>
                  <input
                    type="number"
                    name={`equipment.${item.key.toLowerCase()}Price`}
                    value={equipment[`${item.key.toLowerCase()}Price`] || ''}
                    onChange={onEquipmentChange}
                    placeholder={item.placeholder}
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
