import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { MapPin, Navigation, Map, Search, X, ChevronDown } from 'lucide-react'
import useLocationPicker from '../../hooks/useLocationPicker'

/**
 * Componente para manejar clicks en el mapa
 */
const LocationPicker = ({ position, onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng
      onLocationSelect([lat, lng])
    },
  })

  return position ? <Marker position={position} /> : null
}

/**
 * Componente para centrar el mapa cuando cambian las coordenadas
 */
const MapCenterController = ({ center, zoom }) => {
  const map = useMap()

  useEffect(() => {
    if (center && center.length === 2) {
      map.setView(center, zoom || 15)
    }
  }, [center, zoom, map])

  return null
}

/**
 * Componente de mapa interactivo con búsqueda y geolocalización
 */
const LocationMap = ({ coordinates, currentAddress, onLocationUpdate }) => {
  // Estado para controlar si el mapa está expandido (solo afecta mobile)
  const [isMapExpanded, setIsMapExpanded] = useState(false)

  const {
    searchQuery,
    isSearching,
    searchResults,
    showSearchResults,
    isLoadingLocation,
    setSearchQuery,
    handleLocationSelect,
    handleSearchAddress,
    handleSelectSearchResult,
    handleGetCurrentLocation,
    closeSearchResults,
  } = useLocationPicker(onLocationUpdate)

  // Wrapper para manejar selección en el mapa
  const handleMapClick = (coords) => {
    handleLocationSelect(coords, currentAddress)
  }

  return (
    <div className="border-2 border-primary-200 rounded-xl overflow-hidden bg-gradient-to-br from-primary-50 to-white">
      {/* Header - Siempre visible, clickeable en mobile para collapse */}
      <button
        type="button"
        onClick={() => setIsMapExpanded(!isMapExpanded)}
        className="w-full p-4 sm:p-5 flex items-start gap-3 active:bg-primary-100 transition-colors lg:cursor-default lg:pointer-events-none"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>

        <div className="flex-1 text-left">
          <h3 className="text-base sm:text-lg font-bold text-secondary-900 mb-1">
            Ubicación del Negocio en el Mapa
          </h3>
          <p className="text-xs sm:text-sm text-secondary-600 leading-relaxed">
            Selecciona la ubicación exacta de tu negocio en el mapa. Esto ayudará a los clientes a
            encontrarte fácilmente.
          </p>
        </div>

        {/* Indicador de collapse - Solo visible en mobile */}
        <ChevronDown
          className={`w-5 h-5 sm:w-6 sm:h-6 text-secondary-400 transition-transform duration-200 lg:hidden ${
            isMapExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Contenido colapsible - Hidden en mobile por defecto, siempre visible en desktop */}
      <div
        className={`p-4 sm:p-5 bg-white border-t-2 border-primary-100 ${
          isMapExpanded ? 'block' : 'hidden lg:block'
        }`}
      >
        {/* Buscador de direcciones */}
        <div className="mb-3 sm:mb-4">
          <label className="block mb-2 text-xs sm:text-sm font-medium text-secondary-700">
            🔍 Buscar Dirección
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearchAddress()
                  }
                }}
                placeholder="Ej: Abancay, Apurímac"
                className="w-full px-3 sm:px-4 py-2 pr-10 text-sm border-2 border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-secondary-400" />
            </div>
            <button
              type="button"
              onClick={handleSearchAddress}
              disabled={isSearching || !searchQuery.trim()}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  <span className="text-sm">Buscando...</span>
                </>
              ) : (
                <span className="text-sm">Buscar</span>
              )}
            </button>
          </div>

          {/* Resultados de búsqueda */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="mt-2 bg-white border-2 border-primary-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2">
                <div className="flex items-center justify-between px-3 py-2 border-b border-secondary-200">
                  <span className="text-sm font-semibold text-secondary-900">
                    Resultados encontrados ({searchResults.length})
                  </span>
                  <button
                    onClick={closeSearchResults}
                    className="text-secondary-400 hover:text-secondary-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectSearchResult(result)}
                    className="w-full text-left px-3 py-2 hover:bg-primary-50 transition-colors rounded flex items-start gap-2"
                  >
                    <MapPin className="w-4 h-4 text-primary-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-secondary-900">
                        {result.display_name.split(',')[0]}
                      </p>
                      <p className="text-xs text-secondary-600">{result.display_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-3 sm:mb-4">
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLoadingLocation}
            className="flex items-center justify-center px-3 sm:px-4 py-2 text-sm sm:text-base text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Navigation className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{isLoadingLocation ? 'Obteniendo...' : 'Mi Ubicación Actual'}</span>
          </button>

          <div className="flex items-center justify-center px-3 py-2 text-xs sm:text-sm bg-white border rounded-lg border-secondary-300">
            <Map className="w-4 h-4 mr-2 text-secondary-500 flex-shrink-0" />
            <span>Haz click en el mapa para ajustar</span>
          </div>
        </div>

        {/* Mapa interactivo */}
        <div className="overflow-hidden border-2 rounded-lg border-secondary-200">
          <MapContainer
            center={coordinates}
            zoom={15}
            style={{ height: '300px', width: '100%' }}
            className="sm:!h-[400px]"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapCenterController center={coordinates} zoom={15} />
            <LocationPicker position={coordinates} onLocationSelect={handleMapClick} />
          </MapContainer>
        </div>

        {/* Información de coordenadas */}
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-blue-900">Latitud</label>
              <p className="text-xs sm:text-sm font-mono text-blue-700 break-all">
                {coordinates[0].toFixed(6)}
              </p>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-blue-900">Longitud</label>
              <p className="text-xs sm:text-sm font-mono text-blue-700 break-all">
                {coordinates[1].toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationMap
