import React, { useState, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet'
import { MapPin, Navigation, Search, AlertCircle, CheckCircle } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix para los iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Icono personalizado para nueva cancha
const newFieldIcon = L.divIcon({
  className: 'custom-marker',
  html: `
    <div style="
      background: #22c55e;
      width: 40px;
      height: 40px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        transform: rotate(45deg);
        color: white;
        font-size: 18px;
        font-weight: bold;
      ">📍</div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
})

// Componente para manejar clicks en el mapa
const MapClickHandler = ({ onLocationSelect, position }) => {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng

      // Verificar que esté dentro del Perú (coordenadas aproximadas)
      if (lat < -18.5 || lat > 0 || lng < -81.5 || lng > -68.5) {
        return onLocationSelect({
          error: 'La ubicación debe estar dentro del territorio peruano',
        })
      }

      try {
        // Geocodificación inversa usando Nominatim
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&accept-language=es`
        )
        const data = await response.json()

        let address = 'Dirección no encontrada'
        let location = 'Ubicación desconocida'
        let geoData = null

        if (data.display_name) {
          address = data.display_name

          // Extraer información geográfica de Nominatim
          const addressParts = data.address
          if (addressParts) {
            // Distrito puede estar en varios campos
            const district =
              addressParts.suburb ||
              addressParts.city_district ||
              addressParts.municipality ||
              addressParts.village ||
              addressParts.town ||
              addressParts.city ||
              addressParts.neighbourhood

            // Provincia puede estar en varios campos O puede ser el mismo que city
            const province =
              addressParts.county ||
              addressParts.province ||
              addressParts.city || // A veces city es la provincia
              addressParts.town ||
              addressParts.state_district

            // Departamento está en state
            const department = addressParts.state || addressParts.region

            geoData = {
              district: district,
              province: province,
              department: department,
              country: addressParts.country,
              // Guardar datos raw para debugging
              _raw: addressParts,
            }

            if (addressParts.suburb || addressParts.neighbourhood) {
              location = addressParts.suburb || addressParts.neighbourhood
            } else if (addressParts.city || addressParts.town) {
              location = addressParts.city || addressParts.town
            } else if (addressParts.state) {
              location = addressParts.state
            }
          }
        }

        // Verificar que sea Perú
        if (geoData && geoData.country !== 'Perú' && geoData.country !== 'Peru') {
          return onLocationSelect({
            error: 'La ubicación debe estar dentro del territorio peruano',
          })
        }

        onLocationSelect({
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          address: address,
          location: location,
          geoData: geoData, // Pasar datos geográficos para buscar en BD
          success: true,
        })
      } catch (error) {
        onLocationSelect({
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          address: 'Error al obtener dirección',
          location: 'Ubicación seleccionada',
          success: true,
          warning: 'No se pudo obtener la dirección automáticamente',
        })
      }
    },
  })

  return position ? (
    <Marker position={[position.lat, position.lng]} icon={newFieldIcon}>
      <Popup>
        <div className="text-center">
          <p className="font-semibold text-green-700">Nueva Cancha</p>
          <p className="text-sm text-secondary-600">
            {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </p>
        </div>
      </Popup>
    </Marker>
  ) : null
}

