import React from 'react'
import LocationMap from './LocationMap'
import SportCard from './SportCard'
import SportsErrorBoundary from './SportsErrorBoundary'
import SportsSkeletonLoader from './SportsSkeletonLoader'
import { getSportName } from '../../services/sportsService'

/**
 * Paso 3: Información del Negocio
 */
const BusinessInfoStep = ({
  formData,
  errors,
  onInputChange,
  onLocationUpdate,
  availableSportTypes = [],
  loadingSportTypes = false,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="mb-4 text-xl font-semibold text-secondary-900">Información del Negocio</h2>

      {/* Nombre del Negocio */}
      <div>
        <label className="block mb-2 text-sm font-medium text-secondary-700">
          Nombre del Negocio/Complejo
        </label>
        <input
          type="text"
          name="businessName"
          value={formData.businessName}
          onChange={onInputChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
            errors.businessName ? 'border-red-500' : 'border-secondary-300'
          }`}
          placeholder="Complejo Deportivo Los Campeones"
        />
        {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>}
      </div>

      {/* RUC */}
      <div>
        <label className="block mb-2 text-sm font-medium text-secondary-700">RUC (Opcional)</label>
        <input
          type="text"
          name="businessRuc"
          value={formData.businessRuc}
          onChange={onInputChange}
          maxLength="11"
          className="w-full px-4 py-2 border rounded-lg border-secondary-300 focus:ring-2 focus:ring-primary-500"
          placeholder="20123456789"
        />
      </div>

      {/* Selector de tipos de deporte */}
      <div>
        <label className="block mb-3 text-sm font-medium text-secondary-700">
          ¿Qué tipo de canchas vas a registrar? *
        </label>
        <p className="mb-3 text-xs text-secondary-500">
          Selecciona todos los tipos de deporte que ofreces en tu complejo
        </p>

        <SportsErrorBoundary>
          {loadingSportTypes ? (
            <SportsSkeletonLoader count={8} showHeader={false} />
          ) : (
            <>
              <div
                className="gap-4 md:gap-5 lg:gap-6 xl:gap-7 max-w-7xl mx-auto"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gridAutoRows: '1fr',
                }}
              >
                {availableSportTypes.map((sport) => {
                  // Usar getSportName para normalizar el nombre (igual que SportCard)
                  const sportName = getSportName(sport)

                  return (
                    <SportCard
                      key={sportName}
                      sport={sport}
                      isSelected={formData.sportTypes.includes(sportName)}
                      onToggle={(selectedSportName) =>
                        onInputChange({
                          target: {
                            name: 'sportTypes',
                            value: selectedSportName,
                            type: 'checkbox',
                            checked: !formData.sportTypes.includes(selectedSportName),
                          },
                        })
                      }
                      disabled={loadingSportTypes}
                    />
                  )
                })}
              </div>
              {errors.sportTypes && (
                <p className="mt-2 text-sm text-red-600">{errors.sportTypes}</p>
              )}
              {formData.sportTypes.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✓ Seleccionados: <strong>{formData.sportTypes.join(', ')}</strong>
                  </p>
                </div>
              )}
            </>
          )}
        </SportsErrorBoundary>
      </div>

      {/* Mapa de ubicación */}
      <LocationMap
        coordinates={formData.businessCoordinates}
        currentAddress={formData.businessAddress}
        onLocationUpdate={onLocationUpdate}
      />

      {/* Dirección del Negocio */}
      <div>
        <label className="block mb-2 text-sm font-medium text-secondary-700">
          Dirección del Negocio
        </label>
        <input
          type="text"
          name="businessAddress"
          value={formData.businessAddress}
          onChange={onInputChange}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 ${
            errors.businessAddress ? 'border-red-500' : 'border-secondary-300'
          }`}
          placeholder="Av. Los Deportistas 123, Abancay"
        />
        {errors.businessAddress && (
          <p className="mt-1 text-sm text-red-600">{errors.businessAddress}</p>
        )}
        <p className="mt-1 text-xs text-green-600">
          💡 La dirección se autocompletará al seleccionar una ubicación en el mapa
        </p>
      </div>

      {/* Teléfono del Negocio */}
      <div>
        <label className="block mb-2 text-sm font-medium text-secondary-700">
          Teléfono del Negocio (Opcional)
        </label>
        <input
          type="tel"
          name="businessPhone"
          value={formData.businessPhone}
          onChange={onInputChange}
          className="w-full px-4 py-2 border rounded-lg border-secondary-300 focus:ring-2 focus:ring-primary-500"
          placeholder="083-321123 o 999888777"
        />
      </div>

      {/* Referencia de Ubicación */}
      <div>
        <label className="block mb-2 text-sm font-medium text-secondary-700">
          Referencia de Ubicación (Opcional)
        </label>
        <textarea
          name="businessReference"
          value={formData.businessReference}
          onChange={onInputChange}
          rows="2"
          className="w-full px-4 py-2 border rounded-lg border-secondary-300 focus:ring-2 focus:ring-primary-500"
          placeholder="Frente al parque central, al lado del banco, cerca del mercado..."
        />
        <p className="mt-1 text-xs text-secondary-500">
          Describe puntos de referencia que ayuden a ubicar tu negocio
        </p>
      </div>
    </div>
  )
}

export default BusinessInfoStep