const MapSelector = ({ onLocationSelect, selectedLocation }) => {
  const [searchAddress, setSearchAddress] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const mapRef = useRef()

  // Centro del Perú (aproximadamente Lima)
  const peruCenter = [-12.0464, -77.0428]

  const handleAddressSearch = async () => {
    if (!searchAddress.trim()) return

    setIsSearching(true)
    setSearchError('')

    try {
      // Buscar dirección con Nominatim, limitado a Perú
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchAddress + ', Perú')}&format=json&limit=5&addressdetails=1&accept-language=es`
      )
      const results = await response.json()

      if (results.length === 0) {
        setSearchError('No se encontraron resultados para esa dirección')
        return
      }

      const result = results[0]
      const lat = parseFloat(result.lat)
      const lng = parseFloat(result.lon)

      // Verificar que esté en Perú
      if (lat < -18.5 || lat > 0 || lng < -81.5 || lng > -68.5) {
        setSearchError('La dirección debe estar en el territorio peruano')
        return
      }

      // Extraer información geográfica
      let geoData = null
      const addressParts = result.address
      if (addressParts) {
        const district =
          addressParts.suburb ||
          addressParts.city_district ||
          addressParts.municipality ||
          addressParts.village ||
          addressParts.town ||
          addressParts.city ||
          addressParts.neighbourhood

        const province =
          addressParts.county ||
          addressParts.province ||
          addressParts.city ||
          addressParts.town ||
          addressParts.state_district

        const department = addressParts.state || addressParts.region

        geoData = {
          district: district,
          province: province,
          department: department,
          country: addressParts.country,
          _raw: addressParts,
        }
      }

      // Centrar mapa en la ubicación encontrada
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 15)
      }

      onLocationSelect({
        latitude: lat.toFixed(6),
        longitude: lng.toFixed(6),
        address: result.display_name,
        location: result.address?.suburb || result.address?.city || 'Ubicación encontrada',
        geoData: geoData,
        success: true,
      })
    } catch (error) {
      setSearchError('Error al buscar la dirección')
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddressSearch()
    }
  }

  return (
    <div className="space-y-4">
      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">Seleccionar Ubicación</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • <strong>Opción 1:</strong> Busca una dirección y haz clic en "Buscar"
              </li>
              <li>
                • <strong>Opción 2:</strong> Haz clic directamente en el mapa donde quieres ubicar
                la cancha
              </li>
              <li>
                • Se autocompletarán las coordenadas, dirección y ubicación (departamento,
                provincia, distrito)
              </li>
              <li>• Puedes modificar manualmente los campos si la detección no es precisa</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Búsqueda de dirección */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-secondary-700">
          Buscar Dirección en Perú
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 border-2 border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 transition-colors duration-200"
            placeholder="Ej: Jr. Lima 234, Abancay o Av. Arequipa 123, Lima"
            disabled={isSearching}
          />
          <button
            onClick={handleAddressSearch}
            disabled={isSearching || !searchAddress.trim()}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-secondary-300 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>{isSearching ? 'Buscando...' : 'Buscar'}</span>
          </button>
        </div>
        {searchError && (
          <p className="text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {searchError}
          </p>
        )}
      </div>

      {/* Mapa */}
      <div className="relative">
        <div className="h-96 rounded-lg overflow-hidden border-2 border-secondary-200">
          <MapContainer center={peruCenter} zoom={6} className="w-full h-full" ref={mapRef}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler
              onLocationSelect={onLocationSelect}
              position={
                selectedLocation
                  ? {
                      lat: parseFloat(selectedLocation.latitude),
                      lng: parseFloat(selectedLocation.longitude),
                    }
                  : null
              }
            />
          </MapContainer>
        </div>

        {/* Indicador de carga */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2">
          <div className="flex items-center space-x-2 text-sm">
            <Navigation className="w-4 h-4 text-primary-600" />
            <span className="text-secondary-700">Click para ubicar</span>
          </div>
        </div>
      </div>

      {/* Ubicación seleccionada */}
      {selectedLocation && selectedLocation.success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-green-800 mb-1">Ubicación Seleccionada</h4>
              <div className="text-sm text-green-700 space-y-1">
                <p>
                  <strong>Coordenadas:</strong> {selectedLocation.latitude},{' '}
                  {selectedLocation.longitude}
                </p>
                <p>
                  <strong>Dirección:</strong> {selectedLocation.address}
                </p>
                <p>
                  <strong>Ubicación:</strong> {selectedLocation.location}
                </p>
              </div>
              {selectedLocation.warning && (
                <p className="text-xs text-amber-600 mt-2 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {selectedLocation.warning}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapSelector
